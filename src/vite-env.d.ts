/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API base URL — e.g. https://<render-slug>.onrender.com/api/v1 */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
