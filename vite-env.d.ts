/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_REACT_QUILL_NEW: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
