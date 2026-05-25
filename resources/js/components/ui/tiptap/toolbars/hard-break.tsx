import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils"; // <- gunakan cn dari utils
import { WrapText } from "lucide-react";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useToolbar } from "./toolbar-provider";

type ButtonProps = ComponentPropsWithoutRef<typeof Button>;

const HardBreakToolbar = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar();

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", className)}
            onClick={(e) => {
              editor?.chain().focus().setHardBreak().run();
              onClick?.(e);
            }}
            ref={ref}
            {...props}
          >
            {children ?? <WrapText className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Hard break</span>
        </TooltipContent>
      </Tooltip>
    );
  }
);

HardBreakToolbar.displayName = "HardBreakToolbar";

export { HardBreakToolbar };
