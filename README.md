# shrestbijakal

Factory-floor portfolio: an iron/orange industrial bay where resume sections travel the conveyor as packages. After load, click a crate — the belt indexes it to the station and the section panel opens.

## Stack

- Vite + React 19
- three / @react-three/fiber / @react-three/drei

## Setup

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## GitHub Pages

Pushes to `developing` build and deploy via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Target site URL: https://ShrestBijakal.github.io/

GitHub only serves `*.github.io` user/org sites when the account or org login matches. To leave `awdwai.github.io` for that hostname:

1. Create a GitHub organization named **ShrestBijakal** (https://github.com/organizations/new), **or** rename the `awdwai` user to `ShrestBijakal`.
2. Move/rename this repo to `ShrestBijakal/ShrestBijakal.github.io`.
3. Keep Pages source as **GitHub Actions**.

Until that exists, the live deploy remains at https://awdwai.github.io/.

## Content

Resume copy lives in [`src/data/site.js`](src/data/site.js). Each crate paints its section `label` (Education, Projects, …), matching nav and the ContentPanel title. Project Live/GitHub links are `null` until you add URLs. Phone is omitted by default.

## 3D model credit

See the site Footer and `site.modelCredit`. The robotic arm is a **site-built procedural** iron/jet-black + orange 6-axis model (no third-party GLB). Sketchfab CC-BY downloads required auth; AGPL teaching assets were not used.

## Branch

Work lives on `developing`. Do not push until requested.
