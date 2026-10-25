import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:4173/3d-portfolio/",
    viewport: { width: 1440, height: 960 },
    launchOptions: {
      args: [
        "--enable-webgl",
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
      ],
    },
  },
  webServer: {
    command:
      "npm run build && npm run preview -- --host 127.0.0.1 --base /3d-portfolio/ --port 4173 --strictPort",
    url: "http://127.0.0.1:4173/3d-portfolio/",
    reuseExistingServer: !process.env.CI,
  },
});
