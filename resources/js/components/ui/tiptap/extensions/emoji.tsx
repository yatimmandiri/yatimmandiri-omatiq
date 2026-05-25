import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import data from "@emoji-mart/data";
import Picker from '@emoji-mart/react';
import { SmileIcon } from "lucide-react";
import { useToolbar } from "../toolbars/toolbar-provider";

const EmojiPicker = ({ onSelect }: { onSelect: (emoji: any) => void }) => {
    return (
        <div className="w-full rounded-md">
            <Picker
                data={data}
                theme="light"
                onEmojiSelect={onSelect}
            />
        </div>
    );
};

export const EmojiToolbar = () => {
  const { editor } = useToolbar();

  const addEmoji = (emoji: any) => {
    editor?.chain().focus().insertContent(emoji.native).run();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label="Insert Emoji">
          <SmileIcon className="mr-2 size-4" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-1 bg-white shadow-lg border rounded-md">
        <EmojiPicker onSelect={addEmoji} />
      </PopoverContent>
    </Popover>
  );
};
