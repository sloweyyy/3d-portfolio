import * as THREE from "three";

export class Atmosphere {
  constructor(scene, model) {
    this.group = new THREE.Group();
    this.group.name = "Atmosphere";
    model.add(this.group);
    const stamp = document.createElement("canvas");
    stamp.width = 64;
    stamp.height = 64;
    const ctx = stamp.getContext("2d");
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,255,255,.65)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(stamp);
    this.motes = [];
    for (let i = 0; i < 30; i++) {
      const material = new THREE.SpriteMaterial({
        map: texture,
        color: "#ffe9b5",
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(material);
      const seed = i * 2.399963;
      sprite.position.set(
        Math.sin(seed) * 2,
        0.5 + (i % 8) * 0.34,
        Math.cos(seed) * 1.8,
      );
      sprite.scale.setScalar(0.025 + (i % 4) * 0.009);
      this.group.add(sprite);
      this.motes.push({ sprite, seed, y: sprite.position.y });
    }
    // Warm shafts enter through the real window opening and cross the studio floor.
    this.rays = new THREE.Group();
    this.group.add(this.rays);
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.BufferGeometry();
      const z = -1 + i * 0.8;
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
          [
            -2.4,
            2.8,
            z,
            -2.4,
            2.8,
            z + 0.36,
            1.65,
            0.09,
            z + 1.1,
            -2.4,
            2.8,
            z,
            1.65,
            0.09,
            z + 1.1,
            0.8,
            0.09,
            z + 0.5,
          ],
          3,
        ),
      );
      const material = new THREE.MeshBasicMaterial({
        color: "#ffe4aa",
        transparent: true,
        opacity: 0.035,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const ray = new THREE.Mesh(geometry, material);
      ray.name = "Window sunbeam";
      this.rays.add(ray);
    }
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.05);
    heartShape.bezierCurveTo(0.14, 0.2, 0.24, 0.03, 0, -0.13);
    heartShape.bezierCurveTo(-0.24, 0.03, -0.14, 0.2, 0, 0.05);
    this.heartGeometry = new THREE.ShapeGeometry(heartShape);
    this.hearts = [];
    for (let i = 0; i < 6; i++) {
      const heart = new THREE.Mesh(
        this.heartGeometry,
        new THREE.MeshBasicMaterial({
          color: i % 2 ? "#e59b83" : "#f1c596",
          side: THREE.DoubleSide,
          transparent: true,
          depthWrite: false,
        }),
      );
      heart.visible = false;
      heart.scale.setScalar(0.4);
      model.add(heart);
      this.hearts.push(heart);
    }
  }
  setNight(night) {
    this.night = night;
    this.rays.visible = !night;
    this.motes.forEach(({ sprite }) => {
      sprite.material.color.set(night ? "#dcefa5" : "#ffe8bd");
      sprite.material.opacity = night ? 0.8 : 0.4;
      sprite.scale.setScalar(night ? 0.045 : 0.03);
    });
  }
  love(time, cat, paused) {
    this.loveStart = time;
    this.hearts.forEach((heart, i) => {
      heart.visible = true;
      heart.material.opacity = 0.9;
      heart.position
        .copy(cat.position)
        .add(new THREE.Vector3((i - 2.5) * 0.12, 0.7 + (i % 3) * 0.16, 0.1));
    });
    if (paused) this.loveStart = null;
  }
  update(time, camera) {
    for (const { sprite, seed, y } of this.motes) {
      sprite.position.y = y + Math.sin(time * 0.3 + seed) * 0.15;
      sprite.position.x = Math.sin(seed + time * 0.08) * 2;
      sprite.material.opacity =
        (this.night ? 0.65 : 0.25) + Math.sin(time + seed) * 0.14;
    }
    if (this.loveStart != null) {
      const age = time - this.loveStart;
      this.hearts.forEach((heart, i) => {
        heart.visible = age < 2.6;
        heart.position.y = 0.82 + age * 0.34 + (i % 3) * 0.16;
        heart.position.x =
          -0.98 + (i - 2.5) * 0.12 + Math.sin(age * 2 + i) * 0.06;
        heart.material.opacity = Math.max(0, 1 - age / 2.6);
        heart.quaternion.copy(camera.quaternion);
      });
    }
  }
}
