# Copilot instructions for stollenhof

This file helps Copilot CLI sessions and AI assistants understand how to work with this repository.

## Project layout (high level)
- /public - static assets and the web entry point (index.html, styles)
- /public/assets/kuh_bilder - cow images expected to be named 1.png .. 30.png (absolute asset paths start with `/assets/kuh_bilder/`)
- /src - ES modules (Stall3D.js, app.js)
- /src/Stall3D.js - ES6 class implementing the Three.js scene, texture loading with fallbacks, raycasting and scroll navigation

## How to run (dev / preview)
- The project is a static web app. Serve the `public` folder with any static server. Examples:
  - npx http-server public -c-1  # quick preview
  - npx serve public              # alternative
  - npm install -g live-server && live-server public

## Build / test / lint commands
- No build or test scripts are configured in this repository by default.
- If a framework or bundler is added later, put build scripts into package.json and update this file.
- To run a single page preview (no test runner): use the static server command above.

## Key development commands (one-liners)
- Create assets dir and a placeholder default image:
  mkdir -p public/assets/kuh_bilder && curl -sS "https://via.placeholder.com/512.png?text=default" -o public/assets/kuh_bilder/default.png

## High-level architecture notes
- Stall3D is intentionally modular and framework-agnostic: import the ES6 class and instantiate with a container element.
- The scene uses PlaneGeometry meshes (one per slot). Each mesh stores domain data in `mesh.userData` (id, name, earTag, breed, place, imgPath).
- Textures are loaded via THREE.TextureLoader: on error a dynamic SVG Data-URL is used as fallback containing the slot number.
- Camera movement: mouse wheel updates an internal target Z position; the animation loop lerps the camera/controls target for smooth movement.
- Interaction: Raycaster checks intersections and calls the supplied `onSlotClick` callback with the mesh.userData.

## Key conventions (repository-specific)
- Asset paths for cow images must be absolute from the site root: `/assets/kuh_bilder/1.png` ... `/assets/kuh_bilder/30.png`.
- Plane orientation: each cow plane uses `rotation.y = Math.PI / 2` so it faces into the aisle correctly.
- Spacing and sizes are configurable via constructor options: `cowCount`, `spacing`, `planeSize`, `planeY`.
- UI: a simple HTML/CSS popup exists in `public/index.html` / `public/styles.css` and listens to the callback from `Stall3D`.

## Files to inspect for deeper changes
- /src/Stall3D.js - Three.js scene and interactions
- /src/app.js - example integration and test data
- /public/index.html - mount point and popup
- /public/styles.css - popup styling and responsive rules

## Other AI-assistant configs
- No CLAUDE.md, AGENTS.md, .windsurfrules, or other assistant/rules files were found. If you use other assistant types, add their guidance into this folder.

---

If you plan to add a frontend framework (Next.js, Vite, React, Vue) update the `public` vs `src` layout and add appropriate build scripts; keep the asset paths absolute (`/assets/...`) to avoid base-path issues.
