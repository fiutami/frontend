# Fiutami - Global Project Structure

> Documento di riferimento per Claude Code con struttura completa dell'organizzazione GitHub e infrastruttura.

---

## 🏢 Organizzazione GitHub: `fiutami`

| #   | Repository           | Descrizione             | Stack                          | URL                                   |
| --- | -------------------- | ----------------------- | ------------------------------ | ------------------------------------- |
| 1   | `fiutami/frontend`   | Angular 18 PWA          | Angular 18, SCSS, Playwright   | https://github.com/fiutami/frontend   |
| 2   | `fiutami/backend`    | .NET 8 REST API         | .NET 8, MSSQL, JWT             | https://github.com/fiutami/backend    |
| 3   | `fiutami/backoffice` | Admin Dashboard         | Directus CMS                   | https://github.com/fiutami/backoffice |
| 4   | `fiutami/infra`      | CI/CD, Docker, IaC      | Docker Compose, GitHub Actions | https://github.com/fiutami/infra      |
| 5   | `fiutami/docs`       | Documentazione globale  | Markdown                       | https://github.com/fiutami/docs       |
| 6   | `fiutami/testing`    | E2E Test Suite          | Playwright                     | https://github.com/fiutami/testing    |
| 7   | `fiutami/.github`    | Org profile & templates | GitHub Config                  | https://github.com/fiutami/.github    |

---

## 🖥️ Path Locali (WSL)

```bash
/home/frisco/projects/
├── fiutami-frontend/    # Angular PWA
├── fiutami-backend/     # .NET API
├── fiutami-backoffice/  # Directus
├── fiutami-infra/       # Docker/CI
├── fiutami-docs/        # Documentation
├── fiutami-testing/     # E2E tests
├── fiutami-.github/     # Org config
└── fiutami-old/         # Legacy monorepo (deprecated)
```

---

## 🚀 Deploy Strategy

### Branch Workflow

| Branch          | Trigger | Azione                                      |
| --------------- | ------- | ------------------------------------------- |
| `stage`         | push    | **CI only** - build, test, lint (NO deploy) |
| `main`          | push    | **CD** - build + auto-deploy su fiutami.pet |
| PR → main/stage | PR      | CI only                                     |

### Flusso Corretto

```
feature branch → stage (CI) → merge to main → auto-deploy
```

---

## 🌐 Server Produzione

| Proprietà    | Valore                          |
| ------------ | ------------------------------- |
| **Host**     | `91.99.229.111`                 |
| **User**     | `root`                          |
| **SSH Key**  | `~/.ssh/github_actions_fiutami` |
| **URL Prod** | https://fiutami.pet             |
| **API URL**  | https://fiutami.pet/api         |

### Container Docker

| Container                | Immagine                         | Porta   | Network                              |
| ------------------------ | -------------------------------- | ------- | ------------------------------------ |
| `fiutami-frontend-stage` | `ghcr.io/fiutami/frontend:stage` | 8082:80 | `fiutami_fiutami-stage`, `proxy-net` |
| `fiutami-backend-stage`  | `ghcr.io/fiutami/backend:stage`  | 5000    | `fiutami_fiutami-stage`              |
| `fiutami-db`             | MSSQL                            | 1433    | `fiutami_fiutami-stage`              |

---

## 🔑 GitHub Secrets (per repo)

### Frontend (`fiutami/frontend`)

- `SSH_PRIVATE_KEY` - Chiave SSH per deploy
- `SSH_HOST_STAGE` - `91.99.229.111`
- `SSH_USER` - `root`
- `GHCR_PAT` - GitHub Container Registry token
- `GOOGLE_CLIENT_ID` - OAuth Google (opzionale)
- `FACEBOOK_APP_ID` - OAuth Facebook (opzionale)

### Backend (`fiutami/backend`)

- `SSH_PRIVATE_KEY`
- `SSH_HOST_STAGE`
- `SSH_USER`
- `GHCR_PAT`
- `DB_PASSWORD` - MSSQL sa password
- `JWT_SECRET` - JWT signing key

---

## 📦 Stack Tecnologico

### Frontend

- **Framework**: Angular 18 (standalone components)
- **Styling**: SCSS + Design Tokens (`_tokens-figma.scss`)
- **Testing**: Playwright E2E
- **Build**: `npm run build -- --configuration=stage`
- **Node**: v20.x

### Backend

- **Framework**: .NET 8 Web API
- **Database**: MSSQL Server
- **Auth**: JWT + OAuth (Google, Facebook)
- **ORM**: Entity Framework Core

### Infra

- **Container**: Docker + Docker Compose
- **Registry**: GitHub Container Registry (ghcr.io)
- **CI/CD**: GitHub Actions
- **Reverse Proxy**: Nginx + OpenResty
- **SSL**: Let's Encrypt (Certbot)

---

## 🔧 Comandi Utili

### Frontend

```bash
cd /home/frisco/projects/fiutami-frontend

# Dev server
npm start

# Build stage
npm run build -- --configuration=stage

# Build prod
npm run build -- --configuration=production

# Test E2E
npx playwright test
```

### Git & Deploy

```bash
# Push su stage (solo CI)
git push origin stage

# Merge e deploy
git checkout main
git merge stage
git push origin main  # Triggera auto-deploy

# Check deploy status
gh run list -R fiutami/frontend --limit 3
```

### Server SSH

```bash
# Connetti al server
ssh root@91.99.229.111

# Logs container frontend
docker logs fiutami-frontend-stage -f

# Restart container
docker restart fiutami-frontend-stage

# Pull e restart manuale
docker pull ghcr.io/fiutami/frontend:stage
docker stop fiutami-frontend-stage && docker rm fiutami-frontend-stage
docker run -d --name fiutami-frontend-stage \
  --network fiutami_fiutami-stage \
  --network proxy-net \
  -p 8082:80 \
  --restart unless-stopped \
  ghcr.io/fiutami/frontend:stage
```

---

## 📁 File Chiave per Repo

### Frontend

- `src/index.html` - Entry point (include Material Icons)
- `src/styles/_tokens-figma.scss` - Design tokens
- `src/app/hero/` - Main app module post-login
- `src/app/auth/` - Login, signup, OAuth
- `.github/workflows/deploy.yml` - CD pipeline
- `.github/workflows/ci.yml` - CI pipeline

### Backend

- `src/` - API source
- `Dockerfile` - Container build
- `.github/workflows/` - CI/CD

### Infra

- `docker-compose.yml` - Stack definition
- `nginx/` - Reverse proxy config

---

## 🎨 Figma

- **File ID**: `FxJsfOV7R7qoXBM2xTyXRE`
- **Project**: MVP-LAST-Ok--originale-
- **Design System**: Tokens sincronizzati in `_tokens-figma.scss`

---

## 📝 Routing Post-Auth

| Condizione      | Redirect             |
| --------------- | -------------------- |
| Login + ha pet  | `/home/main`         |
| Login + no pet  | `/home/welcome-ai/1` |
| Signup (sempre) | `/home/welcome-ai/1` |
| OAuth + ha pet  | `/home/main`         |
| OAuth + no pet  | `/home/welcome-ai/1` |

---

## 🎛️ Drawer Menu (14 Schermate)

Il drawer laterale contiene 14 sezioni accessibili dal menu hamburger.

| #   | Schermata    | Route                 | Stato    |
| --- | ------------ | --------------------- | -------- |
| 1   | Account      | `/user/account`       | Completo |
| 2   | Attività     | `/home/activity`      | Completo |
| 3   | Notifiche    | `/home/notifications` | Completo |
| 4   | Salvati      | `/home/saved`         | Completo |
| 5   | Adotta       | `/home/adopt`         | Completo |
| 6   | Amici Pet    | `/home/friends`       | Completo |
| 7   | Invita       | `/home/invite`        | Completo |
| 8   | Smarriti     | `/home/lost-pets`     | Completo |
| 9   | Bloccati     | `/home/blocked`       | Completo |
| 10  | Abbonamenti  | `/home/subscriptions` | Completo |
| 11  | Contattaci   | `/home/contact`       | Completo |
| 12  | Termini      | `/home/terms`         | Completo |
| 13  | Privacy      | `/home/privacy`       | Completo |
| 14  | Registra Pet | `/home/pet-register`  | Completo |

### Documentazione

- **Spec tecnica**: `docs/DRAW_MENU_SPEC.md` (nel repo fiutami/docs)
- **README componenti**: `src/app/hero/drawer-sections/README.md`
- **Test E2E**: `e2e/tests/drawer-menu.spec.ts` (167 test cases)

### Test Matrix (8 Device)

- Mobile (375x667), Tablet (768x1024), Desktop (1440x900)
- Foldable Folded (717x512), Foldable Unfolded (1485x720)
- iPhone 2025 (430x932), Honor Magic V3/V5 (795x720)

---

## ⚠️ Note Importanti

1. **NON pushare direttamente su main** per feature - usa stage + merge
2. **Material Icons** deve essere in index.html per bottom tab bar
3. **Network Docker** è `fiutami_fiutami-stage` (con prefisso docker-compose)
4. **hasCompletedOnboarding** viene dal backend, non calcolato frontend
5. **GHCR login** richiesto sul server per pull immagini

---

*Ultimo aggiornamento: 2025-12-13*
