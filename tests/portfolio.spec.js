import { test, expect } from "@playwright/test";

// Exercise the built site under the same nested path used by GitHub Pages.
test("production page and 3D scene load without broken assets", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (
      response.url().startsWith("http://127.0.0.1:4173/") &&
      response.status() >= 400
    )
      errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto("./");
  await expect(page.locator("body")).toHaveClass(/scene-ready/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "big ideas",
  );
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "02 The desk" }).click();
  await expect(page.locator('[data-view="desk"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "03 The resident" }).click();
  await expect(page.locator('[data-view="cat"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(errors).toEqual([]);
});

test("theme, motion, navigation, and saved preference work", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator("body")).toHaveClass(/scene-ready/);
  await page.getByRole("button", { name: "Switch to night mode" }).click();
  await expect(page.locator("body")).toHaveClass(/night/);
  await page.getByRole("button", { name: /Pause motion/ }).click();
  await expect(
    page.getByRole("button", { name: /Resume motion/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "Explore my work" }).click();
  await expect(page).toHaveURL(/#work$/);
  await page.reload();
  await expect(page.locator("body")).toHaveClass(/night/);
  expect(await page.locator('a[href="https://slowey.dev"]').count()).toBe(1);
  expect(
    await page
      .locator('a[href="https://sloweyyy.github.io/design-portfolio/"]')
      .count(),
  ).toBe(1);
});

test("phone layout has no sideways overflow and links stay accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("./");
  await expect(page.locator("body")).toHaveClass(/scene-ready/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/#about$/);
  await expect(
    page.getByRole("heading", { name: /Equal parts logic/ }),
  ).toBeInViewport();
  await expect(page.getByRole("link", { name: "Email me" })).toHaveAttribute(
    "href",
    /^mailto:/,
  );
});

test("reduced motion starts paused", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await expect(page.locator("body")).toHaveClass(/scene-ready/);
  await expect(
    page.getByRole("button", { name: /Resume motion/ }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("content survives unavailable WebGL", async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/i.test(type) ? null : getContext.call(this, type, ...args);
    };
  });
  await page.goto("./");
  await expect(page.getByRole("status")).toContainText("3D is unavailable");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Pause motion/ }),
  ).toBeDisabled();
  await page.getByRole("link", { name: "Explore my work" }).click();
  await expect(page).toHaveURL(/#work$/);
});

test("touch users can scroll through the studio", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    hasTouch: true,
    isMobile: true,
    viewport: { width: 375, height: 812 },
  });
  try {
    const page = await context.newPage();
    await page.goto("./");
    await expect(page.locator("body")).toHaveClass(/scene-ready/);
    await expect(page.locator("canvas")).toHaveCSS("touch-action", "pan-y");
    await page.getByRole("button", { name: "03 The resident" }).tap();
    await expect(page.locator('[data-view="cat"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  } finally {
    await context.close();
  }
});
