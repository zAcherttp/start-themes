import {
  useTheme,
  presets,
  presetDisplayNames,
  type AppPreset,
} from "@/hooks/use-themes";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import { Palette } from "lucide-react";

export default function PresetSelect() {
  const { presetPreference, setPreset } = useTheme();

  return (
    <Select
      value={presetPreference}
      onValueChange={(value) => setPreset(value as AppPreset)}
    >
      <SelectTrigger
        className="w-full capitalize rounded-[12px]"
        aria-label="Select Color Preset"
      >
        <Palette className="size-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {presets.map((preset) => (
            <SelectItem key={preset} value={preset}>
              {presetDisplayNames[preset]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
