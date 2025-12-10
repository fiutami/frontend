# Deploy & Secrets Setup - Fiutami

Guida alla configurazione del deploy automatico e dei secrets per STAGE e PROD.

---

## Metodo di Deploy: SSH (Gratuito, No Portainer BE)

Portainer CE **non supporta webhook** (feature di Business Edition).
Usiamo **SSH deploy** da GitHub Actions - gratuito e più affidabile.

```
GitHub Actions → SSH → Server → docker compose pull → docker compose up
```

### Vantaggi SSH vs Webhook:
- ✅ Gratuito (no Portainer BE)
- ✅ Secrets passati in modo sicuro via GitHub Secrets
- ✅ File `.env` creato automaticamente sul server
- ✅ Logs completi in GitHub Actions
- ✅ Funziona con qualsiasi server Linux

---

## Setup SSH Deploy (One-Time)

### 1. Prepara il Server STAGE

```bash
# Sul server play.francescotrani.com

# Crea directory per il progetto
sudo mkdir -p /opt/fiutami
sudo chown $USER:$USER /opt/fiutami

# Clona il repository (solo la prima volta)
cd /opt/fiutami
git clone https://github.com/fra-itc/fiutami.git .
# Oppure solo i file docker-compose:
curl -O https://raw.githubusercontent.com/fra-itc/fiutami/stage/docker-compose.stage.yml

# Login a GitHub Container Registry (per pull immagini)
echo $GITHUB_TOKEN | docker login ghcr.io -u fra-itc --password-stdin
```

### 2. Genera SSH Key per GitHub Actions

```bash
# Sul tuo PC locale
ssh-keygen -t ed25519 -C "github-actions-fiutami" -f ~/.ssh/github_actions_fiutami

# Mostra la chiave privata (da copiare in GitHub Secrets)
cat ~/.ssh/github_actions_fiutami

# Mostra la chiave pubblica (da aggiungere al server)
cat ~/.ssh/github_actions_fiutami.pub
```

### 3. Aggiungi Chiave Pubblica al Server

```bash
# Sul server STAGE
echo "ssh-ed25519 AAAA... github-actions-fiutami" >> ~/.ssh/authorized_keys
```

### 4. Configura GitHub Secrets

Vai su **GitHub → Repository → Settings → Secrets and variables → Actions**

| Secret Name | Valore | Note |
|-------------|--------|------|
| `SSH_PRIVATE_KEY` | Contenuto di `~/.ssh/github_actions_fiutami` | Chiave privata completa |
| `SSH_HOST_STAGE` | `play.francescotrani.com` | Hostname server STAGE |
| `SSH_USER` | `root` o tuo username | User SSH |
| `DB_PASSWORD` | `FiutamiStage123!` | Password database |
| `JWT_SECRET` | `FiutamiStage_SuperSecretKey_Min32Chars!` | Chiave JWT (min 32 char) |
| `GOOGLE_CLIENT_ID` | `384947883378-...` | Per OAuth Google |

### 5. Test Deploy

```bash
# Push su branch stage per triggerare il deploy
git checkout stage
git push origin stage
```

Il workflow:
1. Builda le immagini Docker
2. Le pusha su ghcr.io
3. Si connette via SSH al server
4. Crea il file `.env` con i secrets
5. Esegue `docker compose pull && docker compose up -d`

---

## Setup PROD Environment

Stesso processo di STAGE, ma con:

- **Branch:** `main`
- **Compose path:** `docker-compose.prod.yml`
- **GitHub Secret:** `SSH_HOST_PROD` invece di `SSH_HOST_STAGE`
- **Password più sicure!**

### GitHub Secrets aggiuntivi per PROD

| Secret Name | Valore |
|-------------|--------|
| `SSH_HOST_PROD` | `fiutami.pet` o IP del server PROD |

---

## Valori Secrets Consigliati

### STAGE (Test/Demo)

```env
DB_PASSWORD=FiutamiStage123!
JWT_SECRET=FiutamiStage_SuperSecretKey_MinimumLength32!
GOOGLE_CLIENT_ID=384947883378-eghthqhqvoau0m0ubqstvr9baq0pbtbb.apps.googleusercontent.com
```

### PROD (Produzione)

```env
DB_PASSWORD=<genera-password-sicura-24-chars>
JWT_SECRET=<genera-chiave-sicura-64-chars>
GOOGLE_CLIENT_ID=<client-id-produzione>
FACEBOOK_APP_ID=<app-id-produzione>
FACEBOOK_APP_SECRET=<app-secret-produzione>
```

**Genera password sicure:**
```bash
# Linux/Mac
openssl rand -base64 32

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Automazione Futura (Roadmap)

### Opzione 1: Portainer API (Parzialmente Automatizzabile)

Portainer espone API REST per gestire gli stack. È possibile automatizzare via GitHub Actions:

```yaml
# .github/workflows/deploy.yml (futuro)
- name: Update Portainer Stack
  run: |
    curl -X PUT \
      -H "X-API-Key: ${{ secrets.PORTAINER_API_KEY }}" \
      -H "Content-Type: application/json" \
      -d '{
        "env": [
          {"name": "DB_PASSWORD", "value": "${{ secrets.DB_PASSWORD }}"},
          {"name": "JWT_SECRET", "value": "${{ secrets.JWT_SECRET }}"}
        ]
      }' \
      "https://play.francescotrani.com:9443/api/stacks/2"
```

**Limitazione:** Richiede API Key di Portainer con permessi admin.

### Opzione 2: HashiCorp Vault (Enterprise)

Per progetti più grandi, Vault offre:
- Rotazione automatica secrets
- Audit logging
- Dynamic secrets per database

```yaml
# Integrazione Vault (futuro)
services:
  backend:
    environment:
      - VAULT_ADDR=https://vault.example.com
      - VAULT_TOKEN=${VAULT_TOKEN}
```

### Opzione 3: Docker Secrets con Swarm

Se si migra a Docker Swarm:

```yaml
# docker-compose.prod.yml (Swarm mode)
services:
  backend:
    secrets:
      - db_password
      - jwt_secret

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

---

## Troubleshooting

### Container non si avvia

```bash
# Verifica logs
docker logs fiutami-backend-stage

# Errore comune: "JWT SecretKey not configured"
# → Verifica che JWT_SECRET sia impostato in Portainer
```

### Errore connessione DB

```bash
# Verifica che DB_PASSWORD sia corretto
docker exec -it fiutami-db-stage /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'TUA_PASSWORD' -C -Q "SELECT 1"
```

### Webhook non funziona

1. Verifica che l'URL sia corretto in GitHub Secrets
2. Controlla che Portainer sia raggiungibile da internet (porta 9443)
3. Verifica i logs di Portainer

---

## Checklist Setup Nuovo Ambiente

### Sul Server
- [ ] Creare directory `/opt/fiutami`
- [ ] Login a `ghcr.io` per pull immagini
- [ ] Aggiungere chiave pubblica SSH a `~/.ssh/authorized_keys`
- [ ] Copiare `docker-compose.{env}.yml` in `/opt/fiutami/`

### Su GitHub Secrets
- [ ] `SSH_PRIVATE_KEY` - chiave privata SSH
- [ ] `SSH_USER` - username SSH
- [ ] `SSH_HOST_{ENV}` - hostname server
- [ ] `DB_PASSWORD` - password database
- [ ] `JWT_SECRET` - chiave JWT (min 32 chars)
- [ ] `GOOGLE_CLIENT_ID` - (se OAuth Google)

### Test
- [ ] Push su branch per triggerare deploy
- [ ] Verificare logs in GitHub Actions
- [ ] Testare endpoint `/health`

---

## GitHub Secrets - Riepilogo Completo

| Secret | Uso | Obbligatorio |
|--------|-----|--------------|
| `SSH_PRIVATE_KEY` | Chiave SSH per deploy | ✅ Sì |
| `SSH_USER` | Username SSH (es: `root`) | ✅ Sì |
| `SSH_HOST_STAGE` | `play.francescotrani.com` | ✅ Per STAGE |
| `SSH_HOST_PROD` | `fiutami.pet` | ✅ Per PROD |
| `DB_PASSWORD` | Password database | ✅ Sì |
| `JWT_SECRET` | Chiave JWT (min 32 char) | ✅ Sì |
| `GOOGLE_CLIENT_ID` | OAuth Google | ⚠️ Per social login |
| `FACEBOOK_APP_ID` | OAuth Facebook | ❌ Opzionale |
| `FACEBOOK_APP_SECRET` | OAuth Facebook | ❌ Opzionale |

---

*Documento creato: 2025-11-30*
*Ultima modifica: 2025-11-30*
