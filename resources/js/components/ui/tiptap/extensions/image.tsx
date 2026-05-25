import Image from "@tiptap/extension-image";
import {
  type NodeViewProps,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Edit,
  ImageIcon,
  Loader2,
  Maximize,
  MoreVertical,
  Trash,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useImageUpload } from "@/hooks/use-image-upload";
import { cn } from "@/lib/utils";

export const ImageExtension = Image.extend({
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: "auto" },
      height: { default: "auto" },
      align: { default: "center" },
      caption: { default: "" },
      aspectRatio: { default: null },
    };
  },

  addNodeView: () => ReactNodeViewRenderer(TiptapImage),
});

function TiptapImage(props: NodeViewProps) {
  const { node, editor, selected, deleteNode, updateAttributes } = props;
  const imageRef = useRef<HTMLImageElement | null>(null);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [resizing, setResizing] = useState(false);
  const [resizePos, setResizePos] = useState<"left" | "right">("right");
  const [resizeInitWidth, setResizeInitWidth] = useState(0);
  const [resizeInitX, setResizeInitX] = useState(0);
  const [caption, setCaption] = useState(node.attrs.caption || "");
  const [editingCaption, setEditingCaption] = useState(false);
  const [openedMore, setOpenedMore] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState(node.attrs.alt || "");

  const { fileInputRef, handleFileChange, handleRemove, uploading, error } =
    useImageUpload({
      onUpload: (url) => {
        updateAttributes({
          src: url,
          alt: altText || fileInputRef.current?.files?.[0]?.name,
        });
        handleRemove();
        setOpenedMore(false);
      },
    });

  /** =============== Resize Logic =============== */
  function startResize(e: MouseEvent | TouchEvent, pos: "left" | "right") {
    e.preventDefault();
    setResizing(true);
    setResizePos(pos);
    const clientX =
      "touches" in e ? e.touches[0]?.clientX ?? 0 : (e as MouseEvent).clientX;
    setResizeInitX(clientX);
    if (imageRef.current) setResizeInitWidth(imageRef.current.offsetWidth);
  }

  function doResize(e: MouseEvent | TouchEvent) {
    if (!resizing) return;

    const clientX =
      "touches" in e ? e.touches[0]?.clientX ?? 0 : (e as MouseEvent).clientX;
    let dx = clientX - resizeInitX;
    if (resizePos === "left") dx = resizeInitX - clientX;

    const newWidth = Math.max(resizeInitWidth + dx, 150);
    const parentWidth = nodeRef.current?.parentElement?.offsetWidth ?? 0;

    if (newWidth < parentWidth && imageRef.current) {
      updateAttributes({ width: `${newWidth}px` });
    }
  }

  function stopResize() {
    setResizing(false);
    setResizeInitX(0);
    setResizeInitWidth(0);
  }

  /** =============== Caption Logic =============== */
  function handleCaptionChange(e: any) {
    setCaption(e.target.value);
  }

  function handleCaptionBlur() {
    updateAttributes({ caption });
    setEditingCaption(false);
  }

  /** =============== Auto-Fix Old Images =============== */
  useEffect(() => {
    if (imageRef.current && !node.attrs.width) {
      const img = imageRef.current;
      const parentWidth = nodeRef.current?.parentElement?.offsetWidth ?? 600;
      const scale = Math.min(1, parentWidth / img.naturalWidth);
      const defaultWidth = Math.floor(img.naturalWidth * scale);
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      updateAttributes({
        width: `${defaultWidth}px`,
        aspectRatio,
      });
    }
  }, [node.attrs.src]);

  /** =============== Resize Event Bindings =============== */
  useEffect(() => {
    const move = (e: any) => doResize(e);
    const end = () => stopResize();
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", end);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", end);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
    };
  }, [resizing, resizePos, resizeInitWidth]);

  /** =============== Delete Image with Backend Cleanup =============== */
  const handleDelete = async () => {
    const src = node.attrs.src;
    if (src) {
      await fetch(route("settings.deletefiles"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN":
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
        },
        body: JSON.stringify({ url: src }),
      });
    }
    deleteNode();
  };

  /** =============== Replace via URL =============== */
  const handleReplaceByUrl = () => {
    if (imageUrl) {
      updateAttributes({ src: imageUrl, alt: altText });
      setImageUrl("");
      setOpenedMore(false);
    }
  };

  /** =============== Render =============== */
  return (
    <NodeViewWrapper
      ref={nodeRef}
      className={cn(
        "relative flex flex-col rounded-md border-2 border-transparent transition-all duration-200 max-w-full",
        selected && "border-blue-300",
        node.attrs.align === "center" && "mx-auto",
        node.attrs.align === "left" && "mr-auto",
        node.attrs.align === "right" && "ml-auto"
      )}
      style={{ width: node.attrs.width ?? "auto" }}
    >
      <div className="group relative flex flex-col rounded-md">
        <figure className="relative m-0 max-w-full overflow-hidden">
          <img
            ref={imageRef}
            src={node.attrs.src}
            alt={node.attrs.alt || ""}
            title={node.attrs.title || ""}
            className="rounded-lg max-w-full h-auto object-contain transition-all"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (!node.attrs.aspectRatio) {
                updateAttributes({
                  aspectRatio: img.naturalWidth / img.naturalHeight,
                });
              }
            }}
          />

          {/* Resize handles */}
          {editor.isEditable && (
            <>
              <div
                className="absolute inset-y-0 left-0 z-20 flex w-[25px] cursor-col-resize items-center justify-start p-2"
                onMouseDown={(e:any) => startResize(e, "left")}
                onTouchStart={(e:any) => startResize(e, "left")}
              >
                <div className="h-[70px] w-1 rounded-xl bg-black/60 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div
                className="absolute inset-y-0 right-0 z-20 flex w-[25px] cursor-col-resize items-center justify-end p-2"
                onMouseDown={(e:any) => startResize(e, "right")}
                onTouchStart={(e:any) => startResize(e, "right")}
              >
                <div className="h-[70px] w-1 rounded-xl bg-black/60 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </>
          )}
        </figure>

        {/* Caption */}
        {editingCaption ? (
          <Input
            value={caption}
            onChange={handleCaptionChange}
            onBlur={handleCaptionBlur}
            onKeyDown={(e) => e.key === "Enter" && handleCaptionBlur()}
            className="mt-2 text-center text-sm text-muted-foreground focus:ring-0"
            placeholder="Add a caption..."
            autoFocus
          />
        ) : (
          <div
            className="mt-2 cursor-text text-center text-sm text-muted-foreground"
            onClick={() => editor?.isEditable && setEditingCaption(true)}
          >
            {caption || "Add a caption..."}
          </div>
        )}

        {/* Toolbar */}
        {editor?.isEditable && (
          <div
            className={cn(
              "absolute right-4 top-4 flex items-center gap-1 rounded-md border bg-background/80 p-1 opacity-0 backdrop-blur transition-opacity",
              !resizing && "group-hover:opacity-100",
              openedMore && "opacity-100"
            )}
          >
            {/* Align */}
            {["left", "center", "right"].map((pos) => (
              <Button
                key={pos}
                size="icon"
                variant="ghost"
                className={cn(
                  "size-7",
                  node.attrs.align === pos && "bg-accent"
                )}
                onClick={() => updateAttributes({ align: pos })}
              >
                {pos === "left" && <AlignLeft className="size-4" />}
                {pos === "center" && <AlignCenter className="size-4" />}
                {pos === "right" && <AlignRight className="size-4" />}
              </Button>
            ))}

            <Separator orientation="vertical" className="h-[20px]" />

            {/* Dropdown */}
            <DropdownMenu open={openedMore} onOpenChange={setOpenedMore}>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="size-7">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                alignOffset={-90}
                className="mt-1 w-56 text-sm"
              >
                <DropdownMenuItem onClick={() => setEditingCaption(true)}>
                  <Edit className="mr-2 size-4" /> Edit Caption
                </DropdownMenuItem>

                {/* Replace Image */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ImageIcon className="mr-2 size-4" /> Replace Image
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="p-2 w-fit min-w-52">
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-xs font-medium">Upload Image</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="replace-image-upload"
                        />
                        <label
                          htmlFor="replace-image-upload"
                          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed p-4 hover:bg-accent"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-4 w-4" />
                              <span>Choose Image</span>
                            </>
                          )}
                        </label>
                        {error && (
                          <p className="mt-2 text-xs text-destructive">
                            {error}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-medium">Or use URL</p>
                        <div className="space-y-2">
                          <Input
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Enter image URL..."
                            className="text-xs"
                          />
                          <Button
                            onClick={handleReplaceByUrl}
                            className="w-full"
                            disabled={!imageUrl}
                            size="sm"
                          >
                            Replace with URL
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Image Size */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Maximize className="mr-2 size-4" /> Image Size
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {[
                      { label: "Small (300px)", width: "300px" },
                      { label: "Medium (500px)", width: "500px" },
                      { label: "Large (700px)", width: "700px" },
                      { label: "Full Width", width: "100%" },
                    ].map((opt) => (
                      <DropdownMenuItem
                        key={opt.label}
                        onClick={() => updateAttributes({ width: opt.width })}
                      >
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash className="mr-2 size-4" /> Delete Image
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
