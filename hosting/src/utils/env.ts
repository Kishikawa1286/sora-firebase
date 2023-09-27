// Vite modes
// See: https://vitejs.dev/guide/env-and-mode.html
export const MODE = import.meta.env.MODE;

export const APP_DYNAMIC_LINK =
  MODE === "prod"
    ? "https://sorakamachokkai.page.link/sora-app"
    : "https://kamachokkai.page.link/sora-dev";
