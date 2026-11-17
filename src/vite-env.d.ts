/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_TOKEN?: string;
  /** "off" forces the home story to its still cards (no 3D), like VITE_HERO_3D for the hero */
  readonly VITE_STORY_3D?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
