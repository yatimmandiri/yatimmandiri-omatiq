import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { FileBox, PencilIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToolbar } from "../toolbars/toolbar-provider";

/* ===================== NodeView React ===================== */
export const GoogleDriveComponent = ({ node, updateAttributes, editor, getPos }: any) => {
  const [src, setSrc] = useState(node.attrs.src || "");
  const [caption, setCaption] = useState(node.attrs.caption || "");
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSrc(node.attrs.src || "");
    setCaption(node.attrs.caption || "");
  }, [node.attrs.src, node.attrs.caption]);

  const convertDriveLinkToPreview = (url: string) => {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
  };

  const handleChangeSrc = (e: any) => setSrc(e.target.value);
  const handleChangeCaption = (e: any) => setCaption(e.target.value);

  const handleSave = () => {
    const previewUrl = convertDriveLinkToPreview(src);
    updateAttributes({ src: previewUrl, caption });
    setSrc(previewUrl);
    setOpen(false);
  };

  const handleDelete = () => {
    if (getPos) {
      const pos = getPos();
      editor.view.dispatch(editor.view.state.tr.deleteRange(pos, pos + node.nodeSize));
    }
  };

  return (
    <NodeViewWrapper className="relative">
      {src ? (
        <iframe src={src} className="w-full h-64" frameBorder="0" allowFullScreen />
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">No URL</div>
      )}

      {/* Popover edit */}
      <div className="absolute top-0 left-0 m-2 z-50" ref={popoverRef}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" size="icon" variant="outline">
                <PencilIcon/>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-4 bg-white border rounded shadow-lg w-64 flex flex-col gap-2">
            <label className="block text-sm font-medium">Caption</label>
            <Input value={caption} onChange={handleChangeCaption} placeholder="Optional caption" />
            <div className="flex justify-between mt-2">
              <Button type="button" onClick={handleSave} className="bg-green-500 text-white px-3 py-1 rounded">Save</Button>
              <Button type="button" onClick={handleDelete} className="bg-red-500 text-white px-3 py-1 rounded">Delete</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {caption && <div className="mt-2 text-center text-gray-600">{caption}</div>}
    </NodeViewWrapper>
  );
};

/* ===================== Node Extension ===================== */
export const GoogleDrive = Node.create({
  name: "googleDrive",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      caption: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'iframe[data-type="google-drive"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(HTMLAttributes, { 'data-type': 'google-drive' })];
  },

  addCommands(): Partial<any> {
    return {
      setGoogleDrive:
        (attrs: { src: string; caption?: string }) =>
        ({ commands }: any) => {
          return commands.insertContent({ type: this.name, attrs });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(GoogleDriveComponent);
  },
});

/* ===================== Toolbar ===================== */
export const GoogleDriveToolbar = () => {
  const { editor } = useToolbar();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");

  if (!editor) return null;

  const handleInsert = () => {
    if (!url) return alert("Masukkan URL Google Drive terlebih dahulu!");

    const match = url.match(/\/d\/([^/]+)\//);
    const id = match ? match[1] : null;
    if (!id) return alert("URL Google Drive tidak valid");

    const embedUrl = `https://drive.google.com/file/d/${id}/preview`;

    editor.chain().focus().setGoogleDrive({ src: embedUrl, caption }).run();

    setUrl("");
    setCaption("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" title="Embed Google Drive File" className="flex items-center justify-center rounded-md p-2 hover:bg-accent">
          <FileBox className="mr-2 size-4" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Google Drive URL</label>
          <Input placeholder="https://drive.google.com/file/d/ID/view" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Caption (opsional)</label>
          <Input placeholder="Tulis keterangan..." value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>

        <Button onClick={handleInsert} className="w-full">Insert Google Drive Embed</Button>
      </PopoverContent>
    </Popover>
  );
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    googleDrive: {
      /**
       * Sisipkan Google Drive embed
       */
      setGoogleDrive: (options: { src: string; caption?: string }) => ReturnType;
    };
  }
}
