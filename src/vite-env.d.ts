/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** BFF base URL when it differs from the SPA origin (e.g. dev server on another port). */
  readonly VITE_BFF_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
