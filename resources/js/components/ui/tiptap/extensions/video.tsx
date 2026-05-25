import { Node, NodeViewRendererProps, mergeAttributes } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Edit, Loader2, Maximize, MoreVertical, Replace, Trash, VideoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../dropdown-menu";
import { Input } from "../../input";
import { Label } from "../../label";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";
import { useToolbar } from "../toolbars/toolbar-provider";
import axios from "axios";
import { toast } from "sonner";

// 🧩 Extension Video
export const Video = Node.create({
  name: "video",
  group: "block",
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      caption: { default: "" },
      class: { default: "w-full" },
    };
  },

  parseHTML() {
    return [{ tag: "figure[data-tiptap-video]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["figure", mergeAttributes(HTMLAttributes, { "data-tiptap-video": "true" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoView);
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export const VideoView = ({
    node,
    updateAttributes,
    deleteNode,
  }: NodeViewRendererProps & {
    updateAttributes: (attrs: Record<string, any>) => void;
    deleteNode: () => void;
  }) => {
    // Ambil nilai dari node.attrs (source of truth)
    const { src: nodeSrc, caption: nodeCaption } = node.attrs;

    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [url, setUrl] = useState<string>(nodeSrc || "");
    const [newCaption, setNewCaption] = useState<string>(nodeCaption || "");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
      setUrl(nodeSrc || "");
      setNewCaption(nodeCaption || "");
    }, [nodeSrc, nodeCaption]);

    const handleStartEdit = () => setIsEditing(true);
    const handleCancelEdit = () => {
      setUrl(nodeSrc || "");
      setNewCaption(nodeCaption || "");
      setIsEditing(false);
    };

    const handleSaveEdit = () => {
      if (!url) {
        toast.error("Masukkan URL video terlebih dahulu");
        return;
      }
      updateAttributes({ src: url, caption: newCaption });
      setIsEditing(false);
      setOpen(false);
      toast.success("Video berhasil diperbarui!");
    };

    const handleResize = (size: "small" | "medium" | "large") => {
      let className = "w-full";
      if (size === "small") className = "w-1/3";
      if (size === "medium") className = "w-2/3";
      updateAttributes({ class: className });
      setOpen(false);
    };

    const handleDelete = async () => {
      try {
        setIsDeleting(true);

        // hapus node dari editor
        deleteNode();

        // hapus file dari server kalau local
        if (nodeSrc.includes("/storage/videos/")) {
          console.log("🧾 Menghapus video dari server...");
          await axios.post(route("settings.deletefiles"), { url: nodeSrc });
          toast.success("Video berhasil dihapus dari server");
        } else {
          console.log("ℹ️ Video bukan dari local storage, skip hapus server");
        }
      } catch (error) {
        console.error("Gagal menghapus video:", error);
        toast.error("Gagal menghapus video");
      } finally {
        setIsDeleting(false);
        setOpen(false);
      }
    };


    return (
      <NodeViewWrapper className="relative group my-4">
        <figure
          data-tiptap-video="true"
          className={`relative rounded-md overflow-hidden ${node.attrs.class || "w-full"}`}
        >
          {/* video source */}
          <video src={nodeSrc} controls className="rounded-md w-full" />

          {/* tombol pengaturan */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-72 p-2" align="end">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label>Video URL</Label>
                    <Input value={url} onChange={(e) => setUrl(e.target.value)} />
                  </div>
                  <div>
                    <Label>Caption</Label>
                    <Input value={newCaption} onChange={(e) => setNewCaption(e.target.value)} />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      Batal
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      Simpan
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleStartEdit}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit Video
                  </Button>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleResize("small")}>
                      S
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleResize("medium")}>
                      M
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleResize("large")}>
                      L
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash className="w-4 h-4 mr-2" /> Delete
                      </>
                    )}
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {nodeCaption && (
            <figcaption className="text-sm text-center mt-1 text-muted-foreground">
              {nodeCaption}
            </figcaption>
          )}
        </figure>
      </NodeViewWrapper>
    );
};

// export const VideoView = ({
//   node,
//   updateAttributes,
//   deleteNode,
// }: NodeViewRendererProps & {
//   updateAttributes: (attrs: Record<string, any>) => void;
//   deleteNode: () => void;
// }) => {
//   // ambil nilai dari node.attrs (source of truth)
//   const { src: nodeSrc, caption: nodeCaption } = node.attrs;

//   // local state yang disinkronkan dengan node.attrs
//   const [open, setOpen] = useState(false); // main popover
//   const [isEditing, setIsEditing] = useState(false);
//   const [url, setUrl] = useState<string>(nodeSrc || "");
//   const [newCaption, setNewCaption] = useState<string>(nodeCaption || "");

//   // sinkronisasi saat node.attrs berubah (penting!)
//   useEffect(() => {
//     setUrl(nodeSrc || "");
//     setNewCaption(nodeCaption || "");
//   }, [nodeSrc, nodeCaption]);

//   const handleStartEdit = () => {
//     setIsEditing(true);
//   };

//   const handleCancelEdit = () => {
//     // reset to node values
//     setUrl(nodeSrc || "");
//     setNewCaption(nodeCaption || "");
//     setIsEditing(false);
//   };

//   const handleSaveEdit = () => {
//     // validasi sederhana
//     if (!url) {
//       // bisa ganti dengan toast
//       alert("Masukkan URL video terlebih dahulu");
//       return;
//     }

//     // update node attributes → editor akan merender ulang NodeView dengan node.attrs baru
//     updateAttributes({ src: url, caption: newCaption });
//     setIsEditing(false);
//     setOpen(false);
//   };

//   const handleResize = (size: "small" | "medium" | "large") => {
//     let className = "w-full";
//     if (size === "small") className = "w-1/3";
//     if (size === "medium") className = "w-2/3";
//     updateAttributes({ class: className });
//     setOpen(false);
//   };

//   const handleDelete = () => {
//     deleteNode();
//     setOpen(false);
//   };

//   return (
//     <NodeViewWrapper className="relative group my-4">
//       <figure
//         data-tiptap-video="true"
//         className={`relative rounded-md overflow-hidden ${node.attrs.class || "w-full"}`}
//       >
//         {/* video source comes directly from node.attrs so it follows editor state */}
//         <video src={nodeSrc} controls className="rounded-md w-full" />

//         {/* Popover trigger (tombol ⋮) */}
//         <Popover open={open} onOpenChange={setOpen}>
//           <PopoverTrigger asChild>
//             <Button
//               size="icon"
//               variant="secondary"
//               className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
//             >
//               <MoreVertical className="w-4 h-4" />
//             </Button>
//           </PopoverTrigger>

//           <PopoverContent className="w-72 p-2" align="end">
//             {/* jika mode editing aktif, tampilkan form edit */}
//             {isEditing ? (
//               <div className="space-y-3">
//                 <div>
//                   <Label>Video URL</Label>
//                   <Input value={url} onChange={(e) => setUrl(e.target.value)} />
//                 </div>
//                 <div>
//                   <Label>Caption</Label>
//                   <Input value={newCaption} onChange={(e) => setNewCaption(e.target.value)} />
//                 </div>

//                 <div className="flex justify-end gap-2 pt-2">
//                   <Button variant="outline" size="sm" onClick={handleCancelEdit}>
//                     Batal
//                   </Button>
//                   <Button size="sm" onClick={handleSaveEdit}>
//                     Simpan
//                   </Button>
//                 </div>
//               </div>
//             ) : (
//               // tampilan pilihan aksi
//               <div className="space-y-2">
//                 <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleStartEdit}>
//                   <Edit className="w-4 h-4 mr-2" /> Edit Video
//                 </Button>

//                 <div className="flex gap-1">
//                   <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleResize("small")}>
//                     S
//                   </Button>
//                   <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleResize("medium")}>
//                     M
//                   </Button>
//                   <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleResize("large")}>
//                     L
//                   </Button>
//                 </div>

//                 <Button variant="ghost" size="sm" className="w-full justify-start text-red-600" onClick={handleDelete}>
//                   <Trash className="w-4 h-4 mr-2" /> Delete
//                 </Button>
//               </div>
//             )}
//           </PopoverContent>
//         </Popover>

//         {/* caption */}
//         {nodeCaption && (
//           <figcaption className="text-sm text-center mt-1 text-muted-foreground">{nodeCaption}</figcaption>
//         )}
//       </figure>
//     </NodeViewWrapper>
//   );
// };

// 🧠 Tambahkan ke Tiptap Commands
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string; caption?: string }) => ReturnType;
    };
  }
}

// 🎛️ Toolbar Insert Video
// export const VideoToolbar = () => {
//   const { editor } = useToolbar();
//   const [src, setSrc] = useState("");
//   const [caption, setCaption] = useState("");
//   const [open, setOpen] = useState(false);

//   if (!editor) return null;

//   const insert = () => {
//     if (!src) {
//       alert("Masukkan URL video terlebih dahulu!");
//       return;
//     }

//     editor.chain().focus().setVideo({ src, caption }).run();
//     setSrc("");
//     setCaption("");
//     setOpen(false);
//   };

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button type="button" size="icon" variant="ghost">
//           <VideoIcon className="size-4" />
//         </Button>
//       </PopoverTrigger>

//       <PopoverContent className="grid gap-3 w-80">
//         <div className="space-y-1">
//           <Label htmlFor="video-url">Video URL</Label>
//           <Input
//             id="video-url"
//             placeholder="https://example.com/video.mp4"
//             value={src}
//             onChange={(e) => setSrc(e.target.value)}
//           />
//         </div>

//         <div className="space-y-1">
//           <Label htmlFor="video-caption">Caption (opsional)</Label>
//           <Input
//             id="video-caption"
//             placeholder="Masukkan caption video"
//             value={caption}
//             onChange={(e) => setCaption(e.target.value)}
//           />
//         </div>

//         <div className="flex justify-end gap-2 pt-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => {
//               setSrc("");
//               setCaption("");
//               setOpen(false);
//             }}
//           >
//             Batal
//           </Button>
//           <Button size="sm" onClick={insert}>
//             Insert
//           </Button>
//         </div>
//       </PopoverContent>
//     </Popover>
//   );
// };

export const VideoToolbar = () => {
  const { editor } = useToolbar();
  const [src, setSrc] = useState("");
  const [caption, setCaption] = useState("");
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!editor) return null;

  // 🔹 Konversi YouTube ke embed
  const convertYoutubeUrl = (url: string): string | null => {
    try {
      const youtubeRegex =
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(youtubeRegex);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  // 🔹 Upload file ke Laravel
  const handleUpload = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await axios.post(route("settings.uploadfiles"), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.url) {
        setSrc(response.data.url);
      }
    } catch (error) {
      console.error("Upload gagal:", error);
      alert("Gagal mengunggah video, coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Insert ke editor
  const insert = () => {
    if (!src) {
      alert("Masukkan URL atau upload video terlebih dahulu!");
      return;
    }

    let finalSrc = src.trim();
    const youtubeEmbed = convertYoutubeUrl(finalSrc);

    if (youtubeEmbed) {
      finalSrc = youtubeEmbed;
    } else {
      const videoExtRegex = /\.(mp4|webm|ogg)$/i;
      if (!videoExtRegex.test(finalSrc)) {
        alert("URL tidak valid! Masukkan link video (mp4/webm/ogg).");
        return;
      }
    }

    editor.chain().focus().setVideo({ src: finalSrc, caption }).run();
    setSrc("");
    setCaption("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" size="icon" variant="ghost">
          <VideoIcon className="size-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="grid gap-3 w-80">
        {/* Input URL */}
        <div className="space-y-1">
          <Label htmlFor="video-url">Video URL</Label>
          <Input
            id="video-url"
            placeholder="https://example.com/video.mp4"
            value={src}
            onChange={(e) => setSrc(e.target.value)}
          />
        </div>

        {/* Upload File */}
        <div className="space-y-1">
          <Label htmlFor="video-upload">Upload Video</Label>
          <Input
            id="video-upload"
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
          {uploading && <p className="text-sm text-gray-500">Mengunggah video...</p>}
        </div>

        {/* Caption */}
        <div className="space-y-1">
          <Label htmlFor="video-caption">Caption (opsional)</Label>
          <Input
            id="video-caption"
            placeholder="Masukkan caption video"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {/* Tombol */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSrc("");
              setCaption("");
              setOpen(false);
            }}
          >
            Batal
          </Button>
          <Button size="sm" onClick={insert} disabled={uploading}>
            {uploading ? "Mengunggah..." : "Insert"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// 🎥 Popover Actions di pojok kanan atas video
export const VideoBubbleMenu = () => {
  const { editor } = useToolbar();
  const [open, setOpen] = useState(false);

  if (!editor) return null;

  const selection = editor.state.selection;
  const currentNode =
    selection instanceof NodeSelection ? selection.node : null;
  const currentAttrs = currentNode?.attrs || {};

  const isVideoActive = editor.isActive("video");
  if (!isVideoActive) return null;

  const handleEditCaption = () => {
    const newCaption = prompt("Edit caption:", currentAttrs.caption || "");
    if (newCaption !== null) {
      editor
        .chain()
        .focus()
        .updateAttributes("video", { caption: newCaption })
        .run();
    }
  };

  const handleReplaceVideo = () => {
    const newSrc = prompt("Masukkan URL video baru:", currentAttrs.src || "");
    if (newSrc) {
      editor
        .chain()
        .focus()
        .updateAttributes("video", { src: newSrc })
        .run();
    }
  };

  const handleResize = (size: "small" | "medium" | "large") => {
    let widthClass = "w-full";
    if (size === "small") widthClass = "w-1/3";
    if (size === "medium") widthClass = "w-2/3";
    editor
      .chain()
      .focus()
      .updateAttributes("video", { class: widthClass })
      .run();
  };

  const handleDelete = () => {
    editor.chain().focus().deleteSelection().run();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 bg-background/80 hover:bg-background shadow-sm z-20"
          onClick={() => setOpen(!open)}
        >
          <VideoIcon className="size-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="p-2 w-48 bg-background border rounded-lg shadow-md"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="w-full justify-start"
            >
              <VideoIcon className="mr-2 size-4" /> Video Options
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleEditCaption}>
              <Edit className="mr-2 size-4" /> Edit Caption
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReplaceVideo}>
              <Replace className="mr-2 size-4" /> Replace Video
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Maximize className="mr-2 size-4" /> Video Size
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleResize("small")}>
                  Small
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleResize("medium")}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleResize("large")}>
                  Large
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-500 focus:text-red-500"
            >
              <Trash className="mr-2 size-4" /> Delete Video
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PopoverContent>
    </Popover>
  );
};
