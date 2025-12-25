import React, { useEffect, useMemo, useState, Suspense, useRef } from 'react';
import 'react-quill-new/dist/quill.snow.css';
import RichEditorQuillNative from './RichEditorQuillNative';

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  placeholder?: string;
  editorKey?: string; // FIX: Optional key for forcing re-render when switching products
  readOnly?: boolean; // when true: toolbar disabled and editor read-only
}

// Dynamic import wrapper component for ReactQuill
const QuillEditorWrapper: React.FC<RichEditorProps> = ({ value, onChange, onUploadImage, placeholder, editorKey, readOnly }) => {
  const [ReactQuill, setReactQuill] = useState<any>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const quillRef = React.useRef<any>(null);
  
  // FIX: Generate stable toolbar ID to prevent "Container required" error
  const toolbarId = React.useRef(`quill-toolbar-${Math.random().toString(36).substr(2, 9)}`).current;
  
  // FIX: Mounted gate to prevent StrictMode/HMR crashes during componentDidUpdate
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Dynamically import ReactQuill on mount (client-side only)
  useEffect(() => {
    let mounted = true;
    
    const loadQuill = async () => {
      try {
        // Dynamic import for Vite/ESM compatibility
        const module = await import('react-quill-new');
        if (mounted) {
          setReactQuill(() => module.default);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load react-quill-new:', error);
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadQuill();

    return () => {
      mounted = false;
    };
  }, []);

  const imageHandler = React.useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const editor = quillRef.current?.getEditor?.();
      if (!editor) return;
      try {
        const url = await onUploadImage(file);
        const range = editor.getSelection();
        if (range) {
          editor.insertEmbed(range.index, 'image', url, 'user');
        }
      } catch (e) {
        console.error('Image upload failed:', e);
      }
    };
    input.click();
  }, [onUploadImage]);

  // FIX: Use custom toolbar with stable ID reference to prevent "Container required" error
  // Note: toolbarId is stable (from useRef), so we only depend on imageHandler
  const modules = useMemo(() => {
    const canEdit = !readOnly;
    if (!canEdit) return { toolbar: false };
    return {
      toolbar: {
        container: `#${toolbarId}`,
        handlers: {
          image: imageHandler
        }
      }
    };
  }, [imageHandler, readOnly, toolbarId]);

  // Ensure editor editability based on readOnly (defaults to editable)
  useEffect(() => {
    const canEdit = !readOnly;
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;
    quill.enable(canEdit);
    // Defensive: ensure contenteditable & pointer-events are restored even if quill was ever disabled
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
    // Some builds delay editor availability; re-assert enable after tick
    setTimeout(() => {
      const q = quillRef.current?.getEditor?.();
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
  }, [isLoading, hasError, ReactQuill, toolbarId, readOnly]);

  // FIX: Correct Quill formats list - 'bullet' and 'clean' are toolbar controls, not formats
  // Only include valid Quill format names to prevent "Cannot register" errors
  const formats = useMemo(
    () => ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'link', 'image'],
    []
  );

  // FIX: Prevent clicks inside editor from bubbling up and triggering parent handlers
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Stop propagation for all click and mousedown events within the editor
    const stopPropagation = (e: Event) => {
      e.stopPropagation();
    };

    // Prevent anchor navigation within editor content (admin context)
    const preventAnchorNav = (e: Event) => {
      const target = e.target as HTMLElement;
      const anchor = target.tagName === 'A' ? target : target.closest('a');
      if (anchor && anchor.getAttribute('href')) {
        e.preventDefault();
        console.log('[RichEditor] Prevented anchor navigation in editor:', anchor.getAttribute('href'));
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
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-center" style={{ minHeight: 280 }}>
          <div className="text-gray-500 text-sm">加载编辑器中...</div>
        </div>
      </div>
    );
  }

  // Error state - fallback to textarea
  if (hasError || !ReactQuill) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-amber-700 text-sm mb-2">富文本编辑器加载失败，已切换到纯文本模式</p>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border rounded p-2"
          rows={12}
          placeholder={placeholder}
        />
      </div>
    );
  }

  // FIX: Only render ReactQuill when fully mounted to prevent regenerationSnapshot crashes
  if (!mounted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-center" style={{ minHeight: 280 }}>
          <div className="text-gray-500 text-sm">初始化编辑器...</div>
        </div>
      </div>
    );
  }

  // Render ReactQuill with custom toolbar to ensure all buttons have type="button"
  return (
    <div ref={containerRef} className="bg-white border rounded-lg" style={{ minHeight: 320, pointerEvents: 'auto' }}>
      {/* Custom Toolbar with explicit button types and stable ID */}
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
      <ReactQuill
        key={editorKey || toolbarId}
        ref={quillRef}
        theme="snow"
        readOnly={readOnly ?? false}
        value={value ?? ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || '请输入内容...'}
        style={{ minHeight: 280 }}
      />
    </div>
  );
};

// Main component - defaults to native Quill implementation
// FIX: Use native Quill to avoid react-quill-new regenerationSnapshot crashes
const RichEditor: React.FC<RichEditorProps> = (props) => {
  // Log only once per component instance to avoid noisy spam on re-renders
  const didLogRef = React.useRef(false);
  const useReactQuillNew = import.meta.env.VITE_USE_REACT_QUILL_NEW === 'true';

  React.useEffect(() => {
    if (!didLogRef.current) {
      console.info(`[RichEditor] ${useReactQuillNew ? 'ReactQuill-new' : 'Native Quill'} branch: mount`);
      didLogRef.current = true;
    }
  }, [useReactQuillNew]);
  
  if (useReactQuillNew) {
    return (
      <Suspense fallback={
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-center" style={{ minHeight: 280 }}>
            <div className="text-gray-500 text-sm">加载编辑器中...</div>
          </div>
        </div>
      }>
        <QuillEditorWrapper {...props} />
      </Suspense>
    );
  }
  
  // Default: Native Quill (recommended)
  return <RichEditorQuillNative {...props} />;
};

export default React.memo(RichEditor);
