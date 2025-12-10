# Piano Hero “FiutaMi” – Mobile-first reset

## Scope
- Ridisegnare la schermata di ingresso mobile garantendo visibilità completa senza scroll su 812×375 pt (iPhone X) e 780×360 dp (Android).
- Posizionare il cane a destra con orecchie integre e headroom ≥ 12%, fondo gradiente giallo brand.
- Definire componenti MVP (HeaderLang, BrandLogo, HeroDog, Claim, Primary/Secondary CTA, LegalNote, SocialBar) e i token essenziali.
- Bloccare la rotazione su device ≤ 8"; su tablet ≥ 8" mantenere layout portrait centrato con max-width 440 pt.

## Assunzioni
- Asset logo SVG e cane @2x/@3x forniti dal brand; gradiente conforme palette ufficiale.
- Font brand disponibile (TTF); in mancanza usare fallback di sistema con tracking adeguato.
- Backend/non autenticazione reale fuori scope: CTA e social rimangono stub.

## Out-of-scope
- Esperienza desktop > 1280 px.
- Localizzazioni aggiuntive oltre Italiano/Inglese.
- Flussi OAuth reali o gestione deep-linking.

## Milestones
1. **M1 – Fondamenta portrait**: token, layout 4 pt grid, componenti base.
2. **M2 – Rifinitura UI**: gradiente cane, CTA/social states, nota legale.
3. **M3 – Tablet & QA**: comportamento landscape tablet, accessibilità, test Playwright.

## WBS (HERO-01 .. HERO-10)
| ID | Descrizione | Effort | Dipendenze | Owner |
| --- | --- | --- | --- | --- |
| HERO-01 | Allineare token spacing/radius/font/elevation con brand | S | – | Design System |
| HERO-02 | Definire layout portrait (stack + misure) | M | HERO-01 | FE |
| HERO-03 | Implementare HeaderLang accessibile (etichetta + sheet) | M | HERO-02 | FE |
| HERO-04 | Posizionare BrandLogo + Claim tipografico | S | HERO-02 | FE |
| HERO-05 | Integrare HeroDog + gradiente con headroom ≥ 12% | M | HERO-02 | FE |
| HERO-06 | CTA primario/secondario (stati default/pressed/disabled) | M | HERO-02 | FE |
| HERO-07 | Nota legale con link esterni e tracking stub | S | HERO-06 | FE |
| HERO-08 | Social bar Apple/Google (hit area ≥ 44 pt) | S | HERO-06 | FE |
| HERO-09 | Layout tablet landscape (max-width 440 pt centrato) | M | HERO-02 | FE |
| HERO-10 | QA/accessibilità + Playwright device matrix | M | HERO-03..09 | QA |

## Timeline indicativa
- **Settimana 1**: HERO-01 → HERO-05.
- **Settimana 2**: HERO-06 → HERO-09.
- **Settimana 3**: HERO-10, review finale e aggiornamento documentazione.

## Criteri di done
- Nessuno scroll su 812×375 pt e 780×360 dp.
- Cane: orecchie visibili, headroom ≥ 12%, gradiente attivo.
- CTA/social touch-target ≥ 44 pt, contrasto AA, focus state visibile.
- Tablet landscape: layout portrait centrato, max-width 440 pt.
- Nota legale apre browser esterno.
- Rotazione bloccata ≤ 8".

## Rischi & mitigazioni
- **Asset cane non finali** → usare placeholder con bounding box, validare con brand (HERO-05).
- **Contrasto insufficiente** → validare con strumenti WCAG prima del rilascio (HERO-06/07).
- **Gestione lingua** → se backend assente, usare store locale e fallback EN (HERO-03).
- **Performance** → ottimizzare dimensioni immagine (AVIF/PNG @2x) e lazy load controllato.

## Rollout / Rollback
- Rollout tramite feature flag `hero_mobile_v3` (dev → staging → prod) con screenshot Playwright allegati.
- Rollback disattivando il flag e ripristinando layout precedente (`hero_v2`).

## Next step
- Dopo approvazione, aggiornare specifica dettagliata e task d’implementazione secondo ticket Jira UI-001…DOC-008.
