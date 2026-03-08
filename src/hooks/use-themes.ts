import {
  rootRouteId,
  useRouteContext,
  useRouter,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { useEffect, useLayoutEffect, useState } from "react";
import { flushSync } from "react-dom";
import * as z from "zod";

const themeCookieMaxAge = 60 * 60 * 24 * 365;
const modeStorageKey = "theme-mode";
const presetStorageKey = "theme-preset";
const syncChannel = "theme-sync";

// --- THEME MODES ---
export const modes = ["light", "dark"] as const;
export type Mode = (typeof modes)[number];
export type AppMode = "auto" | Mode;
const modeValidator = z.enum(["auto", ...modes] as [
  string,
  ...string[],
]) as z.ZodType<AppMode>;

// --- THEME PRESETS ---
export const presets = [
  "shadcn",
  "ocean",
  "aspen",
  "ruby",
  "catppuccin",
] as const;
export type AppPreset = (typeof presets)[number];
const presetValidator = z.enum(
  presets as unknown as [string, ...string[]],
) as z.ZodType<AppPreset>;

export const presetDisplayNames: Record<AppPreset, string> = {
  shadcn: "Default (Shadcn)",
  ocean: "Ocean",
  aspen: "Aspen",
  ruby: "Ruby",
  catppuccin: "Catppuccin",
};

export type ThemeState = {
  mode: AppMode;
  preset: AppPreset;
};

// Module-level lock to prevent concurrent View Transitions
let isTransitioning = false;

/**
 * Inline blocking script — injected into <head> before stylesheets to prevent
 * flicker. Reads the cookies and resolves auto via matchMedia before first paint.
 */
const removePresetClasses = presets
  .filter((p) => p !== "shadcn")
  .map((p) => `'${p}'`)
  .join(",");
export const themeScript = `(function(){
	var m=document.cookie.match(/${modeStorageKey}=([^;]+)/);
	var p=document.cookie.match(/${presetStorageKey}=([^;]+)/);
	var sm=m?m[1]:'auto';
	var sp=p?p[1]:'shadcn';
	
	var resMode = sm==='light'||sm==='dark'?sm:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
	var resPreset = ${JSON.stringify(presets)}.includes(sp)?sp:'shadcn';
	
	var e=document.documentElement;
	e.classList.remove('light','dark',${removePresetClasses});
	e.classList.add(resMode);
	if (resPreset !== 'shadcn') {
		e.classList.add(resPreset);
	}
	e.style.colorScheme=resMode;
})();`;

/**
 * Get the theme preferences from the server.
 */
export const getThemeServerFn = createServerFn().handler((): ThemeState => {
  const modeStored = getCookie(modeStorageKey);
  const presetStored = getCookie(presetStorageKey);

  const modeParsed = modeValidator.safeParse(modeStored);
  const presetParsed = presetValidator.safeParse(presetStored);

  return {
    mode: modeParsed.success ? modeParsed.data : "auto",
    preset: presetParsed.success ? presetParsed.data : "shadcn",
  };
});

/**
 * Set the theme mode preference on the server.
 */
export const setModeServerFn = createServerFn()
  .inputValidator(modeValidator)
  .handler(({ data }) => {
    setCookie(modeStorageKey, data, { maxAge: themeCookieMaxAge });
    return data;
  });

/**
 * Set the theme preset preference on the server.
 */
export const setPresetServerFn = createServerFn()
  .inputValidator(presetValidator)
  .handler(({ data }) => {
    setCookie(presetStorageKey, data, { maxAge: themeCookieMaxAge });
    return data;
  });

/**
 * Apply the resolved theme class to <html>.
 */
function applyThemeClasses(resolvedMode: Mode, preset: AppPreset) {
  const el = document.documentElement;

  el.classList.remove(
    "light",
    "dark",
    ...presets.filter((p) => p !== "shadcn"),
  );
  el.classList.add(resolvedMode);
  if (preset !== "shadcn") {
    el.classList.add(preset);
  }
  el.style.colorScheme = resolvedMode;
}

/**
 * Custom hook to manage the application's theme and preset scheme.
 */
export function useTheme(): {
  modePreference: AppMode;
  presetPreference: AppPreset;
  presetDisplayName: string;
  resolvedMode: Mode | null;
  setMode: (value: AppMode) => void;
  setPreset: (value: AppPreset) => void;
  nextMode: () => void;
  nextPreset: () => void;
} {
  // Cast due to structure change, assume route context provides { theme: ThemeState }
  const { theme: serverTheme } = useRouteContext({
    from: rootRouteId,
  }) as unknown as { theme: ThemeState };
  const router = useRouter();
  const [deviceMode, setDeviceMode] = useState<Mode | null>(null);

  // [FEATURE-01]: Always track OS preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setDeviceMode(mq.matches ? "dark" : "light");
    const onChange = () => setDeviceMode(mq.matches ? "dark" : "light");
    update();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const [modePreference, setLocalMode] = useState<AppMode>(
    serverTheme?.mode ?? "auto",
  );
  const [presetPreference, setLocalPreset] = useState<AppPreset>(
    serverTheme?.preset ?? "shadcn",
  );

  // [FEATURE-02]: Sync theme changes across tabs
  useEffect(() => {
    const channel = new BroadcastChannel(syncChannel);
    channel.onmessage = (e) => {
      if (e.data?.type === "mode") {
        const parsed = modeValidator.safeParse(e.data.value);
        if (parsed.success) setLocalMode(parsed.data);
      } else if (e.data?.type === "preset") {
        const parsed = presetValidator.safeParse(e.data.value);
        if (parsed.success) setLocalPreset(parsed.data);
      }
      void router.invalidate();
    };
    return () => channel.close();
  }, [router]);

  // [FEATURE-03]: Sync local state if server state changes
  useEffect(() => {
    if (serverTheme) {
      setLocalMode(serverTheme.mode);
      setLocalPreset(serverTheme.preset);
    }
  }, [serverTheme]);

  // Resolve mode
  const resolvedMode = modePreference === "auto" ? deviceMode : modePreference;

  // [FEATURE-04]: Apply DOM classes
  useLayoutEffect(() => {
    if (!resolvedMode) return;
    applyThemeClasses(resolvedMode, presetPreference);
  }, [resolvedMode, presetPreference]);

  // Shared persist wrapper
  const runWithTransition = (
    updateDom: () => void,
    notifyAndPersist: () => void,
  ) => {
    if (document.startViewTransition) {
      if (isTransitioning) return;
      isTransitioning = true;
      const transition = document.startViewTransition(() => {
        flushSync(updateDom);
      });
      transition.finished.finally(() => {
        isTransitioning = false;
      });
      notifyAndPersist();
    } else {
      updateDom();
      notifyAndPersist();
    }
  };

  const setMode = (value: AppMode) => {
    if (modePreference === value) return;
    runWithTransition(
      () => setLocalMode(value),
      () => {
        void (async () => {
          await setModeServerFn({ data: value });
          const channel = new BroadcastChannel(syncChannel);
          channel.postMessage({ type: "mode", value });
          channel.close();
          void router.invalidate();
        })();
      },
    );
  };

  const setPreset = (value: AppPreset) => {
    if (presetPreference === value) return;
    runWithTransition(
      () => setLocalPreset(value),
      () => {
        void (async () => {
          await setPresetServerFn({ data: value });
          const channel = new BroadcastChannel(syncChannel);
          channel.postMessage({ type: "preset", value });
          channel.close();
          void router.invalidate();
        })();
      },
    );
  };

  const nextMode = () => {
    const available: AppMode[] = [...modes, "auto"];
    const currentIndex = available.indexOf(modePreference);
    setMode(available[(currentIndex + 1) % available.length]);
  };

  const nextPreset = () => {
    const currentIndex = presets.indexOf(presetPreference);
    setPreset(presets[(currentIndex + 1) % presets.length]);
  };

  const presetDisplayName = presetDisplayNames[presetPreference];

  return {
    modePreference,
    presetPreference,
    presetDisplayName,
    resolvedMode,
    setMode,
    setPreset,
    nextMode,
    nextPreset,
  };
}
