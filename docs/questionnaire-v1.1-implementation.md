# Questionnaire v1.1 - Implementation Log

## Overview

Implementazione del nuovo questionario FIUTAMI con:
- A/B/C testing per UX variations
- Flow engine con branching condizionale
- Fiuto AI assistant integration
- Analytics completi

---

## Step 1: Analytics Infrastructure ✅ COMPLETATO

### Commits
| Repo | Commit | Data |
|------|--------|------|
| Frontend | `28055fb` | 2026-02-07 |
| Backend | `657f1b2` | 2026-02-07 |

---

### Frontend Files

#### `src/app/core/models/analytics.models.ts`

```typescript
// Tipi per A/B/C testing
export type QuestionnaireVariant = 'A' | 'B' | 'C';

// 11 tipi di evento tracciati
export type QuestionnaireEventType =
  | 'questionnaire_loaded'
  | 'questionnaire_started'
  | 'question_viewed'
  | 'question_answered'
  | 'questionnaire_completed'
  | 'questionnaire_abandoned'
  | 'back_navigation_used'
  | 'fiuto_chat_opened'
  | 'fiuto_chat_message_sent'
  | 'recommendation_viewed'
  | 'recommendation_clicked';

// Envelope per ogni evento
export interface QuestionnaireEventEnvelope {
  eventType: QuestionnaireEventType;
  timestamp: number;
  variant: QuestionnaireVariant;
  experimentVersion: number;
  questionnaireVersion: string;
  sessionId: string;
  deviceId: string;
  payload: Record<string, unknown>;
}
```

#### `src/app/core/services/experiment.service.ts`

**Funzionalità:**
- Assegnazione deterministica variante A/B/C
- Split 34/33/33 (hash < 34 = A, < 67 = B, else C)
- SSR-safe (`typeof window !== 'undefined'`)
- `Math.abs(hash) % 100` per evitare negativi
- Versioned storage (bump `EXPERIMENT_VERSION` per riassegnare)
- Seed da userId (se loggato) o deviceId (UUID persistente)

**API:**
```typescript
getVariant(): QuestionnaireVariant  // Ritorna A, B, o C
getDeviceId(): string               // UUID persistente
getExperimentVersion(): number      // Per tracciare esperimenti
```

#### `src/app/core/services/analytics.service.ts`

**Funzionalità:**
- Batching: max 25 eventi OR 5 secondi interval
- `sendBeacon` su `beforeunload` per delivery affidabile
- Retry automatico se POST fallisce
- Session tracking con UUID

**API:**
```typescript
track(eventType, payload)                      // Evento generico
trackQuestionViewed(questionId)                // Convenience
trackQuestionAnswered(questionId, optionId)
trackCompleted(recommendedBreedIds)
trackAbandoned(lastQuestionId)
trackBackNavigation(from, to)
flush(sync?)                                   // Forza invio
```

#### `src/app/core/index.ts`

Aggiornato con export per i nuovi moduli.

---

### Backend Files

#### `src/Fiutami.Core/DTOs/QuestionnaireDTOs.cs`

```csharp
// Enum per variante
public enum QuestionnaireVariant { A, B, C }

// DTO singolo evento
public record QuestionnaireEventDto
{
    [Required] public string EventType { get; init; }
    [Required] public long Timestamp { get; init; }
    [Required] public QuestionnaireVariant Variant { get; init; }
    [Required] public int ExperimentVersion { get; init; }
    [Required] public string QuestionnaireVersion { get; init; }
    [Required] public string SessionId { get; init; }
    [Required] public string DeviceId { get; init; }
    public Dictionary<string, object>? Payload { get; init; }
}
```

#### `src/Fiutami.API/Controllers/QuestionnaireController.cs`

**Nuovo endpoint:**
```csharp
[HttpPost("events")]
[AllowAnonymous]
public ActionResult IngestEvents([FromBody] List<QuestionnaireEventDto> events)
```

**Perché `[AllowAnonymous]`?**

Il questionario può essere usato da utenti NON ancora loggati:

```
1. Utente arriva su landing page (anonimo)
2. Clicca "Trova il tuo animale ideale"
3. Compila questionario (ANCORA ANONIMO - raccogliamo eventi qui!)
4. Vede risultati
5. Solo dopo decide se registrarsi/loggarsi
```

Se l'endpoint richiedesse autenticazione, perderemmo tutti gli analytics della fase pre-login.

**Protezioni implementate:**
- Max 100 eventi per batch (anti-spam)
- Validazione campi obbligatori
- NO free text nel payload (privacy)
- TODO: Rate limit 100 req/IP/hour

**Response:** `202 Accepted { received: N }`

---

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                               │
│                                                             │
│  User clicks → AnalyticsService.track('question_answered') │
│       │                                                     │
│       ▼                                                     │
│  Buffer (max 25 eventi)                                    │
│       │                                                     │
│       ▼ (ogni 5s OR buffer pieno OR beforeunload)          │
│  POST /api/questionnaire/events                            │
│       │                                                     │
└───────┼─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND                                │
│                                                             │
│  QuestionnaireController.IngestEvents()                    │
│       │                                                     │
│       ▼                                                     │
│  Validazione + 202 Accepted                                │
│       │                                                     │
│       ▼ (TODO)                                             │
│  Persist to DB / Send to BI tool                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### TODO Step 1

- [ ] Rate limiting middleware (100 req/IP/hour)
- [ ] Persistenza eventi su DB
- [ ] Dashboard analytics (fuori scope FE)

---

## Step 2: Flow Engine ✅ COMPLETATO

### Files in `src/app/onboarding/questionnaire-v2/`

#### Models
| File | Descrizione |
|------|-------------|
| `models/question.models.ts` | Question, QuestionOption, SetAction con op tipizzata |
| `models/profile.models.ts` | UserPreferenceProfile con 14 profili globali |
| `models/flow.models.ts` | FlowState con Record<>, history, helper functions |

#### Engine Services
| File | Descrizione |
|------|-------------|
| `engine/flow-engine.service.ts` | Navigazione forward/back, showIf + nextOnSkip |
| `engine/expression-parser.service.ts` | Parser sicuro (NO eval), whitelist operators |
| `engine/profile-manager.service.ts` | SetAction operations, localStorage, backend sync |

#### UI Components
| File | Descrizione |
|------|-------------|
| `components/questionnaire-shell/` | Orchestrator principale |
| `components/question-renderer/` | Render domanda con opzioni |
| `components/progress-bar/` | Indicatore progresso |
| `components/option-card/` | Singola opzione selezionabile |

#### Data
| File | Descrizione |
|------|-------------|
| `data/core-questions.ts` | Q00-Q27 con i18n keys |
| `data/companion-module.ts` | Modulo COMPANION |
| `data/species-modules.ts` | Moduli specie-specifici |
| `data/leaves.ts` | Nodi terminali |
| `data/questionnaire-data.ts` | Aggregatore dati |

### Micro fix implementati ✅

1. `Math.abs(hashCode) % 100` per evitare negativi ✅
2. `typeof window !== 'undefined'` per SSR safety ✅
3. `Record<>` per serializzazione, NON `Map` ✅
4. `deleteAnswer()` con spread pattern, NON `.delete()` ✅
5. Variant/version in tutti gli eventi ✅

### Test
- `engine/flow-engine.service.spec.ts` - Navigation, showIf, back nav

---

## Step 3: Mini Demo (DA FARE)

- 6 domande core
- 1 modulo (COMPANION)
- 1 leaf (mock result)
- Verifica flow end-to-end

---

## Step 4: Matching + Fiuto AI (DA FARE)

- Transformers.js embedding
- OpenRouter integration
- Fiuto chat bubble

---

## Step 5: Full Questionnaire (DA FARE)

- Tutte domande Q00-Q27
- Tutti i moduli
- i18n completo
- Graph validator

---

## References

- Piano completo: `C:\Users\Fra\.claude\plans\tidy-noodling-cookie.md`
- CLAUDE.md frontend: `frontend\CLAUDE.md`
- CLAUDE.md backend: `backend\CLAUDE.md`
