import React, { useEffect, useRef, useState } from 'react';
import 'react-quill-new/dist/quill.snow.css';

interface RichEditorQuillNativeProps {
  value: string;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  placeholder?: string;
  editorKey?: string;
  readOnly?: boolean; // when true: toolbar disabled and editor read-only
}

/**
 * Native Quill implementation without react-quill-new wrapper
 * 使用原生 Quill API，避免 react-quill-new 的 regenerationSnapshot 崩溃问题
 */
const RichEditorQuillNative: React.FC<RichEditorQuillNativeProps> = ({
  value,
  onChange,
  onUploadImage,
  placeholder,
  editorKey,
  readOnly
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isUpdatingRef = useRef(false);
  
  const toolbarId = useRef(`quill-toolbar-${Math.random().toString(36).substr(2, 9)}`).current;

  // Singleton promise to cache Quill module loading
  // This prevents repeated imports when switching between products
  const getQuillModule = () => {
    if (!(window as any)._quillPromise) {
      console.log('[RichEditorNative] Creating new Quill import promise');
      (window as any)._quillPromise = import('quill').then(m => m.default);
    }
    return (window as any)._quillPromise;
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;
    
    // Safety guard: if init takes too long, fallback to textarea
    timeoutId = setTimeout(() => {
        if (mounted && isLoading) {
            console.warn('[RichEditorNative] Init timeout (8s), falling back to textarea');
            setHasError(true);
            setIsLoading(false);
        }
    }, 8000);

    const initQuill = async () => {
      const canEdit = !readOnly;
      if (!editorRef.current) return;
      
      try {
        console.log('[RichEditorNative] Starting init...');
        const Quill = await getQuillModule();
        console.log('[RichEditorNative] Quill module loaded');
        
        if (!mounted || !editorRef.current) return;

        const imageHandler = function(this: any) {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            
            try {
              const url = await onUploadImage(file);
              const quill = quillInstanceRef.current;
              if (quill) {
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', url, 'user');
                quill.setSelection(range.index + 1);
              }
            } catch (e) {
              console.error('[RichEditorNative] Image upload failed:', e);
            }
          };
          input.click();
        };

        const modules = canEdit
          ? {
              toolbar: {
                container: `#${toolbarId}`,
                handlers: { image: imageHandler }
              }
            }
          : { toolbar: false };

        const quill = new Quill(editorRef.current, {
          theme: 'snow',
          modules,
          readOnly: !canEdit,
          formats: ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'link', 'image'],
          placeholder: placeholder || '请输入内容...'
        });

        quillInstanceRef.current = quill;
        console.log('[RichEditorNative] Quill instance created');
        
        // Ensure admin edit is always enabled (no implicit readOnly)
        quill.enable(canEdit);
        quill.root.setAttribute('contenteditable', canEdit ? 'true' : 'false');
        quill.root.style.pointerEvents = canEdit ? 'auto' : 'none';
        const toolbarEl = document.getElementById(toolbarId);
        if (canEdit) {
          toolbarEl?.classList.remove('ql-disabled');
          toolbarEl?.style?.setProperty('pointer-events', 'auto');
        } else {
          toolbarEl?.classList.add('ql-disabled');
          toolbarEl?.style?.setProperty('pointer-events', 'none');
        }
        // Some builds delay enable; reassert on next tick
        setTimeout(() => {
          const q = quillInstanceRef.current;
          q?.enable(canEdit);
          if (q?.root) {
            q.root.setAttribute('contenteditable', canEdit ? 'true' : 'false');
            q.root.style.pointerEvents = canEdit ? 'auto' : 'none';
          }
          const tb = document.getElementById(toolbarId);
          if (canEdit) {
            tb?.classList.remove('ql-disabled');
            tb?.style?.setProperty('pointer-events', 'auto');
          } else {
            tb?.classList.add('ql-disabled');
            tb?.style?.setProperty('pointer-events', 'none');
          }
        }, 0);

        if (value) {
          isUpdatingRef.current = true;
          quill.clipboard.dangerouslyPasteHTML(value);
          isUpdatingRef.current = false;
        }

        quill.on('text-change', () => {
          if (isUpdatingRef.current) return;
          const html = quill.root.innerHTML;
          onChange(html === '<p><br></p>' ? '' : html);
        });

        setIsLoading(false);
      } catch (error) {
        console.error('[RichEditorNative] Failed to load Quill:', error);
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    initQuill();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (quillInstanceRef.current) {
        quillInstanceRef.current = null;
      }
    };
  }, [editorKey, readOnly]);

  useEffect(() => {
    const quill = quillInstanceRef.current;
    if (!quill || isUpdatingRef.current) return;

    const currentHtml = quill.root.innerHTML;
    const normalizedCurrent = currentHtml === '<p><br></p>' ? '' : currentHtml;
    const normalizedValue = value ?? '';

    if (normalizedValue !== normalizedCurrent) {
      isUpdatingRef.current = true;
      quill.clipboard.dangerouslyPasteHTML(normalizedValue);
      isUpdatingRef.current = false;
    }
  }, [value]);

  useEffect(() => {
    const container = editorRef.current?.parentElement;
    if (!container) return;

    const stopPropagation = (e: Event) => {
      e.stopPropagation();
    };

    const preventAnchorNav = (e: Event) => {
      const target = e.target as HTMLElement;
      const anchor = target.tagName === 'A' ? target : target.closest('a');
      if (anchor?.getAttribute('href')) {
        e.preventDefault();
        console.log('[RichEditorNative] Prevented anchor navigation:', anchor.getAttribute('href'));
      }
    };

    container.addEventListener('click', stopPropagation, true);
    container.addEventListener('mousedown', stopPropagation, true);
    container.addEventListener('click', preventAnchorNav, false);

    return () => {
      container.removeEventListener('click', stopPropagation, true);
      container.removeEventListener('mousedown', stopPropagation, true);
      container.removeEventListener('click', preventAnchorNav, false);
    };
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-center" style={{ minHeight: 280 }}>
          <div className="text-gray-500 text-sm">加载编辑器中...</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-amber-700 text-sm mb-2">富文本编辑器加载失败，已切换到纯文本模式</p>
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border rounded p-2"
          rows={12}
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg" style={{ minHeight: 320, pointerEvents: 'auto' }}>
      <div id={toolbarId} className="ql-toolbar ql-snow">
        <span className="ql-formats">
          <select className="ql-header" defaultValue="">
            <option value="1">标题 1</option>
            <option value="2">标题 2</option>
            <option value="3">标题 3</option>
            <option value="">正文</option>
          </select>
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-bold" title="粗体"></button>
          <button type="button" className="ql-italic" title="斜体"></button>
          <button type="button" className="ql-underline" title="下划线"></button>
          <button type="button" className="ql-strike" title="删除线"></button>
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-list" value="ordered" title="有序列表"></button>
          <button type="button" className="ql-list" value="bullet" title="无序列表"></button>
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-link" title="插入链接"></button>
          <button type="button" className="ql-image" title="插入图片"></button>
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-clean" title="清除格式"></button>
        </span>
      </div>
      <div ref={editorRef} style={{ minHeight: 280 }}></div>
    </div>
  );
};

export default RichEditorQuillNative;
