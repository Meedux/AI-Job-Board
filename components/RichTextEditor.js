'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Undo,
  Redo,
  Type,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';

const RichTextEditor = ({ content, onChange, placeholder = "Start typing..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 hover:text-blue-300 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none p-4 min-h-[200px] bg-gray-800 text-white placeholder-gray-400',
        'data-placeholder': placeholder,
      },
    },
  });

  if (!editor) {
    return (
      <div className="w-full">
        <div className="flex flex-wrap gap-2 p-3 bg-gray-900 border border-gray-700 rounded-t-lg border-b-0">
          <div className="text-gray-400 text-sm">Loading editor...</div>
        </div>
        <div className="p-4 bg-gray-800 rounded-b-lg border border-gray-700 border-t-0 min-h-[200px] flex items-center justify-center">
          <div className="text-gray-400">Rich text editor loading...</div>
        </div>
      </div>
    );
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertImage = () => {
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setHeading = (level) => {
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 bg-gray-900 border border-gray-700 rounded-t-lg border-b-0">
        {/* Text Formatting */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              editor.isActive('bold') ? 'bg-blue-600 text-white' : 'text-gray-300'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              editor.isActive('italic') ? 'bg-blue-600 text-white' : 'text-gray-300'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </button>
        </div>

        <div className="w-px h-8 bg-gray-600 mx-1" />

        {/* Headings */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setHeading(0)}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              editor.isActive('paragraph') ? 'bg-blue-600 text-white' : 'text-gray-300'
            }`}
            title="Paragraph"
          >
            <Type size={16} />
          </button>
          
          <button
            type="button"
            onClick={() => setHeading(1)}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-blue-600 text-white' : 'text-gray-300'
            }`}
            title="Heading 1"
          >
            <Heading1 size={16} />
          </button>

          <button
            type="button"
            onClick={() => setHeading(2)}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'text-gray-300'
            }`}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </button>

          <button
            type="button"
            onClick={() => setHeading(3)}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-blue-600 text-white' : 'text-gray-300'
            }`}
            title="Heading 3"
          >
            <Heading3 size={16} />
          </button>
        </div>

        <div className="w-px h-8 bg-gray-600 mx-1" />

        {/* Lists */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'text-gray-300'
            }`}
            title="Bullet List"
          >
            <List size={16} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'text-gray-300'
            }`}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </button>
        </div>

        <div className="w-px h-8 bg-gray-600 mx-1" />

        {/* Media */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={addLink}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              editor.isActive('link') ? 'bg-blue-600 text-white' : 'text-gray-300'
            }`}
            title="Add/Edit Link"
          >
            <LinkIcon size={16} />
          </button>

          <button
            type="button"
            onClick={insertImage}
            className="p-2 rounded hover:bg-gray-700 transition-colors text-gray-300"
            title="Insert Image"
          >
            <ImageIcon size={16} />
          </button>
        </div>

        <div className="w-px h-8 bg-gray-600 mx-1" />

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              !editor.can().undo() ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo size={16} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              !editor.can().redo() ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo size={16} />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="bg-gray-800 border border-gray-700 border-t-0 rounded-b-lg relative">
        <EditorContent 
          editor={editor} 
          className="rich-text-editor"
        />
        
        {/* Placeholder when empty */}
        {editor.isEmpty && (
          <div className="absolute top-4 left-4 text-gray-500 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>

      {/* Custom Styles for the Editor */}
      <style jsx global>{`
        .rich-text-editor .ProseMirror {
          outline: none;
          padding: 1rem;
          min-height: 200px;
          color: white;
        }
        
        .rich-text-editor .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
          color: white;
        }
        
        .rich-text-editor .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
          color: white;
        }
        
        .rich-text-editor .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
          color: white;
        }
        
        .rich-text-editor .ProseMirror p {
          margin: 0.5rem 0;
          color: #e5e7eb;
        }
        
        .rich-text-editor .ProseMirror ul, 
        .rich-text-editor .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        
        .rich-text-editor .ProseMirror li {
          margin: 0.25rem 0;
          color: #e5e7eb;
        }
        
        .rich-text-editor .ProseMirror a {
          color: #60a5fa;
          text-decoration: underline;
        }
        
        .rich-text-editor .ProseMirror a:hover {
          color: #93c5fd;
        }
        
        .rich-text-editor .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        
        .rich-text-editor .ProseMirror strong {
          font-weight: bold;
          color: white;
        }
        
        .rich-text-editor .ProseMirror em {
          font-style: italic;
        }
        
        .rich-text-editor .ProseMirror blockquote {
          border-left: 3px solid #374151;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #9ca3af;
        }
        
        .rich-text-editor .ProseMirror code {
          background-color: #374151;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: monospace;
          color: #e5e7eb;
        }
        
        .rich-text-editor .ProseMirror pre {
          background-color: #1f2937;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        
        .rich-text-editor .ProseMirror pre code {
          background: none;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
