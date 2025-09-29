/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GIT_BRANCH: string
  readonly VITE_GIT_COMMIT_DATE: string
  readonly VITE_GIT_AUTHOR_DATE: string
  readonly VITE_GIT_COMMIT_HASH: string
  readonly VITE_GIT_COMMIT_MESSAGE: string
  readonly VITE_BUILD_TIME: string
  readonly VITE_NODE_ENV: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_HIGHLIGHT_PROJECT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}