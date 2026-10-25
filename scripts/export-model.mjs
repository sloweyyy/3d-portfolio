import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(process.env.STUDIO_URL || "http://127.0.0.1:5173/");
  const bytes = await page.evaluate(async () => {
    const { createStudioModel } = await import("/studio-model.js");
    const { GLTFExporter } =
      await import("/node_modules/three/examples/jsm/exporters/GLTFExporter.js");
    const { model } = createStudioModel();
    return new Promise((resolve, reject) => {
      new GLTFExporter().parse(
        model,
        (result) => resolve(Array.from(new Uint8Array(result))),
        reject,
        { binary: true },
      );
    });
  });
  await mkdir("artifacts", { recursive: true });
  await writeFile("artifacts/creative-corner.glb", Buffer.from(bytes));
  console.log(
    `Exported artifacts/creative-corner.glb (${bytes.length.toLocaleString()} bytes)`,
  );
} finally {
  await browser.close();
}
