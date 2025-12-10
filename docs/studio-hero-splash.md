# FiutaMi – Studio schermata ingresso

## Layout portrait ≤ 8"
1. Safe-area top/bottom considerate.
2. HeaderLang top-right (padding 12/8 pt, radius 16, label “Italiano”).
3. BrandLogo centrato, larghezza 128 pt (adattabile 112–144 pt).
4. HeroDog ancorato a destra, headroom ≥ 8%, gradiente giallo.
5. Claim (Title 28 pt, max 2 righe) allineato a sinistra rispetto al container.
6. CTA primario “Accedi” full-width, 56 pt height.
7. CTA secondario “Registrati” outline, allineamento identico, spacing 12 pt.
8. Nota legale (Caption 12 pt) subito sotto CTA secondario.
9. SocialBar (Apple, Google) centrata, spacing orizzontale 24 pt, hit area 56 pt.

Spacing verticale suggerito (dall’alto):
- Safe-area top → 24 pt → HeaderLang.
- 32 pt → BrandLogo → 16 pt → HeroDog overlapping area.
- 24 pt → Claim → 24 pt → CTA primario → 12 pt → CTA secondario → 16 pt → LegalNote → 24 pt → SocialBar → safe-area bottom.

## Tablet landscape (>8")
- Layout portrait centrato in container 440 pt.
- HeroDog scala mantenendo proporzioni; gradient si espande su container.
- Gutter laterali fluidi (min 56 pt).

## Interazioni
- HeaderLang apre sheet modale con lista lingue (max 2) e pulsante chiusura.
- CTA → stub `onLoginPrimary()`, `onRegister()`.
- SocialBar → stub Apple/Google (console log + TODO hooking nativo).
- Nota legale → `window.open` su web, Intent browser esterno su mobile.

## Stati & errori
- Nessun errore UI previsto; eventuale fallimento login gestito da flow successivo.

## Visual reference
- Snapshot aggiornata: `specs/002-contrala-html-immagini/screenshots/hero-visual.spec.ts-snapshots/hero-portrait-360-portrait-360-win32.png`.
