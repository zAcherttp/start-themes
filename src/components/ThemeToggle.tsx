import { useTheme } from "@/hooks/use-themes";

export default function ThemeToggle() {
	const { themePreference, themeDisplayName, nextTheme } = useTheme();

	const label =
		themePreference === "auto"
			? `Theme mode: ${themeDisplayName} (system). Click to switch to the next mode.`
			: `Theme mode: ${themeDisplayName}. Click to switch mode.`;

	return (
		<button
			type="button"
			onClick={nextTheme}
			aria-label={label}
			title={label}
			className="select-none rounded-full px-3 py-1.5 text-sm font-semibold text-(--sea-ink) shadow-[0_8px_22px_rgba(30,90,72,0.08)] transition capitalize"
		>
			{themeDisplayName}
		</button>
	);
}
