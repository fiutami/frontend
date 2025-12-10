# Hero “FiutaMi” – Acceptance Matrix (mobile-first)

| ID | Acceptance Criteria | Verifica | Tipo | KPI |
| --- | --- | --- | --- | --- |
| AC-01 | Nessuno scroll su 812×375 pt (iPhone X) | Playwright snapshot portrait-360 | Visual | n/a |
| AC-02 | Nessuno scroll su 780×360 dp (Android) | Playwright snapshot android-360 | Visual | n/a |
| AC-03 | Cane con headroom ≥ 8%, orecchie integre, gradiente applicato | Playwright + review design | Visual | n/a |
| AC-04 | CTA “Accedi” full-width, touch-target ≥ 44 pt, contrasto AA | Jest/Unit + axe + manual | A11y | AA ≥ 4.5:1 |
| AC-05 | CTA “Registrati” outline/ghost con stessi requisiti touch/contrast | Idem AC-04 | A11y | AA ≥ 4.5:1 |
| AC-06 | Nota legale apre Termini & Privacy in browser esterno | Playwright action + stub | Funzionale | Link esterno OK |
| AC-07 | Social bar (Apple/Google) hit area ≥ 44×44 pt e azione stub | Playwright + unit | Funzionale | n/a |
| AC-08 | Selettore lingua mostra lingua corrente + sheet 2 lingue | Unit + Playwright | Funzionale | n/a |
| AC-09 | Cambio lingua aggiorna testo claim/CTA senza glitch | Playwright i18n suite | Funzionale | n/a |
| AC-10 | Rotazione bloccata ≤ 8"; tablet landscape max-width 440 pt centrato | Manual + Playwright tablet | Responsive | n/a |
| AC-11 | Focus order: lingua → claim → Accedi → Registrati → Termini → Privacy → Apple → Google | Playwright keyboard | A11y | Ordine definito |
| AC-12 | Performance first paint < 100 ms su device medio (profilo simulato) | Lighthouse Mobile | Performance | FP < 100 ms |

## KPI sintetici
- Contrasto testi/CTA ≥ AA.
- Touch-target ≥ 44 pt.
- First paint < 100 ms (profilo medio via Lighthouse).

## Next step
- Sincronizzare questa matrice con i ticket UI-001…DOC-008 e con il test plan Playwright.
