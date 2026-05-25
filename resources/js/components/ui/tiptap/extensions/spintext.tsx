import { SplitIcon, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../../button";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";
import { useToolbar } from "../toolbars/toolbar-provider";

export const SpinTextToolbar = () => {
  const { editor } = useToolbar();

  const [inputValue, setInputValue] = useState("");
  const [words, setWords] = useState<string[]>([]);

  const handleAddWord = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !words.includes(trimmed)) {
      setWords([...words, trimmed]);
      setInputValue("");
    }
  };

  const handleRemoveWord = (word: string) => {
    setWords(words.filter((w) => w !== word));
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddWord();
    }
  };

  const handleTambahSpintax = () => {
    if (!editor || words.length === 0) return;

    const spintax = `{{${words.join("|")}}}`;
    editor.chain().focus().insertContent(spintax).run();
    setWords([]);
    setInputValue("");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Spin Text"
        >
          <SplitIcon className="mr-2 size-4" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4 bg-white border rounded-lg shadow-lg">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">Spin Text</label>

          <div className="flex flex-col gap-2 p-2 border rounded-md bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {words.map((word) => (
                <div
                  key={word}
                  className="flex items-center bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 text-sm transition hover:bg-indigo-200"
                >
                  <span>{word}</span>
                  <X
                    size={14}
                    className="ml-2 cursor-pointer text-indigo-600 hover:text-indigo-800 transition"
                    onClick={() => handleRemoveWord(word)}
                  />
                </div>
              ))}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tambahkan kata..."
                className="flex-1 min-w-[100px] bg-transparent outline-none text-sm px-1 py-1 placeholder-gray-400"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleTambahSpintax}
            disabled={words.length === 0}
          >
            Tambah Spin Text
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
