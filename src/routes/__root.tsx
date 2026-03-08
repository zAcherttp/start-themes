import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import type * as React from "react";
import {
  type AppPreset,
  getThemeServerFn,
  type ThemeState,
  themeScript,
  useTheme,
} from "@/hooks/use-themes";
import appCss from "@/styles/app.css?url";

interface MyRouterContext {
  theme?: ThemeState;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => ({ theme: await getThemeServerFn() }),
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "useTheme on TanStack Start",
      },
      {
        name: "description",
        content:
          "A flawless, hydration-safe, cross-tab synced theme hook wrapped in the native View Transitions API. Built exclusively for TanStack Router.",
      },
      {
        name: "theme-color",
        content: "#ffffff",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon-96x96.png",
        sizes: "96x96",
      },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  component: RootComponent,
});

const presetSelections: Record<AppPreset, string> = {
  shadcn:
    "selection:bg-zinc-900/20 selection:text-zinc-900 dark:selection:bg-zinc-100/20 dark:selection:text-zinc-100",
  ocean:
    "selection:bg-blue-500/30 selection:text-blue-900 dark:selection:bg-blue-400/30 dark:selection:text-blue-50",
  aspen:
    "selection:bg-lime-500/30 selection:text-lime-900 dark:selection:bg-lime-400/30 dark:selection:text-lime-50",
  ruby: "selection:bg-rose-500/30 selection:text-rose-900 dark:selection:bg-rose-400/30 dark:selection:text-rose-50",
  catppuccin:
    "selection:bg-purple-500/30 selection:text-purple-900 dark:selection:bg-purple-400/30 dark:selection:text-purple-50",
};

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { presetPreference } = useTheme();
  const selectionClass = presetSelections[presetPreference];

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: theming script */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body
        className={`flex min-h-screen flex-col antialiased font-sans transition-colors duration-500 ${selectionClass}`}
      >
        <RootProvider theme={{ enabled: false }}>{children}</RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
