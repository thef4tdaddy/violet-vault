/// <reference types="vite/client" />

/**
 * Type definitions for Vite environment and import.meta
 */

interface ImportMetaEnv {
  // Vite standard environment variables
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
  
  // Custom environment variables
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;
  
  // Git information injected at build time
  readonly VITE_GIT_BRANCH: string;
  readonly VITE_GIT_COMMIT_DATE: string;
  readonly VITE_GIT_AUTHOR_DATE: string;
  readonly VITE_GIT_COMMIT_HASH: string;
  readonly VITE_GIT_COMMIT_MESSAGE: string;
  readonly VITE_BUILD_TIME: string;
  
  // Highlight.io monitoring
  readonly VITE_HIGHLIGHT_PROJECT_ID?: string;
  
  // Node environment
  readonly VITE_NODE_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * SVG module declarations
 */
declare module '*.svg' {
  const src: string;
  export default src;
}

/**
 * Image module declarations
 */
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.ico' {
  const content: string;
  export default content;
}

declare module '*.bmp' {
  const content: string;
  export default content;
}

/**
 * CSS module declarations
 */
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

/**
 * CSS file declarations (non-module)
 */
declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

declare module '*.sass' {
  const content: string;
  export default content;
}

/**
 * JSON module declarations
 */
declare module '*.json' {
  const content: unknown;
  export default content;
}

/**
 * Web Worker declarations
 */
declare module '*?worker' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}

declare module '*?worker&inline' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}

declare module '*?worker&url' {
  const src: string;
  export default src;
}

/**
 * Web Assembly module declarations
 */
declare module '*.wasm' {
  const content: WebAssembly.Module;
  export default content;
}

/**
 * HTML module declarations
 */
declare module '*.html' {
  const content: string;
  export default content;
}

/**
 * Markdown module declarations
 */
declare module '*.md' {
  const content: string;
  export default content;
}

/**
 * Font file declarations
 */
declare module '*.woff' {
  const content: string;
  export default content;
}

declare module '*.woff2' {
  const content: string;
  export default content;
}

declare module '*.ttf' {
  const content: string;
  export default content;
}

declare module '*.eot' {
  const content: string;
  export default content;
}

declare module '*.otf' {
  const content: string;
  export default content;
}
