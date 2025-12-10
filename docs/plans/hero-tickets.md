# Jira Tickets – Hero mobile-first

## UI-001 – Layout schermata ingresso (portrait)
- Implementare struttura base portrait: HeaderLang, BrandLogo, HeroDog placeholder, Claim, CTA, Legal, Social.
- Bloccare rotazione su dispositivi ≤ 8".
- DoD: layout senza scroll su 812×375 pt e 780×360 dp; screenshot Playwright aggiornati.

## UI-002 – HeroDog + gradiente giallo
- Integra asset cane @2x/@3x, assicurando orecchie integre e headroom ≥ 8%.
- Applicare gradiente brand per leggibilità.
- DoD: review design approvata, contrast check superato.

## UI-003 – HeaderLang (selettore lingua)
- Etichetta lingua corrente (“Italiano”/“English”), sheet modale con max 2 opzioni.
- Focus order e announcements screen reader.
- DoD: Playwright test cambio lingua, axe senza violazioni.

## UI-004 – CTA & Social bar
- CTA primario/secondario con stati default/pressed/disabled; social Apple/Google con hit area ≥ 44 pt.
- Azioni stub + telemetry TODO.
- DoD: contrast AA, Playwright tap test, fallback disabled.

## UI-005 – Nota legale
- Copy “Accedendo accetti i nostri Termini & Privacy”; link esterni.
- Tracking evento stub.
- DoD: link aprono browser esterno (Playwright), focus outline visibile.

## UI-006 – Tablet landscape
- Max-width 440 pt, layout centrato con gutter fluidi.
- DoD: snapshot landscape-740 aggiornata, no overlay differente.

## QA-A11y-007 – Accessibilità & contrasto
- Verificare hit area, contrasto, focus order, screen reader.
- DoD: report axe + manual screen reader script, checklist completata.

## DOC-008 – Aggiornamento Design System/README
- Aggiornare `docs/design-system.md`, `docs/studio-hero-splash.md`, README con token, componenti, criteri.
- DoD: documenti versionati, link ai test e screenshot.
