import "./style.css";

const themeButton = document.querySelector(".theme-button");
const motionButton = document.querySelector(".motion-button");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const darkPreference = window.matchMedia("(prefers-color-scheme: dark)");
let studio;
let paused = reducedMotion.matches;
let night = true;
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
    ? "After hours"
    : "Golden hour";
  document.querySelector('meta[name="theme-color"]').content = night
    ? "#101c1d"
    : "#e8e5d9";
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
    document.querySelector(".pet-button").disabled = true;
    document.querySelectorAll("button[data-view]").forEach((button) => {
      button.disabled = true;
    });
    document.querySelector(".scene-live").textContent = "THE QUIET CORNER";
  }
}
document.querySelectorAll("button[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    studio?.setView(button.dataset.view);
    document
      .querySelectorAll("button[data-view]")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
  });
});
document
  .querySelector(".pet-button")
  .addEventListener("click", () => studio?.petCat());
loadStudio();

// Deep links work with keyboard navigation, browser history, and direct URLs.
function syncPanel() {
  const section = location.hash.slice(1);
  document.querySelectorAll(".content-panel").forEach((panel) => {
    if (panel.id === section + "-panel") {
      if (!panel.open) panel.showModal();
    } else if (panel.open) panel.close();
  });
}
window.addEventListener("hashchange", syncPanel);
document.querySelectorAll(".content-panel").forEach((panel) => {
  panel.querySelector(".close-panel").addEventListener("click", () => {
    location.hash = "home";
  });
  panel.addEventListener("cancel", () => {
    location.hash = "home";
  });
  panel.addEventListener("click", (event) => {
    if (event.target === panel) {
      const r = panel.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        location.hash = "home";
    }
  });
});
syncPanel();
const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Ho_Chi_Minh",
  hour: "2-digit",
  minute: "2-digit",
});
const tick = () =>
  (document.querySelector(".local-time").textContent =
    clock.format(new Date()) + " ICT");
tick();
setInterval(tick, 60000);
