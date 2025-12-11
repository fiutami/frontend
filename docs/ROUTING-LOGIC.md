# Fiutami - Routing Logic & Navigation Flow

> Documento di riferimento per la logica di routing dell'app.
> Aggiornare questo file prima di richiedere modifiche.

---

## Workflow Git & Deploy

| Branch | Trigger | Azione |
|--------|---------|--------|
| `stage` | push | CI only (build/test) - NO deploy |
| `main` | push | CI + CD (build + deploy automatico) |
| PR → main/stage | PR | CI only (build/test) |

**Flusso corretto:**
```
stage (lavoro) → merge to main → auto-deploy → fiutami.pet
```

---

## Post-Auth Redirects

### Dopo Login (Email/Password)

| Condizione | Redirect |
|------------|----------|
| Utente ha almeno 1 pet | `/home/main` |
| Utente non ha pet | `/home/welcome-ai/1` |

### Dopo Signup (Email/Password)

| Condizione | Redirect |
|------------|----------|
| Nuovo utente (sempre senza pet) | `/home/welcome-ai/1` |

### Dopo Social Login (Google/Facebook)

| Condizione | Redirect |
|------------|----------|
| Utente ha almeno 1 pet | `/home/main` |
| Utente non ha pet | `/home/welcome-ai/1` |

---

## Onboarding Flow (welcome-ai)

```
/home/welcome-ai/1
    │
    ├─ "Ho un animale" → /home/welcome-ai/2a → /home/pet-register
    │
    └─ "Vorrei un animale" → /home/welcome-ai/2b → /home/species-questionnaire/q1
```

### Pagine Onboarding

| Route | Descrizione | Azione Principale |
|-------|-------------|-------------------|
| `/home/welcome-ai/1` | Domanda iniziale | "Ho un animale" / "Vorrei un animale" |
| `/home/welcome-ai/2a` | Flusso "Ho un animale" | CTA → Registra pet |
| `/home/welcome-ai/2b` | Flusso "Vorrei un animale" | CTA → Questionario specie |

---

## Pet Registration Flow

```
/home/pet-register
    │
    └─ /home/pet-register/specie → /home/pet-register/details → /home/pet-register/docs → /home/pet-register/wellness
```

| Route | Descrizione |
|-------|-------------|
| `/home/pet-register` | Intro registrazione |
| `/home/pet-register/specie` | Selezione specie |
| `/home/pet-register/details` | Dettagli pet (nome, sesso, data nascita) |
| `/home/pet-register/docs` | Documenti pet |
| `/home/pet-register/wellness` | Info salute/benessere |

---

## Species Questionnaire Flow (per chi non ha pet)

```
/home/species-questionnaire/q1 → q2 → q3 → q4 → q5 → q6 → result
```

| Route | Domanda |
|-------|---------|
| `q1` | TODO: descrivere domanda 1 |
| `q2` | TODO: descrivere domanda 2 |
| `q3` | TODO: descrivere domanda 3 |
| `q4` | TODO: descrivere domanda 4 |
| `q5` | TODO: descrivere domanda 5 |
| `q6` | TODO: descrivere domanda 6 |
| `result` | Risultato suggerimento specie |

---

## Main App Routes (dopo onboarding)

| Route | Descrizione | Accesso |
|-------|-------------|---------|
| `/home/main` | Home principale | Utenti con pet |
| `/home/pet-profile` | Profilo pet | Utenti con pet |
| `/home/pet-profile/:id` | Profilo pet specifico | Utenti con pet |
| `/home/calendar` | Calendario eventi | Tutti |
| `/home/map` | Mappa luoghi pet-friendly | Tutti |
| `/home/chat` | Lista conversazioni | Tutti |
| `/home/chat/:id` | Singola chat | Tutti |

---

## Auth Routes (pubbliche)

| Route | Descrizione |
|-------|-------------|
| `/` | Home start (splash) |
| `/login` | Form login |
| `/signup` | Form registrazione |
| `/forgot-password` | Reset password |

---

## Drawer Menu Routes

| Route | Voce Menu |
|-------|-----------|
| `/home/activity` | Attività |
| `/home/notifications` | Notifiche |
| `/home/saved` | Salvati |
| `/home/adopt` | Adotta |
| `/home/friends` | Amici pet |
| `/home/invite` | Invita amici |
| `/home/lost-pets` | Smarriti |
| `/home/blocked` | Utenti bloccati |
| `/home/terms` | Termini servizio |
| `/home/subscriptions` | Abbonamenti |
| `/home/contact` | Contattaci |
| `/home/privacy` | Privacy |

---

## TODO - Modifiche Richieste

> Aggiungi qui le modifiche da implementare:

- [ ] _Esempio: Cambiare redirect dopo login con pet da /home/main a /home/pet-profile_
- [ ] _Esempio: Aggiungere step intermedio tra welcome-ai/2a e pet-register_

---

## Note Tecniche

### File coinvolti per redirect post-auth:
- `src/app/auth/login/login.component.ts`
- `src/app/auth/signup/signup.component.ts`
- `src/app/auth/social-login/social-login.component.ts`

### Metodo per verificare se utente ha pet:
```typescript
this.authService.hasCompletedOnboarding()
```

### Routing module principale:
- `src/app/hero/hero-routing.module.ts`

---

*Ultimo aggiornamento: 2025-12-11*
