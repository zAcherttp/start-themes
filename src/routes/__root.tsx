import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import * as React from "react";
import { getThemeServerFn, themeScript } from "@/hooks/use-themes";
import appCss from "@/styles/app.css?url";

interface MyRouterContext {
	theme: "light" | "dark" | "auto";
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
				title: "Fumadocs on TanStack Start",
			},
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: theming script */}
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
				<HeadContent />
			</head>
			<body className="flex min-h-screen flex-col antialiased font-sans">
				<RootProvider theme={{ enabled: false }}>{children}</RootProvider>
				<Scripts />
			</body>
		</html>
	);
}
