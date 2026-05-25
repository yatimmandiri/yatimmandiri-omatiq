import { Node, mergeAttributes } from "@tiptap/core";

export const Iframe = Node.create({
  name: "iframe",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "iframe[data-tiptap-iframe]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      mergeAttributes(HTMLAttributes, {
        "data-tiptap-iframe": "true",
        width: "100%",
        height: "480",
        frameborder: "0",
        allow: "autoplay; fullscreen",
      }),
    ];
  },

  addCommands() {
    return {
      setIframe:
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

// 🧠 TypeScript augmentation (agar tidak error)
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    iframe: {
      setIframe: (options: { src: string }) => ReturnType;
    };
  }
}
