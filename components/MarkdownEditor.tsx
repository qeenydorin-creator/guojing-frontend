import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, Bold, Italic, List, Type } from 'lucide-react';

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onUploadImage?: (file: File) => Promise<string>;
  enablePreview?: boolean;
}

// Extremely lightweight markdown-to-HTML (headings, bold, italic, lists, links, images, code)
// Not a full parser; just enough for admin preview.
export const renderMarkdown = (md: string): string => {
  let html = md || '';
  html = html
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" />')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`{3}([\s\S]*?)`{3}/gim, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/\n{2,}/gim, '<br/><br/>')
    .replace(/\n/gim, '<br/>');

  // Merge adjacent <ul> if multiple lines matched
  html = html.replace(/<\/ul>\s*<ul>/gim, '');
  return html;
};

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, placeholder, onUploadImage, enablePreview }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');

  useEffect(() => {
    if (!enablePreview) return;
    setPreviewHtml(renderMarkdown(value || ''));
  }, [value, enablePreview]);

  const insertText = (snippet: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const newValue = ta.value.slice(0, start) + snippet + ta.value.slice(end);
    onChange(newValue);
    // restore caret
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + snippet.length;
    });
  };

  const handleUpload = async () => {
    if (!onUploadImage) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const url = await onUploadImage(file);
        insertText(`![](${url})`);
      } catch (e) {
        alert('上传失败，请检查网络或后端日志');
        // eslint-disable-next-line no-console
        console.error('[MarkdownEditor] upload failed', e);
      }
    };
    input.click();
  };

  const toolbar = useMemo(() => ([
    { label: '粗体', icon: Bold, action: () => insertText('**粗体文本**') },
    { label: '斜体', icon: Italic, action: () => insertText('_斜体文本_') },
    { label: '标题', icon: Type, action: () => insertText('## 标题\n') },
    { label: '列表', icon: List, action: () => insertText('- 项目1\n- 项目2\n') },
    { label: '图片', icon: Upload, action: handleUpload, disabled: !onUploadImage },
  ]), [handleUpload, onUploadImage]);

  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
      <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 border-b border-stone-200 text-sm text-stone-600">
        {toolbar.map(btn => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.action}
            disabled={btn.disabled}
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-200 disabled:opacity-50"
            title={btn.label}
          >
            <btn.icon size={14} /> <span>{btn.label}</span>
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '使用 Markdown 编辑内容，点击工具栏可插入格式/图片'}
        className="w-full min-h-[240px] p-3 outline-none text-sm text-stone-800"
      />
      {enablePreview && (
        <div className="border-t border-stone-200 p-3 bg-stone-50">
          <div className="text-xs text-stone-500 mb-1">预览</div>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(MarkdownEditor);
