# Fiutami - Global Project Structure

> Documento di riferimento per Claude Code con struttura completa dell'organizzazione GitHub e infrastruttura.

---

## Organizzazione GitHub: `fiutami`

| # | Repository | Descrizione | Stack | URL |
|---|------------|-------------|-------|-----|
| 1 | `fiutami/frontend` | Angular 18 PWA | Angular 18, SCSS, TypeScript | https://github.com/fiutami/frontend |
| 2 | `fiutami/backend` | .NET 8 REST API | .NET 8, MSSQL, JWT, EF Core | https://github.com/fiutami/backend |
| 3 | `fiutami/backoffice` | Admin Dashboard | Directus CMS | https://github.com/fiutami/backoffice |
| 4 | `fiutami/infra` | CI/CD, Docker, IaC | Docker Compose, GitHub Actions | https://github.com/fiutami/infra |
| 5 | `fiutami/docs` | Documentazione globale | Markdown | https://github.com/fiutami/docs |
| 6 | `fiutami/testing` | E2E Test Suite | Playwright | https://github.com/fiutami/testing |
| 7 | `fiutami/.github` | Org profile & templates | GitHub Config | https://github.com/fiutami/.github |

---

## Path Locali (Windows)

```
C:\PROJECTS\FIUTAMI - TOPOLINIA\
├── frontend\        # Angular PWA       (questo repo)
├── backend\         # .NET 8 API
├── backoffice\      # Directus CMS
├── infra\           # Docker/CI/CD
├── docs\            # Documentazione
├── testing\         # Playwright E2E
└── tts\             # Microservizio TTS (edge_tts, Python)
```

---

## Deploy Strategy

### Branch Workflow

| Branch | Trigger | Azione |
|--------|---------|--------|
| `stage` / `develop` | push | Auto-deploy su **staging** (91.99.229.111) |
| `main` | push | Deploy su **production** (49.12.85.92) - richiede approval |
| `workflow_dispatch` | manuale | Scegli target: staging o production |

### Flusso

```
feature work su stage → push → auto-deploy staging → verifica → merge to main → deploy prod
```

### Pipeline (`deploy.yml`)

```
setup → build (Angular + Docker push GHCR) → deploy (SSH) → health-check (con rollback automatico) → summary
```

Image tag: `sha-<commit>` + `stage` o `prod`

---

## Server Staging (LEXe)

| Proprieta | Valore |
|-----------|--------|
| **IP** | `91.99.229.111` |
| **SSH** | `ssh -i ~/.ssh/id_stage_new root@91.99.229.111` |
| **Path** | `/opt/fiutami` |
| **Compose Project** | `fiutami-stage` |
| **Env File** | `/opt/fiutami/.env` |
| **Compose File** | `docker-compose.stage.yml` |
| **Network** | `fiutami-public` (esterna, per Traefik) + `fiutami-stage` (interna) |
| **Traefik Config** | `/opt/leo-platform/leo-infra/docker/traefik/dynamic/fiutami-stage.yml` |

| Dominio | Servizio | Porta |
|---------|----------|-------|
| `stage.fiutami.pet` | Frontend | 8082:80 |
| `api.stage.fiutami.pet` | Backend | 5001:5000 |
| `bo.stage.fiutami.pet` | Backoffice (Directus) | 8055:8055 |

### Container Docker (Staging)

| Container | Immagine | Porta |
|-----------|----------|-------|
| `fiutami-frontend-stage` | `ghcr.io/fiutami/frontend:${IMAGE_TAG:-stage}` | 8082:80 |
| `fiutami-backend-stage` | `ghcr.io/fiutami/backend:${IMAGE_TAG:-stage}` | 5001:5000 |
| `fiutami-db-stage` | `mcr.microsoft.com/mssql/server:2022-latest` | interno |
| `fiutami-backoffice-stage` | `ghcr.io/fiutami/backoffice:${IMAGE_TAG:-stage}` | 8055:8055 |

---

## Server Produzione (Hetzner)

| Proprieta | Valore |
|-----------|--------|
| **IP** | `49.12.85.92` |
| **SSH** | `ssh -i ~/.ssh/id_hetzner root@49.12.85.92` |
| **Path** | `/opt/fra/fiutami` |
| **Compose Project** | `fiutami-prod` |
| **Env File** | `/opt/fra/fiutami/.env` |
| **Compose File** | `docker-compose.prod.yml` |
| **Network** | `fiutami-public` (esterna, per Traefik) |
| **Traefik Config** | `/opt/leo-platform/leo-infra/docker/traefik/dynamic/fiutami.yml` |

| Dominio | Servizio | Porta |
|---------|----------|-------|
| `fiutami.pet` | Frontend | 8080:80 |
| `api.fiutami.pet` | Backend | 5000:5000 |
| `bo.fiutami.pet` | Backoffice (Directus) | 8055:8055 |

### Container Docker (Produzione)

| Container | Immagine | Porta |
|-----------|----------|-------|
| `fiutami-frontend-prod` | `ghcr.io/fiutami/frontend:${IMAGE_TAG:-prod}` | 8080:80 |
| `fiutami-backend-prod` | `ghcr.io/fiutami/backend:${IMAGE_TAG:-prod}` | 5000:5000 |
| `fiutami-db-prod` | `mcr.microsoft.com/mssql/server:2022-latest` | interno |
| `fiutami-backoffice-prod` | `ghcr.io/fiutami/backoffice:${IMAGE_TAG:-prod}` | 8055:8055 |

---

## Database

| Ambiente | Container | DB Name | User | Password |
|----------|-----------|---------|------|----------|
| Staging | `fiutami-db-stage` | `fiutami_stage` | `sa` | Vedi `.env` -> `DB_PASSWORD` |
| Production | `fiutami-db-prod` | `fiutami_prod` | `sa` | Vedi `.env` -> `DB_PASSWORD` |

- **Schema**: 31 tabelle (Auth_*, Pet_*, Notify_*, Chat_*, Cal_*, Sub_*, Social_*, POI_*)
- **Migrazioni**: 16 registrate in `__EFMigrationsHistory`, allineate PROD/STAGE
- **Sync Prod -> Stage**: ogni 15 minuti via cron su server prod (`/opt/fra/fiutami/scripts/sync-to-stage.sh`)

### Accesso DB

```bash
# Staging
docker exec -it fiutami-db-stage /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C -d fiutami_stage

# Produzione
docker exec -it fiutami-db-prod /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C -d fiutami_prod
```

---

## SSH Keys (locali)

| Key | Server | Uso |
|-----|--------|-----|
| `~/.ssh/id_hetzner` | 49.12.85.92 | Production |
| `~/.ssh/id_stage_new` | 91.99.229.111 | Staging |

---

## GitHub Secrets (per environment nel repo)

### Frontend (`fiutami/frontend`)

| Secret | Descrizione |
|--------|-------------|
| `SSH_PRIVATE_KEY` | Chiave SSH per deploy |
| `SSH_HOST` | IP server (per environment: staging o production) |
| `SSH_USER` | `root` |
| `DEPLOY_PATH` | `/opt/fiutami` (stage) o `/opt/fra/fiutami` (prod) |
| `COMPOSE_PROJECT` | `fiutami-stage` o `fiutami-prod` |
| `GHCR_PAT` | GitHub Container Registry token |
| `GOOGLE_CLIENT_ID` | OAuth Google |
| `FACEBOOK_APP_ID` | OAuth Facebook |

### Backend (`fiutami/backend`)

| Secret | Descrizione |
|--------|-------------|
| `SSH_PRIVATE_KEY` | Chiave SSH per deploy |
| `SSH_HOST` | IP server |
| `SSH_USER` | `root` |
| `GHCR_PAT` | GitHub Container Registry token |
| `DB_PASSWORD` | MSSQL sa password |
| `JWT_SECRET` | JWT signing key (min 32 chars) |
| `OPENROUTER_API_KEY` | Per Fiuto AI |

---

## Stack Tecnologico

### Frontend

- **Framework**: Angular 18 (standalone components, OnPush, signals)
- **Styling**: SCSS + Design Tokens (`src/styles/_tokens-figma.scss`)
- **i18n**: ngx-translate, 6 lingue (it, en, de, es, fr, pt-BR)
- **Pattern**: `inject()`, `providedIn: 'root'`, signals (no BehaviorSubject per stato)
- **Build**: `npm run build -- --configuration=stage|production`
- **Node**: v20.x
- **PWA**: Service Worker configurato

### Backend

- **Framework**: .NET 8 Web API
- **Database**: MSSQL Server 2022 Express
- **Auth**: JWT (access + refresh tokens) + OAuth (Google, Facebook)
- **ORM**: Entity Framework Core
- **AI**: OpenRouter proxy per Fiuto AI (Gemini 2.0 Flash)
- **Endpoints**: 80+ documentati

### Fiuto AI System

- **Global Service**: `core/services/fiuto-ai-global.service.ts` - concierge route-aware
- **TTS**: Microservizio Python (`tts/`) con edge_tts su porta 5100
- **STT**: Web Speech API via `SttService`, graceful degradation
- **Componenti voice**: voice-input-button, message-play-button, audio-playback-indicator, tts-toggle
- **Concierge**: TabPageShellDefault ha mascot-peek + bottom-sheet su TUTTE le pagine
- **Proxy**: `/api/tts` -> localhost:5100, `/api` -> localhost:5062

### Infra

- **Container**: Docker + Docker Compose
- **Registry**: GitHub Container Registry (`ghcr.io/fiutami/*`)
- **CI/CD**: GitHub Actions (reusable workflows)
- **Reverse Proxy**: Traefik
- **SSL**: Let's Encrypt (via Traefik)
- **Image tags**: `sha-*`, `stage`, `prod`

---

## Comandi Utili

### Frontend

```bash
cd "C:\PROJECTS\FIUTAMI - TOPOLINIA\frontend"

npm start                                      # Dev localhost:4200
npm run build -- --configuration=stage         # Build stage
npm run build -- --configuration=production    # Build prod
npm test                                       # Unit tests
```

### Git & Deploy

```bash
# Deploy su staging (auto)
git push origin stage

# Deploy su produzione (richiede approval su GitHub)
git checkout main && git merge stage && git push origin main

# Check deploy status
gh run list --workflow deploy.yml --limit 3
gh run watch <run-id> --exit-status
```

### Server SSH

```bash
# Staging
ssh -i ~/.ssh/id_stage_new root@91.99.229.111
cd /opt/fiutami
docker compose -p fiutami-stage -f docker-compose.stage.yml logs -f frontend

# Produzione
ssh -i ~/.ssh/id_hetzner root@49.12.85.92
cd /opt/fra/fiutami
docker compose -p fiutami-prod -f docker-compose.prod.yml logs -f frontend

# Verificare stato completo
docker ps --format 'table {{.Names}}\t{{.Status}}' | grep fiutami
```

---

## File Chiave

### Frontend

| File | Descrizione |
|------|-------------|
| `src/app/app.module.ts` | Root module |
| `src/app/app-routing.module.ts` | Routing principale |
| `src/app/core/services/` | 30+ servizi core |
| `src/app/core/models/` | Modelli TypeScript |
| `src/app/core/i18n/` | i18n module + LanguageService |
| `src/app/core/config/fiuto-prompts.config.ts` | Prompt AI config |
| `src/app/core/services/fiuto-ai-global.service.ts` | Servizio AI globale |
| `src/app/hero/` | Main app module post-login (60+ componenti) |
| `src/app/shared/` | 46+ componenti condivisi |
| `src/styles/_tokens-figma.scss` | Design tokens da Figma |
| `.github/workflows/deploy.yml` | CD pipeline multi-environment |

### Backend

| File | Descrizione |
|------|-------------|
| `src/Fiutami.API/` | Controller e startup |
| `src/Fiutami.Infrastructure/` | EF Core, migrations |
| `Dockerfile` | Container build |

### Infra

| File | Descrizione |
|------|-------------|
| `docker/docker-compose.stage.yml` | Stack staging |
| `docker/docker-compose.prod.yml` | Stack produzione |
| `scripts/sync-to-stage-auto.sh` | Sync DB prod -> stage |

---

## Figma

- **File ID**: `FxJsfOV7R7qoXBM2xTyXRE`
- **Project**: MVP-LAST-Ok--originale-
- **Design System**: Tokens sincronizzati in `_tokens-figma.scss`
- **Flow Spec**: `frontend/FIUFLUX.md` (560+ righe, tutti i frame con link Figma)

---

## Routing Post-Auth

| Condizione | Redirect |
|------------|----------|
| Login + ha pet | `/home/main` |
| Login + no pet | `/home/welcome-ai/1` |
| Signup (sempre) | `/home/welcome-ai/1` |
| OAuth + ha pet | `/home/main` |
| OAuth + no pet | `/home/welcome-ai/1` |

---

## Drawer Menu (15 Sezioni)

| # | Schermata | Route | Stato |
|---|-----------|-------|-------|
| 1 | Account | `/home/account` | Completo |
| 2 | Attivita | `/home/activity` | Completo |
| 3 | Notifiche | `/home/notifications` | Completo |
| 4 | Salvati | `/home/favorites` | Completo |
| 5 | Adotta | `/home/adopt` | Completo |
| 6 | Aggiungi Pet | azione (limite 2 free) | Completo |
| 7 | Amici Pet | `/home/friends` | Completo |
| 8 | Invita | `/home/invite` | Completo |
| 9 | Smarriti | `/home/lost-pets` | Completo |
| 10 | Bloccati | `/home/blocked` | Completo |
| 11 | Termini | `/home/terms` | Completo |
| 12 | Abbonamenti | `/home/subscriptions` | Completo |
| 13 | Contattaci | `/home/contact` | Completo |
| 14 | Privacy | `/home/privacy` | Completo |
| 15 | Logout | azione | Completo |

---

## API Endpoints Principali

| Endpoint | Descrizione |
|----------|-------------|
| `/api/auth/*` | Autenticazione, OAuth, JWT refresh |
| `/api/pets/*` | CRUD pet, foto, gallery, memories |
| `/api/pets/:id/friends` | Amicizie pet |
| `/api/pets/:id/antagonists` | Nemici pet |
| `/api/chat/*` | Conversazioni, messaggi (polling 5s) |
| `/api/search` | Ricerca globale multi-categoria |
| `/api/premium/*` | Piani, abbonamenti (4 tier) |
| `/api/poi/*` | Punti di interesse, reviews, favorites |
| `/api/notification` | Notifiche |
| `/api/activity` | Feed attivita |
| `/api/saved` | Elementi salvati |
| `/api/friends` | Amicizie utente |
| `/api/users/blocked` | Utenti bloccati |
| `/api/invites` | Inviti / referral |
| `/api/suggestions` | Suggerimenti AI |
| `/api/adoption` | Adozioni |
| `/api/lost-pets` | Animali smarriti + sightings |
| `/api/questionnaire/events` | Analytics questionario (AllowAnonymous) |
| `/api/tts` | Proxy -> microservizio TTS (porta 5100) |

---

## Troubleshooting

### Healthcheck Fallisce
Usare `127.0.0.1` al posto di `localhost` negli healthcheck Docker.

### JWT Error (`IDX10703`)
`JWT_SECRET` non passato al container. Ricreare con docker compose (legge `.env`).

### DB Staging Bloccato (SINGLE_USER)
Sync interrotto ha lasciato DB in SINGLE_USER. Fix: `ALTER DATABASE [fiutami_stage] SET MULTI_USER;`

### Container Nome Sbagliato (Traefik 502)
Ricreare container con `docker compose -p fiutami-stage -f docker-compose.stage.yml up -d --no-deps <service>` e ricollegare `fiutami-public` network.

---

## Note Importanti

1. **Deploy flow**: push su `stage` -> auto-deploy staging. Merge su `main` -> deploy prod (con approval)
2. **Material Icons** deve essere in `index.html` per bottom tab bar e icone
3. **Network Docker**: `fiutami-public` (esterna, per Traefik) + `fiutami-stage`/`fiutami-prod` (interne)
4. **hasCompletedOnboarding** viene dal backend, non calcolato frontend
5. **GHCR login** richiesto sul server per pull immagini private
6. **Health check** con rollback automatico nella pipeline deploy
7. **Sync DB** prod -> stage ogni 15 minuti via cron

---

*Ultimo aggiornamento: 2026-02-14*
