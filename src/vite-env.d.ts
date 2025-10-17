/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GIT_BRANCH: string;
  readonly VITE_GIT_COMMIT_DATE: string;
  readonly VITE_GIT_AUTHOR_DATE: string;
  readonly VITE_GIT_COMMIT_HASH: string;
  readonly VITE_GIT_COMMIT_MESSAGE: string;
  readonly VITE_BUILD_TIME: string;
  readonly VITE_NODE_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
