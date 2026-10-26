import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// An original, editable diorama. Coordinates are in metres; Y points upward.
// Every major object is named so the scene can also be exported and edited in Blender.
export function createStudioModel() {
  const room = new THREE.Group();
  room.name = "Slowey_Creative_Corner";
  const palette = {
    plaster: "#e9e6d6",
    wall: "#66856d",
    trim: "#b9c6a4",
    oak: "#ba8051",
    wood: "#d7ac7b",
    dark: "#34463b",
    cream: "#f5e9d0",
    terracotta: "#cc7756",
    leaf: "#638459",
    lightLeaf: "#95a469",
    brass: "#d2b56c",
    pink: "#d4a69b",
    blue: "#849d9f",
    paper: "#ede6cf",
    soil: "#5b4436",
    cat: "#c17c45",
    catStripe: "#8a4c2c",
    catPink: "#d38b83",
  };
  const materials = Object.fromEntries(
    Object.entries(palette).map(([name, color]) => [
      name,
      new THREE.MeshStandardMaterial({
        color,
        roughness: name === "brass" ? 0.35 : 0.78,
        metalness: name === "brass" ? 0.6 : 0,
      }),
    ]),
  );
  const glow = new THREE.MeshStandardMaterial({
    color: "#ffe4a6",
    emissive: "#ffc66c",
    emissiveIntensity: 0.7,
    roughness: 0.45,
  });
  const screenGlow = new THREE.MeshStandardMaterial({
    color: "#253f37",
    emissive: "#436d53",
    emissiveIntensity: 0.3,
    roughness: 0.4,
  });
  const all = new THREE.Group();
  all.name = "Architecture";
  room.add(all);
  function mesh(name, geo, material, position, parent = all) {
    const item = new THREE.Mesh(
      geo,
      typeof material === "string" ? materials[material] : material,
    );
    item.name = name;
    item.position.set(...position);
    item.castShadow = true;
    item.receiveShadow = true;
    parent.add(item);
    return item;
  }
  const box = (name, size, pos, mat, parent) => {
    const rounded =
      /foundation|desktop|backrest|Shelf$|Speaker cabinet|picture frame/.test(
        name,
      );
    const geometry = rounded
      ? new RoundedBoxGeometry(
          ...size,
          2,
          Math.min(0.04, Math.min(...size) * 0.3),
        )
      : new THREE.BoxGeometry(...size);
    return mesh(name, geometry, mat, pos, parent);
  };
  const cyl = (name, top, bottom, height, pos, mat, parent, segments = 24) =>
    mesh(
      name,
      new THREE.CylinderGeometry(top, bottom, height, segments),
      mat,
      pos,
      parent,
    );
  const ball = (name, radius, pos, mat, parent) =>
    mesh(name, new THREE.SphereGeometry(radius, 20, 14), mat, pos, parent);
  const group = (name, pos, parent = room) => {
    const g = new THREE.Group();
    g.name = name;
    g.position.set(...pos);
    parent.add(g);
    return g;
  };
  function line(name, points, radius, mat, parent) {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
    );
    return mesh(
      name,
      new THREE.TubeGeometry(curve, 20, radius, 7, false),
      mat,
      [0, 0, 0],
      parent,
    );
  }
  function leaf(name, pos, scale, angle, mat, parent) {
    const l = ball(name, 1, pos, mat, parent);
    l.scale.set(...scale);
    l.rotation.z = angle;
    return l;
  }
  function plant(name, pos, size, parent = room) {
    const p = group(name, pos, parent);
    cyl(
      "Ceramic pot",
      size * 0.66,
      size * 0.48,
      size * 1.05,
      [0, size * 0.52, 0],
      "terracotta",
      p,
    );
    cyl(
      "Rolled pot rim",
      size * 0.71,
      size * 0.71,
      size * 0.14,
      [0, size, 0],
      "terracotta",
      p,
    );
    cyl(
      "Soil",
      size * 0.61,
      size * 0.61,
      0.025,
      [0, size * 1.08, 0],
      "soil",
      p,
    );
    for (let i = 0; i < 7; i++) {
      const a = i * 2.399;
      const r = size * (i < 3 ? 0.7 : 1.0);
      const h = size * (i < 3 ? 2.8 : 2.1);
      const x = Math.cos(a) * r,
        z = Math.sin(a) * r;
      line(
        "Stem " + i,
        [
          [0, size, 0],
          [x * 0.3, size * 1.7, z * 0.3],
          [x, h, z],
        ],
        size * 0.025,
        "leaf",
        p,
      );
      const l = leaf(
        "Leaf " + i,
        [x, h, z],
        [size * 0.35, size * 0.75, size * 0.11],
        -0.5 + i * 0.16,
        i % 2 ? "leaf" : "lightLeaf",
        p,
      );
      l.rotation.y = -a;
    }
    return p;
  }
  // A floating plinth, plank floor, and open-front architectural shell.
  box("Floating foundation", [5.2, 0.24, 4.5], [0, -0.18, 0], "plaster");
  box("Foundation shadow line", [5.05, 0.07, 4.35], [0, -0.04, 0], "oak");
  for (let i = 0; i < 13; i++)
    box(
      "Oak floorboard " + String(i + 1).padStart(2, "0"),
      [0.385, 0.055, 4.27],
      [-2.31 + i * 0.385, 0.02, 0],
      i % 3 === 0 ? "oak" : "wood",
    );
  box("Back wall", [5.1, 3.25, 0.13], [0, 1.64, -2.12], "wall");
  // The left wall is built around the window, rather than hiding a solid wall behind glass.
  box("Window wall lower", [0.13, 0.88, 4.3], [-2.49, 0.48, 0], "plaster");
  box("Window wall upper", [0.13, 0.36, 4.3], [-2.49, 3.09, 0], "plaster");
  box(
    "Window wall rear pier",
    [0.13, 2.25, 0.6],
    [-2.49, 1.93, -1.83],
    "plaster",
  );
  box(
    "Window wall front pier",
    [0.13, 2.25, 0.75],
    [-2.49, 1.93, 1.77],
    "plaster",
  );
  box("Back wall cap", [5.25, 0.09, 0.2], [0, 3.31, -2.12], "trim");
  box("Left wall cap", [0.2, 0.09, 4.45], [-2.49, 3.31, 0], "cream");
  box("Back skirting", [5, 0.15, 0.07], [0, 0.15, -2.03], "trim");
  box("Left skirting", [0.07, 0.15, 4.3], [-2.39, 0.15, 0], "cream");
  const windowFrame = group("Sunroom_window", [-2.4, 1.92, -0.05]);
  box("Window sill", [0.42, 0.1, 3.02], [0.04, -0.99, 0], "wood", windowFrame);
  for (const z of [-1.44, 0, 1.44])
    box(
      "Window vertical mullion",
      [0.11, 2.02, 0.07],
      [0, 0, z],
      "cream",
      windowFrame,
    );
  for (const y of [-0.98, 0, 0.98])
    box(
      "Window crossbar",
      [0.11, 0.065, 2.92],
      [0, y, 0],
      "cream",
      windowFrame,
    );
  const glass = new THREE.MeshStandardMaterial({
    color: "#b8d1bd",
    transparent: true,
    opacity: 0.26,
    roughness: 0.12,
    side: THREE.DoubleSide,
  });
  box(
    "Daylight glazing",
    [0.025, 1.92, 2.83],
    [-0.05, 0, 0],
    glass,
    windowFrame,
  );
  const landscape = group("View_through_window", [-2.58, 1.8, 0]);
  // Simple distant silhouettes behind the glazing give the window depth.
  for (let i = 0; i < 5; i++) {
    const bush = ball(
      "Garden silhouette " + i,
      0.48,
      [0, -0.55 + i * 0.07, -1.15 + i * 0.55],
      "lightLeaf",
      landscape,
    );
    bush.scale.set(0.12, 1.0 + i * 0.08, 1);
  }
  plant("Windowsill_plant", [-2.22, 1.03, 0.72], 0.17);
  // Woven rug with actual raised weave strips and fringe.
  const rug = group("Woven_rug", [0.45, 0.07, 0.75]);
  box("Rug base", [2.8, 0.035, 2.15], [0, 0, 0], "cream", rug);
  for (let i = 0; i < 22; i++)
    box(
      "Woven stripe " + i,
      [2.77, 0.008, 0.018],
      [0, 0.023, -1 + i * 0.095],
      i % 4 === 0 ? "terracotta" : "wood",
      rug,
    );
  for (let side of [-1, 1])
    for (let i = 0; i < 24; i++)
      box(
        "Cotton fringe",
        [0.13, 0.014, 0.018],
        [side * 1.46, 0.005, -1 + i * 0.085],
        "cream",
        rug,
      );
  // Main desk and original coding screen, with small tactile objects.
  const desk = group("Standing_desk", [0.02, 0, -0.92]);
  box("Solid oak desktop", [2.55, 0.12, 1.03], [0, 1.28, 0], "wood", desk);
  box("Desk front edge", [2.55, 0.035, 0.035], [0, 1.28, 0.525], "oak", desk);
  for (const x of [-1.05, 1.05])
    for (const z of [-0.37, 0.37])
      box("Desk leg", [0.075, 1.2, 0.075], [x, 0.64, z], "dark", desk);
  box("Under desk rail", [2.1, 0.1, 0.06], [0, 0.93, -0.37], "dark", desk);
  const monitor = group("Monitor", [0, 1.34, -0.18], desk);
  box("Monitor foot", [0.48, 0.045, 0.26], [0, 0.025, 0.02], "dark", monitor);
  box("Monitor stand", [0.065, 0.25, 0.065], [0, 0.15, -0.02], "dark", monitor);
  box("Monitor frame", [1.33, 0.79, 0.075], [0, 0.62, -0.03], "dark", monitor);
  box(
    "Screen glass",
    [1.23, 0.69, 0.012],
    [0, 0.62, 0.014],
    screenGlow,
    monitor,
  );
  box(
    "Screen sidebar",
    [0.18, 0.61, 0.014],
    [-0.49, 0.62, 0.024],
    "wall",
    monitor,
  );
  for (let i = 0; i < 9; i++)
    box(
      "Editor code line " + i,
      [0.16 + ((i * 7) % 5) * 0.1, 0.014, 0.015],
      [-0.12 + (i % 3) * 0.055, 0.86 - i * 0.058, 0.026],
      i % 3 === 0 ? "terracotta" : i % 2 ? "lightLeaf" : "cream",
      monitor,
    );
  ball("Monitor status LED", 0.012, [0.52, 0.255, 0.014], glow, monitor);
  box("Desk mat", [1.32, 0.012, 0.4], [0.05, 1.351, 0.24], "wall", desk);
  box("Keyboard body", [0.8, 0.035, 0.27], [-0.08, 1.37, 0.22], "cream", desk);
  for (let row = 0; row < 4; row++)
    for (let key = 0; key < 12; key++)
      box(
        "Key " + row + "-" + key,
        [0.048, 0.012, 0.043],
        [-0.43 + key * 0.062, 1.394, 0.12 + row * 0.059],
        key === 0 && row === 0 ? "terracotta" : "paper",
        desk,
      );
  const mouse = ball("Mouse", 0.09, [0.52, 1.38, 0.23], "cream", desk);
  mouse.scale.set(0.7, 0.35, 1);
  cyl("Coffee mug", 0.095, 0.085, 0.18, [0.9, 1.43, 0.23], "terracotta", desk);
  cyl("Coffee surface", 0.08, 0.08, 0.006, [0.9, 1.523, 0.23], "soil", desk);
  const handle = mesh(
    "Mug handle",
    new THREE.TorusGeometry(0.068, 0.017, 8, 18),
    "terracotta",
    [1.006, 1.44, 0.23],
    desk,
  );
  handle.rotation.y = Math.PI / 2;
  box(
    "Closed sketchbook",
    [0.33, 0.04, 0.43],
    [-0.96, 1.36, 0.18],
    "pink",
    desk,
  ).rotation.y = -0.18;
  box(
    "Pencil",
    [0.018, 0.018, 0.31],
    [-0.92, 1.39, 0.18],
    "brass",
    desk,
  ).rotation.y = 0.25;
  const speaker = group("Speaker", [0.93, 1.35, -0.3], desk);
  box("Speaker cabinet", [0.24, 0.34, 0.2], [0, 0.17, 0], "dark", speaker);
  const driver = cyl(
    "Speaker cone",
    0.075,
    0.075,
    0.018,
    [0, 0.14, 0.11],
    "oak",
    speaker,
  );
  driver.rotation.x = Math.PI / 2;
  plant("Desk_succulent", [-1.03, 1.35, -0.28], 0.1, desk);
  // Curved chair, a seat cushion, five castors, and back upholstery.
  const chair = group("Task_chair", [0.22, 0, 0.62]);
  chair.rotation.y = -0.18;
  cyl("Chair pedestal", 0.04, 0.045, 0.54, [0, 0.42, 0], "dark", chair);
  cyl("Seat cushion", 0.35, 0.32, 0.13, [0, 0.75, 0], "terracotta", chair);
  for (let i = 0; i < 5; i++) {
    let a = (i * Math.PI * 2) / 5;
    line(
      "Chair spoke " + i,
      [
        [0, 0.18, 0],
        [Math.cos(a) * 0.32, 0.12, Math.sin(a) * 0.32],
      ],
      0.035,
      "dark",
      chair,
    );
    const wheel = ball(
      "Castor " + i,
      0.065,
      [Math.cos(a) * 0.32, 0.085, Math.sin(a) * 0.32],
      "dark",
      chair,
    );
    wheel.scale.set(1, 0.8, 1);
  }
  box("Backrest support", [0.07, 0.59, 0.06], [0, 0.92, 0.26], "dark", chair);
  const back = box(
    "Upholstered backrest",
    [0.64, 0.49, 0.13],
    [0, 1.2, 0.29],
    "terracotta",
    chair,
  );
  back.rotation.x = -0.09;
  for (let x of [-0.3, 0.3])
    box("Armrest", [0.06, 0.05, 0.4], [x, 0.99, 0.04], "oak", chair);
  // Bookshelves, a framed print, and a pegboard, made from distinct geometry.
  const shelves = group("Floating_shelves", [1.53, 0, -1.93]);
  for (let y of [1.25, 2.05, 2.82]) {
    box("Shelf", [1.28, 0.075, 0.38], [0, y, 0], "wood", shelves);
    for (let x of [-0.45, 0.45])
      box(
        "Brass bracket",
        [0.035, 0.2, 0.24],
        [x, y - 0.12, -0.01],
        "brass",
        shelves,
      );
  }
  const bookColors = ["cream", "terracotta", "blue", "lightLeaf", "pink"];
  for (let i = 0; i < 8; i++)
    box(
      "Design book " + i,
      [0.085, 0.28 + (i % 3) * 0.05, 0.21],
      [-0.5 + i * 0.11, 2.24 + (i % 3) * 0.025, 0.015],
      bookColors[i % 5],
      shelves,
    ).rotation.z = i === 7 ? -0.16 : 0;
  for (let i = 0; i < 3; i++)
    box(
      "Stacked notebook " + i,
      [0.38, 0.055, 0.26],
      [-0.3, 1.32 + i * 0.058, 0.01],
      bookColors[i],
      shelves,
    );
  plant("Shelf_pothos", [1.9, 2.86, -1.93], 0.12);
  for (let i = 0; i < 8; i++) {
    let y = 2.85 - i * 0.09;
    line(
      "Trailing vine " + i,
      [
        [1.91, y, -1.78],
        [1.94, y - 0.09, -1.7],
      ],
      0.01,
      "leaf",
      room,
    );
    leaf(
      "Pothos leaf " + i,
      [1.94 + (i % 2 ? 0.06 : -0.06), y - 0.08, -1.7],
      [0.075, 0.045, 0.025],
      i % 2 ? 0.6 : -0.6,
      "leaf",
      room,
    );
  }
  cyl("Shelf vase", 0.09, 0.13, 0.3, [0.28, 1.44, 0], "blue", shelves);
  const art = group("Framed_sun_print", [-0.43, 2.47, -2.035]);
  box("Oak picture frame", [0.75, 0.85, 0.055], [0, 0, 0], "oak", art);
  box("Print paper", [0.65, 0.75, 0.02], [0, 0, 0.035], "paper", art);
  const sun = cyl(
    "Printed sun",
    0.17,
    0.17,
    0.006,
    [0, 0.065, 0.05],
    "terracotta",
    art,
    48,
  );
  sun.rotation.x = Math.PI / 2;
  for (let i = 0; i < 4; i++)
    box(
      "Print horizon " + i,
      [0.47, 0.012, 0.006],
      [0, -0.14 - i * 0.055, 0.054],
      "wall",
      art,
    );
  const clock = group("Wall_clock", [-1.72, 2.62, -2.02]);
  const face = cyl(
    "Clock face",
    0.25,
    0.25,
    0.055,
    [0, 0, 0],
    "cream",
    clock,
    48,
  );
  face.rotation.x = Math.PI / 2;
  box(
    "Hour hand",
    [0.025, 0.12, 0.015],
    [0, 0.05, 0.04],
    "dark",
    clock,
  ).rotation.z = -0.7;
  box(
    "Minute hand",
    [0.018, 0.18, 0.015],
    [0.07, 0.025, 0.043],
    "dark",
    clock,
  ).rotation.z = -1.2;
  ball("Clock pin", 0.025, [0, 0, 0.06], "brass", clock);
  // Floor lamp, a reading nook, and a substantial indoor plant.
  const lamp = group("Reading_lamp", [1.8, 0, 0.65]);
  cyl("Lamp base", 0.23, 0.26, 0.055, [0, 0.1, 0], "dark", lamp);
  cyl("Lamp stem", 0.022, 0.022, 1.9, [0, 1.05, 0], "brass", lamp);
  cyl("Linen shade", 0.18, 0.36, 0.4, [0, 2.03, 0], "cream", lamp, 40);
  cyl("Warm diffuser", 0.31, 0.31, 0.02, [0, 1.83, 0], glow, lamp);
  const lampLight = new THREE.PointLight("#ffcf87", 0, 4, 2);
  lampLight.name = "Reading light";
  lampLight.position.set(1.8, 1.8, 0.65);
  room.add(lampLight);
  plant("Monstera", [-1.82, 0.07, 1.35], 0.35);
  const stool = group("Side_stool", [1.77, 0, 1.61]);
  cyl("Stool seat", 0.28, 0.28, 0.09, [0, 0.56, 0], "wood", stool);
  for (let i = 0; i < 3; i++) {
    let a = i * 2.094;
    box(
      "Stool leg",
      [0.055, 0.5, 0.055],
      [Math.cos(a) * 0.18, 0.29, Math.sin(a) * 0.18],
      "oak",
      stool,
    );
  }
  box(
    "Little book",
    [0.26, 0.045, 0.31],
    [0, 0.63, 0],
    "blue",
    stool,
  ).rotation.y = 0.2;
  // A complete curled tabby: connected limbs, sculpted ears, and a readable face.
  const cat = group("Studio_cat", [-0.98, 0.12, 1.3]);
  cat.rotation.y = -0.3;
  const body = ball(
    "Rounded tabby torso",
    0.3,
    [-0.07, 0.19, -0.025],
    "cat",
    cat,
  );
  body.scale.set(1.18, 0.72, 0.86);
  const haunch = ball(
    "Folded hindquarters",
    0.2,
    [-0.23, 0.16, 0.01],
    "cat",
    cat,
  );
  haunch.scale.set(0.95, 0.8, 1);
  const chest = ball(
    "Cream chest bib",
    0.13,
    [0.18, 0.145, 0.18],
    "cream",
    cat,
  );
  chest.scale.set(0.88, 1, 0.8);
  const head = group("Tabby head", [0.15, 0.285, 0.17], cat);
  const skull = ball("Soft round head", 0.18, [0, 0, 0], "cat", head);
  skull.scale.set(1.08, 0.97, 0.92);
  const sleepingEyes = [];
  const awakeEyes = [];
  const ears = [];
  for (const side of [-1, 1]) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.072, 0);
    shape.lineTo(0.072, 0);
    shape.lineTo(side * 0.025, 0.155);
    shape.closePath();
    const ear = mesh(
      side < 0 ? "Left sculpted ear" : "Right sculpted ear",
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.055,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.009,
        bevelThickness: 0.008,
      }),
      "cat",
      [side * 0.112, 0.102, -0.015],
      head,
    );
    ear.rotation.z = -side * 0.12;
    ears.push(ear);
    const inset = new THREE.Shape();
    inset.moveTo(-0.042, 0.023);
    inset.lineTo(0.042, 0.023);
    inset.lineTo(side * 0.017, 0.115);
    inset.closePath();
    mesh(
      "Velvet inner ear",
      new THREE.ShapeGeometry(inset),
      "catPink",
      [0, 0, 0.065],
      ear,
    );
    const cheek = ball(
      "Cream muzzle cheek",
      0.058,
      [side * 0.039, -0.057, 0.143],
      "cream",
      head,
    );
    cheek.scale.set(1, 0.73, 0.62);
    sleepingEyes.push(
      line(
        "Closed sleeping eye",
        [
          [side * 0.115, 0.005, 0.132],
          [side * 0.084, -0.009, 0.153],
          [side * 0.051, 0.005, 0.161],
        ],
        0.008,
        "dark",
        head,
      ),
    );
    const eye = group("Open emerald eye", [side * 0.083, 0.005, 0.15], head);
    const irisMaterial = new THREE.MeshStandardMaterial({
      color: "#84ab68",
      roughness: 0.26,
    });
    const iris = ball("Emerald iris", 0.037, [0, 0, 0], irisMaterial, eye);
    iris.scale.set(1, 1.1, 0.45);
    const pupil = ball("Slit pupil", 0.024, [0, 0, 0.016], "dark", eye);
    pupil.scale.set(0.3, 1.25, 0.3);
    ball("Eye catchlight", 0.009, [-0.009, 0.013, 0.023], "cream", eye);
    eye.visible = false;
    awakeEyes.push(eye);
    line(
      "Cheek tabby marking",
      [
        [side * 0.158, -0.005, 0.087],
        [side * 0.145, -0.03, 0.106],
        [side * 0.127, -0.043, 0.12],
      ],
      0.012,
      "catStripe",
      head,
    );
    for (let i = 0; i < 3; i++) {
      line(
        "Fine whisker",
        [
          [side * 0.062, -0.055 - i * 0.012, 0.174],
          [side * 0.139, -0.047 - i * 0.02, 0.18],
          [side * 0.205, -0.031 - i * 0.03, 0.167],
        ],
        0.0022,
        "cream",
        head,
      );
    }
  }
  const nose = new THREE.Shape();
  nose.moveTo(-0.021, 0.009);
  nose.lineTo(0.021, 0.009);
  nose.lineTo(0, -0.015);
  nose.closePath();
  mesh(
    "Rosy triangular nose",
    new THREE.ShapeGeometry(nose),
    "catPink",
    [0, -0.038, 0.18],
    head,
  );
  line(
    "Muzzle centre",
    [
      [0, -0.051, 0.181],
      [0, -0.073, 0.179],
    ],
    0.003,
    "catStripe",
    head,
  );
  for (const side of [-1, 1])
    line(
      "Sleepy smile",
      [
        [0, -0.073, 0.179],
        [side * 0.012, -0.082, 0.177],
        [side * 0.024, -0.076, 0.174],
      ],
      0.003,
      "catStripe",
      head,
    );
  for (const x of [-0.055, 0, 0.055])
    line(
      "Forehead tabby stripe",
      [
        [x, 0.135, 0.068],
        [x * 0.85, 0.104, 0.119],
        [x * 0.7, 0.071, 0.145],
      ],
      0.011,
      "catStripe",
      head,
    );
  for (const [index, x] of [0.075, 0.26].entries()) {
    const leg = ball(
      "Tucked front leg " + index,
      0.085,
      [x, 0.11, 0.23],
      "cat",
      cat,
    );
    leg.scale.set(0.8, 0.8, 1.3);
    const paw = ball(
      "Cream front paw " + index,
      0.078,
      [x, 0.075, 0.305],
      "cream",
      cat,
    );
    paw.scale.set(0.9, 0.6, 1.1);
    for (const offset of [-0.021, 0.021])
      line(
        "Toe crease",
        [
          [x + offset, 0.098, 0.366],
          [x + offset, 0.072, 0.378],
        ],
        0.0025,
        "catStripe",
        cat,
      );
  }
  for (const z of [-0.1, 0.16]) {
    const paw = ball("Tucked hind paw", 0.085, [-0.26, 0.075, z], "cream", cat);
    paw.scale.set(1.1, 0.6, 0.8);
  }
  const tailPoints = [
    [-0.28, 0.19, -0.13],
    [-0.43, 0.12, -0.02],
    [-0.4, 0.085, 0.22],
    [-0.24, 0.075, 0.32],
    [-0.08, 0.08, 0.28],
  ];
  line("Full curled tail", tailPoints, 0.057, "cat", cat);
  const tailTip = ball(
    "Cream tail tip",
    0.058,
    [-0.08, 0.08, 0.28],
    "cream",
    cat,
  );
  tailTip.scale.set(1.2, 0.9, 1);
  for (let i = 0; i < 3; i++) {
    const x = -0.24 + i * 0.1;
    line(
      "Back tabby stripe " + i,
      [
        [x, 0.368, -0.045],
        [x - 0.025, 0.348, 0.055],
        [x - 0.035, 0.3, 0.13],
      ],
      0.016,
      "catStripe",
      cat,
    );
  }
  // A wall sign and mini pinboard create a recognisable personal space.
  const board = group("Pinboard", [0.65, 2.52, -2.02]);
  box("Cork backing", [0.6, 0.52, 0.045], [0, 0, 0], "oak", board);
  for (let i = 0; i < 3; i++) {
    const note = box(
      "Pinned idea " + i,
      [0.15, 0.18, 0.012],
      [-0.18 + i * 0.17, (i % 2) * 0.12 - 0.05, 0.035],
      bookColors[i],
      board,
    );
    note.rotation.z = (i - 1) * 0.12;
    ball(
      "Brass pin",
      0.012,
      [-0.18 + i * 0.17, (i % 2) * 0.12 + 0.02, 0.048],
      "brass",
      board,
    );
  }
  room.userData = {
    title: "The Creative Corner",
    author: "SloWey",
    description:
      "Original procedural studio, built from editable named meshes. Units: metres.",
  };
  return {
    model: room,
    cat,
    chair,
    lampLight,
    glow,
    screenGlow,
    catRig: { head, sleepingEyes, awakeEyes, ears },
  };
}
