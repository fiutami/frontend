# CLAUDE.md - Frontend

## Contesto
Angular 18 PWA per FIUTAMI - Pet social network. Standalone components, i18n, Figma-to-Code.

## Stack
- Angular 18.0.0
- TypeScript
- SCSS
- PWA
- i18n (IT/EN)

## Struttura
```
src/app/
├── auth/           # Login, Signup, Forgot Password
├── core/           # Guards, Interceptors, Services, Models
├── shared/         # Shared components
├── hero/           # Landing page
├── user/           # User features (onboarding, pets, calendar)
└── styleguide/     # Design system demo
```

## Comandi
```bash
npm install          # Installa dipendenze
npm start            # Dev server (localhost:4200)
npm run build        # Build production
npm run build:prod   # Build ottimizzato
npm test             # Unit tests
npm run e2e          # E2E (usa repo testing/)
```

## Convenzioni
- **Components**: Standalone, PascalCase
- **Services**: camelCase + `.service.ts`
- **Models**: Interfaces in `core/models/`
- **Styles**: SCSS, BEM, mobile-first

## Design System
- Colori: Blu (#1E40AF), Giallo (#FBBF24), Bianco
- Font: Montserrat (body), Moul (headings)
- Breakpoints: 375px, 768px, 1024px, 1280px

## API
Backend .NET su `http://localhost:5000/api/`

Endpoints principali:
- `/auth/*` - Autenticazione
- `/pets/*` - Animali
- `/breeds/*` - Razze
- `/events/*` - Calendario
- `/questionnaire/*` - Quiz AI

## Link
- [Docs](https://github.com/fiutami/docs)
- [Figma](https://figma.com/...)
- [Design Tokens](./.figma/DESIGN-TOKENS-REFERENCE.md)

## TODO MVP
- [ ] Onboarding flow (mob_welcome_ai_*)
- [ ] Quiz AI UI
- [ ] Pet registration/profile
- [ ] Calendar module
- [ ] Breeds catalog
- [ ] Map integration
- [ ] Chat module
