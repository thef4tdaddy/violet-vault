/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string
  readonly VITE_HIGHLIGHT_PROJECT_ID?: string
  readonly VITE_CLOUDFLARE_WORKER_URL?: string
  readonly VITE_APP_VERSION?: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}