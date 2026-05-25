import { cn } from '@/lib/utils';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Typography from '@tiptap/extension-typography';
import { EditorContent, type Extension, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { InfoIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Field, FieldDescription, FieldLabel } from '../ui/field';

import { ImageExtension } from '../ui/tiptap/extensions/image';
import { ImagePlaceholder } from '../ui/tiptap/extensions/image-placeholder';
import SearchAndReplace from '../ui/tiptap/extensions/search-and-replace';

import { EditorToolbar } from '../ui/tiptap/toolbars/editor-toolbar';

const variants: any = {
    default:
        'border-zinc-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10',

    info: 'border-sky-300 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/10',

    success:
        'border-emerald-300 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10',

    warning:
        'border-amber-300 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10',

    danger: 'border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10',
};

interface EditorProps {
    label?: string;
    className?: string;
    value: string;
    errors?: any;
    helperText?: string;
    color?: 'default' | 'info' | 'success' | 'warning' | 'danger';
    handleOnChange: (value: string) => void;
    [key: string]: any;
}

export const EditorComponent = ({
    label,
    className,
    value = '',
    color = 'default',
    errors,
    helperText,
    handleOnChange,
}: EditorProps) => {
    const extensions = [
        StarterKit.configure({
            orderedList: {
                HTMLAttributes: {
                    class: 'list-decimal ml-6',
                },
            },

            bulletList: {
                HTMLAttributes: {
                    class: 'list-disc ml-6',
                },
            },

            heading: {
                levels: [1, 2, 3, 4, 5, 6],
            },
        }),

        Placeholder.configure({
            emptyNodeClass: 'is-editor-empty',

            placeholder: ({ node }) => {
                switch (node.type.name) {
                    case 'heading':
                        return `Heading ${node.attrs.level}`;

                    case 'detailsSummary':
                        return 'Section title';

                    case 'codeBlock':
                        return '';

                    default:
                        return "Write, type '/' for commands";
                }
            },

            includeChildren: false,
        }),

        TextAlign.configure({
            types: ['heading', 'paragraph'],
        }),

        TextStyle,

        Subscript,

        Superscript,

        Color,

        Highlight.configure({
            multicolor: true,
        }),

        ImageExtension,

        ImagePlaceholder,

        SearchAndReplace,

        Typography,
    ];

    const editor = useEditor({
        immediatelyRender: false,

        editable: true,

        extensions: extensions as Extension[],

        content: value || '',

        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-zinc dark:prose-invert',

                    // layout
                    'mx-auto max-w-4xl',

                    // spacing
                    'min-h-[500px]',
                    'px-6 py-6 sm:px-10 sm:py-8 lg:px-14',

                    // typography
                    'text-[16px]',
                    'leading-8',
                    'tracking-normal',

                    // focus
                    'focus:outline-none',

                    // selection
                    'selection:bg-primary/20',

                    // paragraph spacing
                    '[&_p]:my-5',

                    // heading spacing
                    '[&_h1]:mt-10 [&_h1]:mb-6',
                    '[&_h2]:mt-9 [&_h2]:mb-5',
                    '[&_h3]:mt-8 [&_h3]:mb-4',

                    // heading size
                    '[&_h1]:text-4xl',
                    '[&_h1]:font-bold',

                    '[&_h2]:text-3xl',
                    '[&_h2]:font-semibold',

                    '[&_h3]:text-2xl',
                    '[&_h3]:font-semibold',

                    // list spacing
                    '[&_ul]:my-5',
                    '[&_ol]:my-5',
                    '[&_li]:my-2',

                    // blockquote
                    '[&_blockquote]:border-l-4',
                    '[&_blockquote]:border-primary/30',
                    '[&_blockquote]:pl-5',
                    '[&_blockquote]:italic',
                    '[&_blockquote]:my-6',

                    // inline code
                    '[&_code]:rounded-md',
                    '[&_code]:bg-muted',
                    '[&_code]:px-1.5',
                    '[&_code]:py-1',

                    // pre/code block
                    '[&_pre]:rounded-2xl',
                    '[&_pre]:bg-zinc-950',
                    '[&_pre]:p-5',
                    '[&_pre]:my-6',

                    // image
                    '[&_img]:rounded-2xl',
                    '[&_img]:my-6',

                    // hr
                    '[&_hr]:my-10',
                ),
            },
        },

        onUpdate: ({ editor }) => {
            handleOnChange?.(editor.getHTML());
        },
    });

    const isInitialized = useRef(false);

    useEffect(() => {
        if (!editor) return;

        if (!isInitialized.current) {
            editor.commands.setContent(value || '', {
                emitUpdate: false,
            });

            isInitialized.current = true;
        }
    }, [editor]);

    if (!editor) return null;

    return (
        <Field data-invalid={errors}>
            {label && (
                <FieldLabel htmlFor={label} className="mb-2">
                    {label}
                </FieldLabel>
            )}

            <div
                className={cn(
                    'relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200',
                    'max-h-[80dvh]',
                    'overflow-y-auto',
                    'focus-within:shadow-lg',
                    className,
                    variants[color],
                )}
            >
                {/* Toolbar */}
                <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
                    <div className="overflow-x-auto">
                        <div className="min-w-max">
                            <EditorToolbar editor={editor} />
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <EditorContent
                    editor={editor}
                    className={cn(
                        'cursor-text',

                        '[&_.ProseMirror]:min-h-[500px]',
                        '[&_.ProseMirror]:w-full',
                        '[&_.ProseMirror]:focus:outline-none',

                        // placeholder
                        '[&_.is-editor-empty:first-child::before]:pointer-events-none',
                        '[&_.is-editor-empty:first-child::before]:float-left',
                        '[&_.is-editor-empty:first-child::before]:h-0',
                        '[&_.is-editor-empty:first-child::before]:text-muted-foreground',
                        '[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
                    )}
                />
            </div>

            {helperText && (
                <FieldDescription
                    className={cn(
                        'mt-2 flex items-center gap-2',
                        errors ? 'text-red-500' : 'text-muted-foreground',
                    )}
                >
                    <InfoIcon className="h-4 w-4 shrink-0" />

                    <span>{helperText}</span>
                </FieldDescription>
            )}
        </Field>
    );
};
