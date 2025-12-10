# Feature Specification: Hero mobile-first splash

**Feature Branch**: `[hero-mobile-v3]`  
**Created**: 2025-09-29  
**Status**: Draft  
**Input**: Prompt mobile-first portrait (spec-driven, MVP) fornito il 29/09/2025.

## User Scenarios & Testing

### Primary User Story
Come utente che apre FiutaMi da smartphone, voglio vedere il cane protagonista, il logo e i pulsanti Accedi/Registrati senza scorrere, così posso iniziare la sessione rapidamente.

### Acceptance Scenarios
1. **Given** apro l’app su iPhone X (812×375), **When** atterro sulla splash, **Then** vedo lingua, logo, cane, claim, CTA, legal e social bar entro il viewport senza scroll.
2. **Given** uso un Android 6.8" (780×360dp), **When** la schermata si carica, **Then** gli elementi restano leggibili, CTA hanno contrasto AA e touch-target ≥ 44 pt.
3. **Given** avvio l’app su tablet 10" in landscape, **When** visualizzo la schermata, **Then** il layout portrait resta centrato con max-width 440 pt e gutter laterali fluidi.
4. **Given** cambio lingua da Italiano a English, **When** confermo, **Then** claim e CTA si aggiornano senza glitch.

### Edge Cases
- Safe area con notch/home indicator: nessun elemento interattivo tagliato.
- Social bar mostra solo Apple e Google; se uno dei provider non è disponibile, mostra fallback placeholder disabilitato.
- Rotazione su smartphone bloccata; se forzata (ADB), l’app rimane in portrait e informa l’utente.

## Requirements

### Functional Requirements
- **FR-001**: Layout MUST mostrare tutti gli elementi entro il viewport 812×375 pt senza scroll.
- **FR-002**: HeaderLang MUST mostrare etichetta lingua corrente e aprire elenco (max 2 lingue) accessibile.
- **FR-003**: HeroDog MUST essere ancorato a destra con orecchie integre e headroom ≥ 8%, gradiente giallo brand applicato.
- **FR-004**: Claim MUST supportare massimo 2 righe, tipografia Title 28 pt semibold.
- **FR-005**: CTA primario “Accedi” MUST avere touch-target ≥ 44 pt, contrasto AA ≥ 4.5:1, stati default/pressed/disabled.
- **FR-006**: CTA secondario “Registrati” MUST usare stile outline coerente e mantenere touch-target/contrast.
- **FR-007**: Nota legale MUST contenere link “Termini” e “Privacy” che aprono browser esterno.
- **FR-008**: Social bar MUST mostrare solo Apple/Google con hit area ≥ 44×44 pt e fallback stub per azione.
- **FR-009**: Rotazione MUST essere bloccata su device ≤ 8"; su tablet ≥ 8" layout portrait centrato (max-width 440 pt).
- **FR-010**: Testo MUST supportare localizzazione IT/EN con update dinamico.

### Non-Funzionali
- **NFR-001**: Primo paint < 100 ms su device medio (profilo Lighthouse mobile).
- **NFR-002**: Tutti i testi/CTA devono rispettare WCAG AA sui colori definiti.
- **NFR-003**: Font brand preferito, fallback definito.

### Key Entities
- **HeroViewModel**: `language`, `claim`, `ctaPrimary`, `ctaSecondary`, `legal`, `socialProviders`.
- **LanguageOption**: `code`, `label`.
- **SocialProvider**: `id`, `label`, `icon`, `enabled` (Apple/Google).

## Review & Acceptance Checklist

### Content Quality
- [x] Focus su mobile-first, nessun dettaglio di implementazione framework-specific.
- [x] Value proposition chiara.

### Requirement Completeness
- [x] Requisiti testabili e allineati all’MVP.
- [x] Scope e dipendenze definiti.

### Constitution Alignment
- [x] Responsive 360/768/1280 documentato.
- [x] Token/mixins referenziati (`docs/design-system.md`).
- [x] Test Playwright previsti (portrait-360, landscape-740, desktop-1280).

## Execution Status
- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguità marcate (vedi open questions)
- [x] User scenarios definiti
- [x] Requirements generati
- [x] Entities identificate
- [ ] Review checklist finale (pending sign-off)
