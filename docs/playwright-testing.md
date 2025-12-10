# Playwright Testing Guide

## Setup
- Install Playwright in the Angular workspace: `npm i -D @playwright/test` then `npx playwright install`.
- Add a project-level `playwright.config.ts` that aligns with Angular's dist output.

## Recommended Config
```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  use: {
    baseURL: 'http://localhost:4200',
    viewport: { width: 1280, height: 720 },
    hasTouch: true,           // emulate touch devices (Playwright docs)
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium-desktop' },
    { name: 'webkit-mobile', use: { viewport: { width: 430, height: 932 } } },
  ],
});
```

## Responsive Coverage
- Record baseline journeys with `npx playwright codegen http://localhost:4200` for desktop and touch breakpoints.
- Add foldable-focused suites by emulating orientations and adjusting viewports (e.g., `{ width: 1280, height: 720 }` with hinge-safe layout assertions).
- Use `page.setViewportSize()` within tests to hop between 360px, 912px, and 1280px widths when verifying layout tokens.

## Component Testing Hooks
- Mount Angular components with the experimental component runner, using fixtures similar to Playwright's Vue example (`beforeMount`, `afterMount`) to inject providers and tokens.
- Stub network calls via the `router.use()` fixture or `page.route()` to isolate hero rendering.

## Assertions & Artifacts
- Snapshot `.hero-grid` at each breakpoint; store golden files under `tests/playwright/__screenshots__`.
- Capture traces (`npx playwright show-trace trace.zip`) and attach them to PRs alongside manual screenshots called out in the quickstart.

## CI Integration
- Run `npm run start` (or `ng serve`) in the background, then execute `npx playwright test --reporter=line`.
- Fail fast on accessibility regressions by integrating `@axe-core/playwright` where keyboard navigation is critical.
