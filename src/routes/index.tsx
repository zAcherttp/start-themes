import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import ThemePopover from "@/components/theme-popover";
import { buttonVariants } from "@/components/ui/button";
import { type AppPreset, useTheme } from "@/hooks/use-themes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Home,
});

const presetGradients: Record<AppPreset, string> = {
  shadcn: "from-blue-500 to-teal-400",
  ocean: "from-blue-400 to-cyan-400",
  aspen: "from-lime-500 to-emerald-400",
  ruby: "from-rose-500 to-pink-400",
  catppuccin: "from-purple-500 to-indigo-400",
};

const presetBgs: Record<AppPreset, string> = {
  shadcn: "bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50",
  ocean: "bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50",
  aspen: "bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-50",
  ruby: "bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50",
  catppuccin:
    "bg-slate-50 dark:bg-[#11111b] text-slate-900 dark:text-[#cdd6f4]",
};

const presetGrids: Record<AppPreset, string> = {
  shadcn:
    "bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]",
  ocean:
    "bg-[linear-gradient(to_right,#3b82f61a_1px,transparent_1px),linear-gradient(to_bottom,#3b82f61a_1px,transparent_1px)]",
  aspen:
    "bg-[linear-gradient(to_right,#84cc161a_1px,transparent_1px),linear-gradient(to_bottom,#84cc161a_1px,transparent_1px)]",
  ruby: "bg-[linear-gradient(to_right,#f43f5e1a_1px,transparent_1px),linear-gradient(to_bottom,#f43f5e1a_1px,transparent_1px)]",
  catppuccin:
    "bg-[linear-gradient(to_right,#a855f71a_1px,transparent_1px),linear-gradient(to_bottom,#a855f71a_1px,transparent_1px)]",
};

function Home() {
  const { presetPreference } = useTheme();

  const gradient = presetGradients[presetPreference];
  const bg = presetBgs[presetPreference];
  const grid = presetGrids[presetPreference];

  return (
    <main
      className={`relative flex min-h-screen overflow-hidden flex-col items-center justify-center p-8 transition-colors duration-500 ${bg}`}
    >
      <div className="z-10 flex flex-col items-center max-w-2xl text-center space-y-8">
        <div className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-secondary-foreground backdrop-blur-sm align-middle">
          use-theme showcase
        </div>

        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          TanStack Start
          <br />
          <span
            className={`text-transparent bg-clip-text bg-linear-to-r ${gradient} transition-colors duration-500`}
          >
            Theming
          </span>
        </h1>

        <p className="text-lg opacity-70 max-w-140 transition-opacity">
          A flawless, hydration-safe, cross-tab synced theme hook wrapped in the
          native View Transitions API. Built exclusively for TanStack Router.
        </p>

        <div className="relative flex flex-row items-center gap-2.5 rounded-3xl p-2.5">
          <div className="absolute inset-0 rounded-3xl border border-border bg-background shadow-xs" />
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250vw] h-[250vh] -z-10 pointer-events-none bg-size-[30px_30px] bg-center ${grid}`}
          />
          <div className="relative z-10">
            <ThemePopover />
          </div>
          <Link
            to="/docs/$"
            params={{
              _splat: "",
            }}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "relative z-10 rounded-[12px] bg-background",
            )}
          >
            <div className="flex items-center gap-2 px-1 text-secondary-foreground">
              useTheme Hook <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
