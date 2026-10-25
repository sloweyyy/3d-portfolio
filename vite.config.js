import { defineConfig } from "vite";

// Relative asset URLs work on /3d-portfolio/, preview servers, and custom domains.
export default defineConfig({ base: "./", publicDir: false });
