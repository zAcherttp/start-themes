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
const themeCookieName = "theme";

const storageKey = themeCookieName;
const syncChannel = `${themeCookieName}-sync`;

// Users can define their custom list of themes here.
// By default, "auto" only resolve to dark | light.
// This overrides the default list.
export const themes = ["light", "dark", "black"] as const;

export type Theme = (typeof themes)[number];

export type AppTheme = "auto" | Theme;

export const themeDisplayNames: Record<AppTheme, string> = {
	light: "Light",
	dark: "Dark",
	auto: "Auto",
	black: "Black",	
};

export type AppThemeDisplayName = (typeof themeDisplayNames)[AppTheme];

const themeValidator = z.enum(["auto", ...themes] as [string, ...string[]]) as z.ZodType<AppTheme>;

// Module-level lock to prevent concurrent View Transitions
let isTransitioning = false;

/**
 * Inline blocking script — injected into <head> before stylesheets to prevent
 * flicker. Reads the cookie and resolves auto via matchMedia before first paint.
 */
const removeClasses = ["auto", ...themes].map((t) => `'${t}'`).join(",");
export const themeScript = `(function(){var c=document.cookie.match(/${storageKey}=([^;]+)/);var s=c?c[1]:'auto';var t=${JSON.stringify(themes)}.includes(s)?s:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var e=document.documentElement;e.classList.remove(${removeClasses});e.classList.add(t);e.style.colorScheme=t==='dark'?'dark':'light';})();`;


/**
 * Get the theme preference from the server.
 * @returns The theme preference.
 */
export const getThemeServerFn = createServerFn().handler((): AppTheme => {
	const stored = getCookie(storageKey);
	const parsed = themeValidator.safeParse(stored);
	if (parsed.success) return parsed.data;
	return "auto";
});

/**
 * Set the theme preference on the server.
 * @param value The theme preference.
 */
export const setThemeServerFn = createServerFn()
	.inputValidator(themeValidator)
	.handler(({ data }) => {
		setCookie(storageKey, data, { maxAge: themeCookieMaxAge });
		return data;
	});

/**
 * Apply the resolved theme class to <html>.
 */
function applyThemeClass(resolved: Theme | "light" | "dark") {
	const el = document.documentElement;
	if (el.classList.contains(resolved)) return;
	el.classList.remove(...themes, "light", "dark");
	el.classList.add(resolved);
	el.style.colorScheme = resolved === "dark" ? "dark" : "light";
}

/**
 * Custom hook to manage the application's theme, closely mirroring the behavior of \`next-themes\` in a TanStack Start context.
 *
 * Features:
 * - [FEATURE-01]: Tracks and listens to the local system theme (OS preference).
 * - [FEATURE-02]: Synchronizes theme changes across browser tabs using \`BroadcastChannel\`.
 * - [FEATURE-03]: Keeps local theme state in sync with server state during navigations.
 * - [FEATURE-04]: Applies the resolved theme synchronously to the DOM to prevent FOUC.
 * - [FEATURE-05]: Exposes a setter that persists to the server and utilizes the View Transitions API for smooth cross-fades.
 *
 * @returns An object containing the current \`themePreference\`, the \`resolvedTheme\`, and a \`setTheme\` function to update the theme.
 */
export function useTheme(): {
	themePreference: AppTheme;
	themeDisplayName: AppThemeDisplayName;
	resolvedTheme: Theme | "light" | "dark" | null;
	setTheme: (value: AppTheme) => void;
	nextTheme: () => void;
} {
	const { theme: serverTheme } = useRouteContext({ from: rootRouteId });
	const router = useRouter();
	const [deviceTheme, setDeviceTheme] = useState<"light" | "dark" | null>(null);

	// [FEATURE-01]: Always track OS preference so deviceTheme is never stale.
	useEffect(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const update = () => setDeviceTheme(mq.matches ? "dark" : "light");
		const onChange = () => setDeviceTheme(mq.matches ? "dark" : "light");
		update();
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);

	// [FEATURE-02]: Sync theme changes across tabs
	useEffect(() => {
		const channel = new BroadcastChannel(syncChannel);
		channel.onmessage = (e) => {
			const parsed = themeValidator.safeParse(e.data);
			if (parsed.success) {
				setLocalTheme(parsed.data);
			}
			void router.invalidate();
		};
		return () => channel.close();
	}, [router]);

	// Local theme preference — initialized from server, updated optimistically.
	const [themePreference, setLocalTheme] = useState<AppTheme>(serverTheme);

	// [FEATURE-03]: Sync local state if server state changes via navigation/actions
	useEffect(() => {
		setLocalTheme(serverTheme);
	}, [serverTheme]);

	// Resolve to concrete Theme from local state only.
	const resolvedTheme = themePreference === "auto" ? deviceTheme : themePreference;

	// [FEATURE-04]: Single write path to <html>: useLayoutEffect fires synchronously after
	// React's DOM mutations and before the browser paints.
	useLayoutEffect(() => {
		if (!resolvedTheme) return;
		applyThemeClass(resolvedTheme);
	}, [resolvedTheme]);

	// [FEATURE-05]: Direct server write, View Transition API wrapper, and cross-tab broadcast
	const setTheme = (value: AppTheme) => {
		if (themePreference === value) return;

		const persistAndNotify = () => {
			void (async () => {
				await setThemeServerFn({ data: value });
				const channel = new BroadcastChannel(syncChannel);
				channel.postMessage(value);
				channel.close();
				void router.invalidate();
			})();
		};

		if (document.startViewTransition) {
			// Prevent spamming / concurrent transitions
			if (isTransitioning) return;
			isTransitioning = true;

			const transition = document.startViewTransition(() => {
				flushSync(() => {
					setLocalTheme(value);
				});
			});

			transition.finished.finally(() => {
				isTransitioning = false;
			});

			persistAndNotify();
		} else {
			setLocalTheme(value);
			persistAndNotify();
		}
	};

	const toggleNextTheme = () => {
		const available: AppTheme[] = [...themes, "auto"];
		const currentIndex = available.indexOf(themePreference);
		const nextIndex = (currentIndex + 1) % available.length;
		setTheme(available[nextIndex]);
	};

	const themeDisplayName = themeDisplayNames[themePreference];

	return { themePreference, themeDisplayName, resolvedTheme, setTheme, nextTheme: toggleNextTheme };
}
