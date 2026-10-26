import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createStudioModel } from "./studio-model.js";

export class Studio {
  constructor(canvas, { night = false, paused = false } = {}) {
    this.canvas = canvas;
    this.paused = paused;
    this.visible = true;
    this.night = night;
    this.elapsed = 0;
    this.lastTime = null;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
    this.camera.position.set(7.3, 6.2, 8.6);
    this.camera.lookAt(0, 1.1, 0);
    this.view = "studio";
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.set(0, 1.1, 0);
    this.controls.enableDamping = false;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.minAzimuthAngle = 0.15;
    this.controls.maxAzimuthAngle = 1.25;
    this.controls.minPolarAngle = 0.52;
    this.controls.maxPolarAngle = 1.35;
    this.controls.enableRotate =
      !window.matchMedia("(pointer: coarse)").matches;
    if (!this.controls.enableRotate) canvas.style.touchAction = "pan-y";
    this.controls.addEventListener("change", () => this.render());
    Object.assign(this, createStudioModel());
    this.scene.add(this.model);
    this.ambient = new THREE.HemisphereLight("#fffae8", "#829181", 0.65);
    this.scene.add(this.ambient);
    this.sun = new THREE.DirectionalLight("#fff0ce", 1.4);
    this.sun.position.set(-3.5, 7, 5);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024);
    Object.assign(this.sun.shadow.camera, {
      left: -6,
      right: 6,
      top: 6,
      bottom: -6,
      near: 0.1,
      far: 20,
    });
    this.sun.shadow.normalBias = 0.035;
    this.scene.add(this.sun);
    this.fill = new THREE.DirectionalLight("#c8dcc7", 0.4);
    this.fill.position.set(5, 4, -1);
    this.scene.add(this.fill);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.ShadowMaterial({ opacity: 0.13 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.325;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.addSignature();
    this.setNight(night);
    this.resize = this.resize.bind(this);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(canvas.parentElement);
    this.resize();
    this.intersection = new IntersectionObserver((entries) => {
      this.visible = entries[0].isIntersecting;
      this.schedule();
    });
    this.intersection.observe(canvas);
    document.addEventListener("visibilitychange", () => this.schedule());
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      document.body.classList.remove("scene-ready");
      document.querySelector(".scene-note").textContent =
        "The studio is taking a break. Your projects and links are still here.";
      document.querySelector(".motion-button").disabled = true;
      this.contextLost = true;
      this.schedule();
    });
    canvas.addEventListener("webglcontextrestored", () => {
      this.contextLost = false;
      document.body.classList.add("scene-ready");
      document.querySelector(".scene-note").textContent = "";
      document.querySelector(".motion-button").disabled = false;
      this.render();
      this.schedule();
    });
    this.schedule();
  }
  addSignature() {
    const label = document.createElement("canvas");
    label.width = 512;
    label.height = 128;
    const ctx = label.getContext("2d");
    ctx.fillStyle = "#e9e6d6";
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = "#52654b";
    ctx.font = "bold 56px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("s l o w e y   /   s t u d i o", 256, 64);
    const texture = new THREE.CanvasTexture(label);
    texture.encoding = THREE.sRGBEncoding;
    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(1.45, 0.18),
      new THREE.MeshBasicMaterial({ map: texture }),
    );
    plaque.name = "Studio signature";
    plaque.position.set(0.4, -0.175, 2.256);
    this.model.add(plaque);
  }
  resize() {
    const { width, height } = this.canvas.parentElement.getBoundingClientRect();
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    // Keep the whole model in frame even on narrow phone screens.
    this.camera.fov = width / height < 1.15 ? 43 : 35;
    this.camera.updateProjectionMatrix();
    this.render();
  }
  setNight(night) {
    this.night = night;
    this.ambient.color.set(night ? "#a7b8d6" : "#fffae8");
    this.ambient.groundColor.set(night ? "#596e70" : "#829181");
    this.ambient.intensity = night ? 0.2 : 0.65;
    this.sun.color.set(night ? "#9db9eb" : "#fff0ce");
    this.sun.intensity = night ? 0.25 : 1.4;
    this.fill.color.set(night ? "#d9a86c" : "#c8dcc7");
    this.fill.intensity = night ? 0.18 : 0.4;
    this.lampLight.intensity = night ? 4 : 0.15;
    this.glow.emissiveIntensity = night ? 1.8 : 0.45;
    this.screenGlow.emissiveIntensity = night ? 0.9 : 0.3;
    this.renderer.toneMappingExposure = night ? 0.95 : 0.95;
    this.render();
  }
  setView(view) {
    this.view = view;
    const views = {
      studio: { position: [7.3, 6.2, 8.6], target: [0, 1.1, 0] },
      desk: { position: [3.8, 3.4, 4.2], target: [0, 1.5, -0.8] },
      cat: { position: [0.3, 1.25, 3.35], target: [-0.9, 0.36, 1.43] },
    };
    const preset = views[view] || views.studio;
    this.camera.position.set(...preset.position);
    this.controls.target.set(...preset.target);
    this.controls.update();
    this.render();
  }
  setPaused(paused) {
    this.paused = paused;
    this.schedule();
  }
  schedule() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.lastTime = null;
    if (this.paused || !this.visible || document.hidden || this.contextLost)
      return;
    this.frame = requestAnimationFrame((time) => this.animate(time));
  }
  animate(time) {
    if (this.lastTime !== null && time - this.lastTime < 1000 / 30) {
      this.frame = requestAnimationFrame((next) => this.animate(next));
      return;
    }
    const delta =
      this.lastTime === null
        ? 0
        : Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    this.elapsed += delta;
    this.cat.scale.y = 1 + Math.sin(this.elapsed * 1.5) * 0.025;
    this.model.position.y = Math.sin(this.elapsed * 0.65) * 0.018;
    this.render();
    this.frame = requestAnimationFrame((next) => this.animate(next));
  }
  render() {
    if (!this.contextLost) this.renderer.render(this.scene, this.camera);
  }
}
