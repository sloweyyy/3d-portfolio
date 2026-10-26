# SloWey / The Creative Corner

An original, full-screen 3D studio and personal portfolio. Built with Three.js and Vite.

The interface uses an immersive world with deep-linked native dialogs for Work, About, and Contact. Escape returns to the studio. The default after-hours palette can switch to golden hour. The cat wakes, follows the pointer, blinks, and reacts to pets. `atmosphere.js` adds window light shafts, drifting motes, and floating hearts. Camera transitions respect the motion toggle and reduced-motion preferences.

## Run locally

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. No API keys or backend are needed.

## The new model

The entire studio is built from named, editable meshes in `studio-model.js`. It does not fetch a GLB or video to start. The old `Experience/` and `public/` files remain as historical reference; they are not imported or published by the new build.

- Architecture: open-front walls, a mullioned window, garden silhouettes, oak floorboards, and a floating plinth.
- Desk: individual keys, code on the monitor, a coffee mug, sketchbook, speaker, and succulent.
- Furniture: upholstered chair with five castors, oak shelves, reading lamp, and a small stool.
- Details: books, framed print, clock, pinned ideas, trailing pothos, woven rug, and a sleeping cat.
- Three views: the whole studio, a close look at the desk, and the resident cat.
- Day/night lighting and a saved theme preference. The cat breathes gently; motion can be paused.

`studio.js` handles the camera, lighting, rendering, and controls. Animation stops when the studio is offscreen or the tab is hidden, and respects reduced-motion preferences. Rendering is capped at 30 fps and device pixel ratio at 1.75. Touch users can scroll normally; the view buttons work on phones.

The HTML remains readable if JavaScript or WebGL fails. WebGL context loss shows a fallback without hiding the projects or links.

## Build and check

```sh
npm run build
npx playwright install chromium
npm test
```

The browser tests run the **built** site at `/3d-portfolio/`, matching the GitHub Pages URL. They cover asset loading, the rendered scene, view buttons, theme persistence, motion controls, navigation, mobile overflow, reduced motion, and unavailable WebGL.

Vite builds relative asset URLs. `publicDir: false` prevents unused legacy models, decoders, and the 10 MB video from being copied into the deployment. The initial app is small; the 3D code loads separately.

## Publish to GitHub Pages

The old site served the source HTML directly from `main`. That HTML requested `/main.js` at the domain root, causing a 404. Without Vite running, its JavaScript imports and CSS could not work anyway.

`.github/workflows/pages.yml` builds and tests the app, then publishes only `dist/` through GitHub Pages. After reviewing the local preview:

1. Push this branch and merge its changes into `main`.
2. In **Settings → Pages → Build and deployment**, change **Source** from **Deploy from a branch** to **GitHub Actions**.
3. Run **Deploy portfolio to GitHub Pages** if it did not start automatically.
4. Check the workflow and the live site at <https://sloweyyy.github.io/3d-portfolio/>.

The workflow deploys updates to `main` only after the browser checks pass.

## Model export

With the development server running, export an editable GLB with:

```sh
npm run export:model
```

The file is written to `artifacts/creative-corner.glb`. Open it in Blender or another glTF viewer. Each object keeps its descriptive name and material. Generated exports and screenshots are ignored by Git.
