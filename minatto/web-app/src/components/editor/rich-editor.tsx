"use client";

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from "@/components/ui/button";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Heading1,
    Heading2
} from "lucide-react";

import { TemplateSelector } from "./templates";
import { AISuggestions } from "./ai-suggestions";

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2 border-b bg-muted/30 p-2 backdrop-blur-sm items-center">
            <TemplateSelector onSelect={(content) => editor.commands.insertContent(content)} />
            <AISuggestions onInsert={(content) => editor.commands.insertContent(content)} />
            <div className="w-px h-6 bg-border mx-1" />
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-accent text-accent-foreground' : ''}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-accent text-accent-foreground' : ''}
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? 'bg-accent text-accent-foreground' : ''}
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-accent text-accent-foreground' : ''}
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-accent text-accent-foreground' : ''}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-accent text-accent-foreground' : ''}
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'bg-accent text-accent-foreground' : ''}
            >
                <Quote className="h-4 w-4" />
            </Button>
            <div className="ml-auto flex gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export function RichEditor({ content = "" }: { content?: string }) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content || '<p>Comece a escrever seu documento aqui...</p>',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none dark:prose-invert min-h-[500px] p-4',
            },
        },
    });

    return (
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
