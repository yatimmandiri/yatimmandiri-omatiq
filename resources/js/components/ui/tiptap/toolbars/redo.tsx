import { Redo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useToolbar } from "./toolbar-provider";

type ButtonProps = ComponentPropsWithoutRef<typeof Button>;

const RedoToolbar = forwardRef<HTMLButtonElement, ButtonProps>(
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
							editor?.chain().focus().redo().run();
							onClick?.(e);
						}}
						disabled={!editor?.can().chain().focus().redo().run()}
						ref={ref}
						{...props}
					>
						{children ?? <Redo2 className="h-4 w-4" />}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<span>Redo</span>
				</TooltipContent>
			</Tooltip>
		);
	},
);

RedoToolbar.displayName = "RedoToolbar";

export { RedoToolbar };

