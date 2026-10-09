# Coforge Dashboard

A React and TypeScript dashboard demo with separate pages for Sales and Delivery, and Account Growth.

## Live dashboards

- [Sales and Delivery](https://rajaMedindrao.github.io/Coforge_Dashboard/sales-performance/)
- [Account Growth](https://rajaMedindrao.github.io/Coforge_Dashboard/sales-growth/)

Sales and Delivery share one page with two tabs. Account Growth has its own page with a single tab. Both support drill-down from company to business unit, sub-business unit, and account; Account Growth also provides opportunity details.

## Run locally

Use Node.js 22 or newer and install dependencies from the repository root:

```sh
npm ci
npm run dev
```

Open these pages on the same development server:

- Sales and Delivery: http://127.0.0.1:5182/sales-performance/
- Account Growth: http://127.0.0.1:5182/sales-growth/

## Build and verify

```sh
npm run build
npx tsc --noEmit -p sales-growth/tsconfig.json
npm test
npm --prefix sales-growth test
```

The production build places both dashboards and their shared assets in `dist/`. To preview it locally, run `npm run preview`.

Optional browser checks require Playwright's Chromium browser and the development server to be running:

```sh
npx playwright install chromium
npm run qa
npm --prefix sales-growth run qa
npm --prefix sales-growth run qa:all
```

## GitHub Pages deployment

The workflow in `.github/workflows/deploy-pages.yml` checks TypeScript, runs both test suites, builds both dashboards, and publishes `dist/` to GitHub Pages. It runs on pushes to `main` and can also be started manually from GitHub Actions. The build uses the repository's Pages base path so assets load correctly beneath `/Coforge_Dashboard/`.

GitHub Pages must use **GitHub Actions** as its publishing source. Deployment follows the [GitHub Pages custom workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Project structure and demo data

- `sales-performance/src/`: Sales and Delivery pages, shared components, styles, and calculation models.
- `sales-growth/src/`: Account Growth pages, opportunity details, and growth calculations.
- `sales-performance/src/data/staticData.ts`: Sales and Delivery demo data.
- `sales-growth/src/data/growthData.ts`: Account Growth demo data.
- `sales-performance/tests/` and `sales-growth/tests/`: calculation, navigation, and browser checks.
- `vite.config.ts`: shared development server and multi-page production build.

This is an interview demo using illustrative static data, not a connection to live Coforge systems. The displayed review period is Q2 FY27 (July–September 2026). Financial source values use USD thousands and are formatted for display. Potential opportunities are excluded from active pipeline rollups. Metric cards expose their formulas and thresholds through tooltips.

The header uses the official dark-background SVG logo from [Coforge's press kit](https://news.coforge.com/newsroom/press-kit), stored in `sales-performance/src/assets/coforge-logo-dark.svg` and shared by both dashboards.
