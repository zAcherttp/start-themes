import { useTheme, type AppMode } from "@/hooks/use-themes";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import { Monitor, Moon, Sun } from "lucide-react";

const getIcon = (mode: AppMode) => {
  switch (mode) {
    case "light":
      return <Sun className="size-4" />;
    case "dark":
      return <Moon className="size-4" />;
    default:
      return <Monitor className="size-4" />;
  }
};

export default function ThemeSelect() {
  const { modePreference, setMode } = useTheme();

  return (
    <Select
      value={modePreference}
      onValueChange={(value) => setMode(value as AppMode)}
    >
      <SelectTrigger
        className="w-full capitalize rounded-[12px]"
        aria-label="Select Theme Mode"
      >
        {getIcon(modePreference)}
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="light">
            <Sun className="size-4" />
            Light
          </SelectItem>
          <SelectItem value="dark">
            <Moon className="size-4" />
            Dark
          </SelectItem>
          <SelectItem value="auto">
            <Monitor className="size-4" />
            Auto
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
