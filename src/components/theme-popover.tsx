import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
} from "@/components/ui/popover";
import { Palette } from "lucide-react";
import ThemeSelect from "./theme-select";
import PresetSelect from "./preset-select";
import { Button } from "@/components/ui/button";

export default function ThemePopover() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="rounded-[12px] size-10 text-fd-secondary-foreground"
          >
            <Palette className="size-5" strokeWidth={1.6} />
          </Button>
        }
        aria-label="Theme Settings"
      ></PopoverTrigger>
      <PopoverContent
        className="w-58 rounded-3xl bg-background ring-0 border border-border"
        align={"start"}
        side={"bottom"}
        sideOffset={20}
        alignOffset={-8}
      >
        <PopoverHeader className="text-xs font-medium px-1">
          Color Preset
        </PopoverHeader>
        <PresetSelect />
        <PopoverHeader className="text-xs font-medium px-1">
          Theme Mode
        </PopoverHeader>
        <ThemeSelect />
      </PopoverContent>
    </Popover>
  );
}
