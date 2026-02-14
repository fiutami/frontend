# Fix Deploy CI/CD - 20 Gennaio 2026

## Problema Iniziale

Il deploy su GitHub Actions falliva e la produzione non veniva aggiornata con le modifiche al Drawer Menu.

## Root Cause Analysis

### 1. package-lock.json Out of Sync

**Errore CI:**

```
npm ci can only install packages when your package.json and package-lock.json are in sync
Missing: chokidar@4.0.3 from lock file
Missing: readdirp@4.1.2 from lock file
```

**Causa:** Differenza tra npm locale (v11.6.0 su Node 22) e npm CI (Node 20)

**Fix:** Rigenerato package-lock.json con `--legacy-peer-deps`

---

### 2. Peer Dependency Conflict

**Errore CI:**

```
ERESOLVE could not resolve
peer @angular/common@">=20.1.3" from @abacritt/angularx-social-login@2.5.1
Found: @angular/common@18.2.14
```

**Causa:** La libreria `@abacritt/angularx-social-login@2.5.1` richiede Angular 20+, ma il progetto usa Angular 18.

**Fix:** Aggiunto `--legacy-peer-deps` a:

- `.github/workflows/deploy.yml` (riga 77)
- `Dockerfile` (riga 9)

```yaml
# deploy.yml
- name: Install dependencies
  run: npm ci --legacy-peer-deps
```

```dockerfile
# Dockerfile
RUN npm ci --legacy-peer-deps
```

---

### 3. Script e Content Mancanti

**Errore CI:**

```
Error: Cannot find module '/home/runner/work/frontend/frontend/scripts/build-breeds-json.js'
```

**Causa:** Le cartelle `scripts/` e `content/` non erano tracciate da git.

**Fix:** Aggiunte al repository:

- `scripts/` - Script per build del contenuto breeds
- `content/` - Markdown files delle razze

---

### 4. TypeScript Strict Mode Error

**Errore CI:**

```
TS18048: 'user.provider' is possibly 'undefined'
```

**File:** `src/app/auth/social-login/social-login.component.ts`

**Fix:** Aggiunti null checks:

```typescript
// Prima
this.providerSelected.emit(user.provider.toLowerCase() as 'google' | 'facebook');

// Dopo
if (user && user.provider && !this.isProcessingAuth) {
  this.providerSelected.emit(user.provider.toLowerCase() as 'google' | 'facebook');
}
```

---

### 5. SocialAuthServiceConfig Injection Token (BUG PRE-ESISTENTE)

**Errore Produzione:**

```
NullInjectorError: No provider for InjectionToken SocialAuthServiceConfig!
```

**File:** `src/app/auth/auth-shared.module.ts`

**Causa:** Il codice usava una stringa invece dell'InjectionToken corretto.

```typescript
// SBAGLIATO (dal commit iniziale)
provide: 'SocialAuthServiceConfig',

// CORRETTO
provide: SOCIAL_AUTH_CONFIG,
```

**Fix:**

```typescript
import {
  SocialLoginModule,
  SocialAuthServiceConfig,
  GoogleLoginProvider,
  FacebookLoginProvider,
  GoogleSigninButtonModule,
  SOCIAL_AUTH_CONFIG  // ← Aggiunto
} from '@abacritt/angularx-social-login';

// ...

providers: [
  {
    provide: SOCIAL_AUTH_CONFIG,  // ← Corretto
    useValue: {
      autoLogin: false,
      // ...
    } as SocialAuthServiceConfig
  }
]
```

---

## Commit Applicati

| Commit    | Descrizione                                                            |
| --------- | ---------------------------------------------------------------------- |
| `1887a19` | fix(ci): regenerate package-lock.json for CI compatibility             |
| `536df0a` | fix(ci): add --legacy-peer-deps to npm ci for Angular 18 compatibility |
| `f63a555` | chore: add build scripts for breeds content pipeline                   |
| `f835965` | chore: add breeds content markdown files for build pipeline            |
| `1a0e45a` | fix(auth): handle possibly undefined user.provider in social login     |
| `54e262e` | fix(docker): add --legacy-peer-deps to npm ci in Dockerfile            |
| `1624543` | fix(auth): use correct SOCIAL_AUTH_CONFIG injection token              |

---

## File Modificati

| File                                                  | Modifica                          |
| ----------------------------------------------------- | --------------------------------- |
| `package-lock.json`                                   | Rigenerato con --legacy-peer-deps |
| `.github/workflows/deploy.yml`                        | Aggiunto --legacy-peer-deps       |
| `Dockerfile`                                          | Aggiunto --legacy-peer-deps       |
| `src/app/auth/social-login/social-login.component.ts` | Null checks per user.provider     |
| `src/app/auth/auth-shared.module.ts`                  | Fix SOCIAL_AUTH_CONFIG token      |
| `scripts/*`                                           | Aggiunti al repo (7 file)         |
| `content/*`                                           | Aggiunti al repo (602 file)       |

---

## Lezioni Apprese

1. **Lockfile Compatibility:** Usare la stessa versione Node in locale e CI
2. **Peer Dependencies:** Angular 18 richiede `--legacy-peer-deps` per alcune librerie
3. **Git Tracking:** Verificare che tutti i file necessari al build siano committati
4. **InjectionToken:** Usare sempre l'InjectionToken esportato dalla libreria, non stringhe

---

## Verifica Post-Deploy

```bash
# Verificare deploy completato
gh run list --workflow=deploy.yml --limit=1

# Testare auth page in produzione
# - Verificare che la pagina di login si carichi
# - Verificare che i pulsanti social login funzionino
# - Verificare che il drawer menu mostri l'avatar pet
```
