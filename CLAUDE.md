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
| Task | Path |
|------|------|
| Componenti | `src/app/[feature]/` |
| Services | `src/app/core/services/` |
| Models | `src/app/core/models/` |
| Stili | `src/styles/` |
| Assets | `src/assets/` |
| Routes | `src/app/app.routes.ts` |

## Comandi
```bash
npm start       # Dev localhost:4200
npm run build   # Build prod
npm test        # Unit tests
```

## API
Backend su `localhost:5000/api/` - endpoints: `/auth/*`, `/pets/*`, `/breeds/*`, `/events/*`
