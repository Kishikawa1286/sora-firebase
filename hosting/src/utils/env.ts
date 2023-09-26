// Vite modes
// See: https://vitejs.dev/guide/env-and-mode.html
const mode = import.meta.env.MODE;

export const APP_DYNAMIC_LINK =
  mode === "prod"
    ? "https://sorakamachokkai.page.link/sora"
    : "https://kamachokkai.page.link/sora-dev";
