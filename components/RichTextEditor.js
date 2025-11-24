'use client';

// TipTap-based rich text editor implementation replacing Quill.
// Features: headings, bold, italic, underline, strike, lists, blockquote, code, link, image, undo/redo.
// Exposes HTML content via onChange; accepts initial `content` HTML.

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Markdown } from 'tiptap-markdown';
import { lowlight } from 'lowlight';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import cssLang from 'highlight.js/lib/languages/css';
import { useEffect, useState, useRef } from 'react';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, Heading1, Heading2, Heading3, Quote, Code, AlignLeft, AlignCenter, AlignRight, Undo, Redo, Link as LinkIcon, Image as ImageIcon, Eye, EyeOff, Table2, Rows, Columns } from 'lucide-react';
lowlight.registerLanguage('javascript', js);
lowlight.registerLanguage('typescript', ts);
lowlight.registerLanguage('css', cssLang);

/*
  Props:
  - content: initial HTML
  - onChange: callback(html)
  - placeholder: placeholder text
  - showMediaButtons: toggle link/image controls
*/
const RichTextEditor = ({ content = '', onChange, placeholder = 'Start typing...', showMediaButtons = true, maxChars = 5000 }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [markdownMode, setMarkdownMode] = useState(false);
  const [preview, setPreview] = useState(false); // moved above early return to keep hook order stable

  // Formatting controls + state used for auto-spacing and toolbar
  const [lineHeight, setLineHeight] = useState(1.5);
  const [paragraphSpacing, setParagraphSpacing] = useState('0.75rem');
  const lastNormalizedRef = useRef('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: true,
      }),
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty'
      }),
      CharacterCount.configure({ limit: maxChars }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'plaintext', enableTabIndentation: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Markdown.configure({
        tightLists: true,
        bulletListMarker: '-',
        linkify: false
      })
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (typeof onChange === 'function') onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none min-h-[220px]'
      }
    },
    immediatelyRender: false // prevents SSR hydration mismatch warning
  });

  // Sync external content changes (e.g. editing existing job)
  useEffect(() => {
    if (editor && typeof content === 'string' && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  if (!mounted || !editor) return <div className="text-sm text-gray-400">Loading editor...</div>;

  const buttonCls = (active) => `px-2 h-8 flex items-center gap-1 rounded text-xs font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`;

  const addImage = () => {
    const url = window.prompt('Image URL');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const previous = editor.getAttributes('link').href;
    const url = window.prompt('Link URL', previous || 'https://');
    if (url === null) return; // cancelled
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const toggleMarkdown = () => {
    if (!editor) return;
    if (markdownMode) {
      const mdVal = document.getElementById('markdown-editor')?.value || '';
      editor.commands.setContent(mdVal); // treat content as markdown via Markdown extension
      setMarkdownMode(false);
    } else {
      setMarkdownMode(true);
    }
  };
  const getMarkdown = () => {
    try { return editor.storage.markdown.getMarkdown(); } catch { return ''; }
  };
  // Table helpers
  const addTable = () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  const addRow = () => editor.chain().focus().addRowAfter().run();
  const addCol = () => editor.chain().focus().addColumnAfter().run();
  const delRow = () => editor.chain().focus().deleteRow().run();
  const delCol = () => editor.chain().focus().deleteColumn().run();
  const toggleHeaderRow = () => editor.chain().focus().toggleHeaderRow().run();
  const setCodeLang = (lang) => editor.chain().focus().updateAttributes('codeBlock', { language: lang }).run();

  // helper: normalize HTML spacing, remove extra blank paragraphs and collapse extra <br> tags
  const normalizeHtmlSpacing = (html, lh = lineHeight, spacing = paragraphSpacing) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Remove empty paragraphs that have no meaningful children
      Array.from(doc.querySelectorAll('p')).forEach(p => {
        const text = (p.textContent || '').replace(/\u00A0/g, '').trim();
        const hasMeaningful = p.querySelector('img, a, code, table, ul, ol');
        if (!text && !hasMeaningful) p.remove();
      });

      // Collapse multiple sequential <br> into a single <br>
      Array.from(doc.querySelectorAll('*')).forEach(node => {
        if (!node.childNodes || node.childNodes.length < 2) return;
        let changed = false;
        const children = Array.from(node.childNodes);
        for (let i = children.length - 1; i > 0; i--) {
          if (children[i].nodeName === 'BR' && children[i-1].nodeName === 'BR') {
            children[i].remove();
            changed = true;
          }
        }
        if (changed) {
          // no-op
        }
      });

      // Apply line-height and paragraph spacing to paragraphs and list items
      const applyStyle = (el) => {
        if (!el) return;
        const s = el.getAttribute('style') || '';
        const styleMap = new Map();
        s.split(';').map(x => x.trim()).filter(Boolean).forEach(pair => {
          const [k, v] = pair.split(':'); if (k && v) styleMap.set(k.trim(), v.trim());
        });
        styleMap.set('line-height', String(lh));
        styleMap.set('margin-bottom', spacing);
        const newStyle = Array.from(styleMap.entries()).map(([k,v]) => `${k}:${v}`).join('; ');
        el.setAttribute('style', newStyle);
      };

      Array.from(doc.querySelectorAll('p, li')).forEach(applyStyle);

      return doc.body.innerHTML;
    } catch (e) {
      // fallback
      let s = String(html);
      s = s.replace(/(<br\s*\/?>(\s*))+/gi, '<br/>');
      s = s.replace(/<p>(\s|&nbsp;)*<\/p>/gi, '');
      return s;
    }
  };

  // Apply the selected line-height and paragraph spacing globally to the editor wrapper
  const applyLineAndSpacing = (lh, spacing) => {
    const root = document.querySelector('.tiptap-editor');
    if (root) {
      root.style.setProperty('--tiptap-line-height', String(lh));
      root.style.setProperty('--tiptap-paragraph-spacing', spacing);
    }
  };

  // Normalize current editor content and update editor if changed. `force` bypasses identical-check.
  const normalizeAndApply = (force = false) => {
    if (!editor) return;
    const html = editor.getHTML();
    const normalized = normalizeHtmlSpacing(html, lineHeight, paragraphSpacing);
    if (!force && lastNormalizedRef.current && lastNormalizedRef.current === normalized) return;
    if (normalized !== html) {
      try {
        editor.chain().focus().setContent(normalized).run();
        lastNormalizedRef.current = normalized;
      } catch (e) {
        // fall back
        editor.commands.setContent(normalized, false);
        lastNormalizedRef.current = normalized;
      }
    }
  };

  // Make sure selected line/spacing applied to CSS immediately
  useEffect(() => { applyLineAndSpacing(lineHeight, paragraphSpacing); }, [lineHeight, paragraphSpacing]);

  // Auto-normalize pasted content before it is inserted into the editor
  useEffect(() => {
    if (!editor || typeof window === 'undefined') return;

    const dom = editor.view.dom;
    const handler = (e) => {
      try {
        const clipboard = e.clipboardData || window.clipboardData;
        if (!clipboard) return;

        const html = clipboard.getData && clipboard.getData('text/html');
        const plain = clipboard.getData && clipboard.getData('text/plain');

        // Prefer HTML if present so we keep structure (images, formatting)
        if (html) {
          e.preventDefault();
          const normalized = normalizeHtmlSpacing(html, lineHeight, paragraphSpacing);
          // Insert normalized HTML
          editor.chain().focus().insertContent(normalized).run();
          lastNormalizedRef.current = normalized;
        } else if (plain) {
          // Convert plain text into paragraphs safely and normalize
          e.preventDefault();
          // Convert double newlines into paragraphs, single newlines to <br/>
          const htmlFromText = plain
            .split(/\r?\n\r?\n/) // paragraphs
            .map(p => `<p>${p.replace(/\r?\n/g, '<br/>')}</p>`)
            .join('');

          const normalized = normalizeHtmlSpacing(htmlFromText, lineHeight, paragraphSpacing);
          editor.chain().focus().insertContent(normalized).run();
          lastNormalizedRef.current = normalized;
        }
      } catch (err) {
        // don't block the paste if something goes wrong — let default behaviour happen
        console.warn('paste normalization failed', err);
      }
    };

    dom.addEventListener('paste', handler);
    return () => dom.removeEventListener('paste', handler);
  }, [editor, lineHeight, paragraphSpacing]);

  return (
    <div className="tiptap-wrapper border border-gray-700 rounded-lg bg-gray-800">
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-700 bg-gray-900">
        <div className="flex gap-1">
          {[1,2,3].map(lvl => (
            <button key={lvl} type="button" onClick={() => editor.chain().focus().toggleHeading({ level: lvl }).run()} className={buttonCls(editor.isActive('heading',{ level: lvl }))} aria-label={`Heading ${lvl}`}>
              {lvl === 1 && <Heading1 size={16} />}
              {lvl === 2 && <Heading2 size={16} />}
              {lvl === 3 && <Heading3 size={16} />}
            </button>
          ))}
        </div>
        <span className="h-6 w-px bg-gray-700" />
        <div className="flex gap-1">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={buttonCls(editor.isActive('bold'))}><Bold size={16} /></button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={buttonCls(editor.isActive('italic'))}><Italic size={16} /></button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={buttonCls(editor.isActive('underline'))}><UnderlineIcon size={16} /></button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} className={buttonCls(editor.isActive('strike'))}><Strikethrough size={16} /></button>
        </div>
        <span className="h-6 w-px bg-gray-700" />
        <div className="flex gap-1">
          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={buttonCls(editor.isActive('bulletList'))}><List size={16} /></button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={buttonCls(editor.isActive('orderedList'))}><ListOrdered size={16} /></button>
          <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={buttonCls(editor.isActive('blockquote'))}><Quote size={16} /></button>
          <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={buttonCls(editor.isActive('codeBlock'))}><Code size={16} /></button>
          {editor.isActive('codeBlock') && (
            <select onChange={(e) => setCodeLang(e.target.value)} defaultValue={editor.getAttributes('codeBlock').language || 'plaintext'} className="bg-gray-700 text-gray-200 text-xs px-1 py-1 rounded">
              <option value="plaintext">plain</option>
              <option value="javascript">js</option>
              <option value="typescript">ts</option>
              <option value="css">css</option>
            </select>
          )}
        </div>
        <span className="h-6 w-px bg-gray-700" />
        <div className="flex gap-1">
          <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={buttonCls(editor.isActive({ textAlign:'left'}))}><AlignLeft size={16} /></button>
          <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={buttonCls(editor.isActive({ textAlign:'center'}))}><AlignCenter size={16} /></button>
          <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={buttonCls(editor.isActive({ textAlign:'right'}))}><AlignRight size={16} /></button>
        </div>
        <span className="h-6 w-px bg-gray-700" />
        <div className="flex gap-1">
          <button onClick={addTable} className={buttonCls(editor.isActive('table'))}><Table2 size={16} /></button>
          {editor.isActive('table') && (
            <>
              <button onClick={addRow} className={buttonCls(false)} title="Add Row"><Rows size={16} /></button>
              <button onClick={addCol} className={buttonCls(false)} title="Add Column"><Columns size={16} /></button>
              <button onClick={delRow} className={buttonCls(false)} title="Delete Row">R-</button>
              <button onClick={delCol} className={buttonCls(false)} title="Delete Column">C-</button>
              <button onClick={toggleHeaderRow} className={buttonCls(false)} title="Toggle Header">H</button>
            </>
          )}
        </div>
        {showMediaButtons && (
          <>
            <span className="h-6 w-px bg-gray-700" />
            <div className="flex gap-1">
              <button onClick={setLink} className={buttonCls(editor.isActive('link'))}><LinkIcon size={16} /></button>
              <button onClick={addImage} className={buttonCls(false)}><ImageIcon size={16} /></button>
            </div>
          </>
        )}
        <span className="h-6 w-px bg-gray-700" />
        <div className="flex gap-1">
          <button onClick={() => editor.chain().focus().undo().run()} className={buttonCls(false)}><Undo size={16} /></button>
          <button onClick={() => editor.chain().focus().redo().run()} className={buttonCls(false)}><Redo size={16} /></button>
        </div>
        <span className="h-6 w-px bg-gray-700" />
        <button onClick={() => setPreview(p => !p)} className={buttonCls(preview)} aria-label="Toggle Preview">{preview ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        <button onClick={toggleMarkdown} className={buttonCls(markdownMode)} aria-label="Toggle Markdown">MD</button>
      </div>
      <div className="px-3 py-2">
        {markdownMode ? (
          <textarea id="markdown-editor" defaultValue={getMarkdown()} className="w-full h-52 bg-gray-900 text-gray-200 text-sm p-2 rounded border border-gray-700 font-mono" />
        ) : preview ? (
          <div className="prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
          </div>
        ) : (
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-gray-300">
              <label className="text-xs text-gray-400">Line height</label>
              <select value={lineHeight} onChange={(e) => { const v = parseFloat(e.target.value); setLineHeight(v); applyLineAndSpacing(v, paragraphSpacing); }} className="bg-gray-800 text-gray-200 rounded px-2 py-1 text-xs">
                <option value={1}>1</option>
                <option value={1.15}>1.15</option>
                <option value={1.25}>1.25</option>
                <option value={1.5}>1.5</option>
                <option value={1.75}>1.75</option>
                <option value={2}>2</option>
              </select>

              <label className="text-xs text-gray-400">Paragraph spacing</label>
              <select value={paragraphSpacing} onChange={(e) => { const v = e.target.value; setParagraphSpacing(v); applyLineAndSpacing(lineHeight, v); }} className="bg-gray-800 text-gray-200 rounded px-2 py-1 text-xs">
                <option value="0.25rem">small</option>
                <option value="0.5rem">tight</option>
                <option value="0.75rem">normal</option>
                <option value="1rem">large</option>
                <option value="1.5rem">x-large</option>
              </select>

              <button onClick={() => normalizeAndApply(true)} className="px-2 py-1 text-xs border rounded bg-gray-700 text-gray-200">Clean spacing</button>
              <div className="ml-auto text-xs text-gray-400">Auto-clean on blur is enabled</div>
            </div>

            <EditorContent editor={editor} onBlur={() => normalizeAndApply(false)} />
          </div>
        )}
        {/* Placeholder styling via CSS pseudo */}
        <style jsx global>{`
          .tiptap-editor { min-height:220px; }
          .tiptap-editor:focus { outline: none; }
          .tiptap-editor { --tiptap-line-height: 1.5; --tiptap-paragraph-spacing: 0.75rem; }
          .tiptap-editor p { margin: 0 0 var(--tiptap-paragraph-spacing); line-height: var(--tiptap-line-height); }
          .tiptap-editor ul { list-style: disc; padding-left:1.25rem; margin:0 0 0.75rem; }
          .tiptap-editor ol { list-style: decimal; padding-left:1.25rem; margin:0 0 0.75rem; }
          .tiptap-editor li { margin: 0.25rem 0; }
          .tiptap-wrapper .tiptap-editor a { color:#60a5fa; text-decoration:underline; }
          .tiptap-wrapper .tiptap-editor a:hover { color:#93c5fd; }
          .tiptap-wrapper .tiptap-editor blockquote { border-left:4px solid #374151; padding-left:0.75rem; color:#9ca3af; margin:0.75rem 0; }
          .tiptap-wrapper .tiptap-editor pre { background:#111827; padding:0.75rem; border-radius:0.375rem; font-size:0.85rem; }
          .tiptap-wrapper .tiptap-editor h1, .tiptap-wrapper .tiptap-editor h2, .tiptap-wrapper .tiptap-editor h3 { font-weight:600; line-height:1.25; margin-top:1rem; margin-bottom:0.5rem; }
          .tiptap-wrapper .tiptap-editor.is-editor-empty:first-child::before { color:#6b7280; content: attr(data-placeholder); float:left; height:0; pointer-events:none; }
          .tiptap-wrapper .prose h1, .tiptap-wrapper .prose h2, .tiptap-wrapper .prose h3 { color:#fff; }
        `}</style>
        <div className="mt-2 flex justify-between text-xs text-gray-400">
          <span>{editor.storage.characterCount.words()} words</span>
          <span>{editor.storage.characterCount.characters()}/{maxChars} chars</span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
