import "./style.css";

const themeButton = document.querySelector(".theme-button");
const motionButton = document.querySelector(".motion-button");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const darkPreference = window.matchMedia("(prefers-color-scheme: dark)");
let studio;
let paused = reducedMotion.matches;
let night = darkPreference.matches;
try {
  const saved = localStorage.getItem("slowey-theme");
  if (saved === "night" || saved === "day") night = saved === "night";
} catch {
  /* Storage can be blocked in private browsing. */
}

function applyTheme() {
  document.body.classList.toggle("night", night);
  themeButton.setAttribute("aria-pressed", String(night));
  themeButton.setAttribute(
    "aria-label",
    `Switch to ${night ? "day" : "night"} mode`,
  );
  themeButton.querySelector(".theme-icon").textContent = night ? "☾" : "☼";
  themeButton.querySelector(".theme-label").textContent = night
    ? "Moonlight"
    : "Daylight";
  document.querySelector('meta[name="theme-color"]').content = night
    ? "#1d2c28"
    : "#f5f3ed";
  studio?.setNight(night);
}
function applyMotion() {
  motionButton.setAttribute("aria-pressed", String(paused));
  motionButton.textContent = paused ? "Resume motion ▷" : "Pause motion Ⅱ";
  studio?.setPaused(paused);
}
applyTheme();
applyMotion();
document.querySelector("#year").textContent = new Date().getFullYear();
themeButton.addEventListener("click", () => {
  night = !night;
  applyTheme();
  try {
    localStorage.setItem("slowey-theme", night ? "night" : "day");
  } catch {
    /* Optional preference. */
  }
});
motionButton.addEventListener("click", () => {
  paused = !paused;
  applyMotion();
});
reducedMotion.addEventListener("change", (event) => {
  paused = event.matches;
  applyMotion();
});

// Keep the content and navigation usable if WebGL or the scene bundle fails.
async function loadStudio() {
  try {
    const { Studio } = await import("./studio.js");
    studio = new Studio(document.querySelector("#studio"), { night, paused });
    document.body.classList.add("scene-ready");
  } catch {
    document.querySelector(".scene-note").textContent =
      "3D is unavailable on this device. All projects and links are still ready to explore.";
    motionButton.disabled = true;
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.disabled = true;
    });
    document.querySelector(".scene-live").textContent = "THE QUIET CORNER";
  }
}
document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    studio?.setView(button.dataset.view);
    document
      .querySelectorAll("[data-view]")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
  });
});
loadStudio();
