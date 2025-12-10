# FiutaMi Design Tokens – Hero Splash MVP

## Spacing (pt)
- `space-4`: 4
- `space-8`: 8
- `space-12`: 12
- `space-16`: 16 (gutter principale)
- `space-24`: 24
- `space-32`: 32

## Radius (pt)
- `radius-8`
- `radius-12`
- `radius-16`

## Typography
| Token | Size (pt) | Peso | Uso |
| --- | --- | --- | --- |
| `font-title` | 28 | Semibold | Claim principale |
| `font-subtitle` | 24 | Semibold | Varianti future |
| `font-body` | 16 | Regular | Copy, note |
| `font-button` | 16 | Semibold | CTA |
| `font-caption` | 12 | Regular | Legal note |
| `font-label` | 14 | Medium | Etichette UI |

Font family: **Brand Sans** (TTF fornito). Fallback: `"SF Pro Text", "Roboto", sans-serif`.

## Elevation / shadow
- `elevation-0`: none.
- `elevation-1`: offset (0,4pt), blur 12pt, color rgba(0,0,0,0.12) – per CTA primario e social.

## Color palette (estratto)
| Nome | Hex | Uso | Contrasto AA |
| --- | --- | --- | --- |
| `brand-yellow-500` | #F4AE1A | Gradient base | con testo #111 ≥ 7:1 |
| `brand-yellow-600` | #F6C450 | Gradient top | con testo #111 ≥ 5:1 |
| `brand-black` | #111111 | Testo | n/a |
| `brand-white` | #FFFFFF | Icone/outline | su giallo ≥ 4.5:1 con shadow |
| `brand-gray-600` | #5B5B5B | Copy secondario | su giallo ≥ 4.5:1 |

Gradiente hero consigliato: `linear-gradient(180deg, #F6C450 0%, #F4AE1A 60%, #F2A10C 100%)`.

## Container
- Max-width tablet landscape: **440 pt** (centrato, gutter fluidi ≥ 56 pt).

## Componenti
### HeaderLang
- Props: `currentLanguage`, `availableLanguages` (max 2), `onChange(lang)`.
- Stati: default, focus (outline 2pt brand-black), pressed (background rgba(17,17,17,0.08)).
- Layout: ancorato top-right con safe-area, padding orizzontale 12, verticale 8, radius 16.

### BrandLogo
- Asset SVG 112–144 pt. Allineato sopra HeroDog (baseline su orecchie).

### HeroDog
- Asset PNG/AVIF @2x/@3x (orecchie integre). Headroom ≥ 8% container. Gradient overlay giallo.

### Claim
- Title 28 pt semibold, max 2 righe, `text-align: left` ma contenuto centrato nel container.

### PrimaryButton (`Accedi`)
- Height 52–56 pt, radius 16, background brand-black (#111) + testo bianco. States: default, hover/pressed (scuro #0B0B0B), disabled (rgba(17,17,17,0.3)). Focus: outline 2pt brand-yellow-500.

### SecondaryButton (`Registrati`)
- Outline 2pt brand-black, background trasparente, testo brand-black. Pressed: background rgba(17,17,17,0.08).

### LegalNote
- Caption 12 pt; links inline (Termini, Privacy) con stile underline e focus outline 2pt brand-yellow-500.

### SocialBar
- Icon buttons (Apple, Google). Hit area 56×56 pt, icona 24 pt. Stato pressed: scale 0.96 + background rgba(17,17,17,0.08).

## Responsive & rotazione
- Device ≤ 8": portrait only (bloccare rotazione).
- Tablet ≥ 8": layout portrait centrato, max-width 440 pt, cane ridotto proporzionalmente; gutter fluidi.

## Accessibilità
- Hit areas ≥ 44×44 pt.
- Focus order definito: lingua → logo (skippabile) → claim → Accedi → Registrati → Termini → Privacy → Apple → Google.
- Testo claim annunciato come heading livello 4.

## i18n
- Chiavi: `hero.language`, `hero.claim`, `hero.cta.primary`, `hero.cta.secondary`, `hero.legal.copy`, `hero.legal.terms`, `hero.legal.privacy`.
- Lingue iniziali: italiano/en. Cambio lingua aggiorna copy on the fly.

## Asset export
- Logo SVG + PNG @2x/@3x.
- Hero cane PNG/AVIF @2x/@3x con safe area definita.

## Reference screenshot
- Allegare nel Design System cartella `/specs/002-contrala-html-immagini/screenshots` (portrait 360, landscape tablet centered).
