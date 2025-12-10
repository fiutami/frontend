# Responsive & Foldable Cheat Sheet

## Core Breakpoints
- 360–480px: mobile portrait (single-column stack).
- 481–839px: mobile landscape / small tablets (two-row layout, media above content).
- 840–1279px: hybrid/tablet (two-column layout with hero media ~55% width).
- ≥1280px: desktop split (content + media columns, max width 1200px).

Use mobile-first CSS with `@media (width >= 600px)` style upgrades similar to the MDN responsive grid example.

## Fluid Typography & Spacing
- Scale headlines with `clamp()` or `calc(1.5rem + 4vw)` for consistent growth.
- Favor relative units (`rem`, `%`, `vw`) so user zoom and large-text settings remain usable.

## Safe Areas & Cutouts
- Enable full-bleed layouts with `<meta name="viewport" content="viewport-fit=cover">`.
- Pad interactive regions with safe-area env vars:
  ```scss
  padding-inline: calc(var(--space-4) + env(safe-area-inset-left));
  padding-block-start: calc(var(--space-6) + env(safe-area-inset-top, 0px));
  ```

## Foldable & Posture Queries
- Detect hinges using Device Posture media queries:
  ```scss
  @media (device-posture: folded) and (orientation: landscape) {
    .hero-grid {
      gap: var(--space-8);
      grid-template-columns: 1fr 1fr;
    }
  }
  ```
- Provide fallbacks for browsers lacking the API by relying on width/orientation queries first.

## Viewport Segments Strategy
- Treat hinge regions as gutters: avoid placing CTA footprints over the fold.
- Mirror content alignment by moving the dog illustration to the non-interactive segment when folded.
- For multi-panel experiences, keep shared navigation in the primary segment and surface contextual panels (legal copy/social login) in the secondary segment.

## Accessibility & Motion Preferences
- Respect `prefers-reduced-motion: reduce` to disable hero entrance animations.
- Maintain 4.5:1 contrast for text overlaying imagery across all postures.

## Asset Guidance
- Provide AVIF/WebP sources for each breakpoint with PNG fallbacks (`<picture>` as in `hero.component.html`).
- Limit hero assets to ≤512 KB per MDN performance recommendations; monitor with `ng build --configuration production --stats-json`.
