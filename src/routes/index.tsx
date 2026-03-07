import { createFileRoute, Link } from "@tanstack/react-router";
import ThemeToggle from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
			<div className="z-10 flex flex-col items-center max-w-2xl text-center space-y-8">
				<div className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 px-3 py-1 text-sm font-medium backdrop-blur-sm">
					<span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
					use-themes showcase
				</div>

				<h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
					TanStack Start
					<br />
					<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
						Native Theming
					</span>
				</h1>

				<p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl">
					A flawless, hydration-safe, cross-tab synced theme hook wrapped in the
					native View Transitions API. Built exclusively for TanStack Router.
				</p>

				<div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
					<ThemeToggle />
					<Link
						to="/docs/$"
						params={{
							_splat: "",
						}}
						className="rounded-full bg-zinc-900 dark:bg-zinc-100 px-6 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 shadow-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
					>
						Read the Docs →
					</Link>
				</div>
			</div>
		</main>
	);
}
