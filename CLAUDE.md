# CLAUDE.md - Frontend

## Questo Repo
**Path:** `/home/frisco/projects/fiutami-frontend`
**Stack:** Angular 18, TypeScript, SCSS, PWA

## Org FIUTAMI
| Repo | Path | Cosa fa |
|------|------|---------|
| **frontend** | `fiutami-frontend` ← SEI QUI | Angular PWA |
| backend | `fiutami-backend` | .NET 8 API |
| backoffice | `fiutami-backoffice` | Directus CMS |
| infra | `fiutami-infra` | Docker, CI/CD |
| testing | `fiutami-testing` | Playwright E2E |
| docs | `fiutami-docs` | Documentazione |

## Dove Lavoro
| Modulo | Path | Descrizione |
|--------|------|-------------|
| auth | `src/app/auth/` | Login, signup, OAuth |
| breeds | `src/app/breeds/` | Catalogo specie/razze |
| calendar | `src/app/calendar/` | Calendario eventi |
| chat | `src/app/chat/` | Messaggistica (polling) |
| core | `src/app/core/` | Services, guards, interceptors |
| hero | `src/app/hero/` | Landing page, drawer sections |
| map | `src/app/map/` | Mappa POI Leaflet |
| onboarding | `src/app/onboarding/` | Welcome, quiz, register-pet |
| premium | `src/app/premium/` | Abbonamenti |
| profile | `src/app/profile/` | Pet profile, gallery |
| search | `src/app/search/` | Ricerca globale |
| shared | `src/app/shared/` | Componenti condivisi, drawer |
| user | `src/app/user/` | Account, notifications, saved, friends |
| adoption | `src/app/adoption/` | Lista/dettaglio adozioni |
| lost-pets | `src/app/lost-pets/` | Animali smarriti, segnalazioni |

## Altre Paths
| Task | Path |
|------|------|
| Services | `src/app/core/services/` |
| Models | `src/app/core/models/` |
| Stili | `src/styles/` |
| Assets | `src/assets/` |
| Routes | `src/app/app.routes.ts` |
| Environment | `src/environments/` |

## Comandi
```bash
npm start       # Dev localhost:4200
npm run build   # Build prod
npm test        # Unit tests
```

## API Endpoints Utilizzati
| Endpoint | Descrizione |
|----------|-------------|
| /api/auth/* | Autenticazione, OAuth |
| /api/pets/* | Gestione pet |
| /api/chat/* | Conversazioni, messaggi |
| /api/search | Ricerca globale |
| /api/premium/* | Piani, abbonamenti |
| /api/poi/* | Punti di interesse |
| /api/notification | Notifiche |
| /api/activity | Feed attività |
| /api/saved | Elementi salvati |
| /api/friends | Amicizie utente |
| /api/pets/:id/friends | Amicizie pet |
| /api/pets/:id/antagonists | Nemici pet |
| /api/users/blocked | Utenti bloccati |
| /api/invites | Inviti |
| /api/suggestions | Suggerimenti AI |
| /api/adoption | Adozioni |
| /api/lost-pets | Animali smarriti |

## API
Backend su `localhost:5000/api/`
