# Handoff: Fiuto AI Concierge - Tecnologia Implementata

> **Data**: Febbraio 2026
> **Scope**: Frontend Angular 18 + Microservizio TTS Python
> **Status**: Implementazione completata, pronto per integration testing

---

## 1. Panoramica Architetturale

Fiuto (il mascotte cane di FIUTAMI) e stato trasformato da assistente confinato al questionario onboarding a **concierge AI globale** con capacita vocali, disponibile su ogni pagina dell'app.

### Stack Tecnologico AI

| Layer | Tecnologia | Dove |
|-------|-----------|------|
| LLM | OpenRouter (via backend proxy) | `.NET 8 backend /api/ai/chat` |
| TTS | edge_tts (Microsoft Neural Voices) | `tts/` microservizio Python |
| STT | Web Speech Recognition API | Browser nativo |
| Frontend | Angular 18 Signals + Standalone Components | `frontend/src/app/` |

### Diagramma Flusso

```
                    +------------------+
                    |   OpenRouter LLM  |
                    +--------+---------+
                             |
                    +--------+---------+
                    | .NET 8 Backend    |
                    | /api/ai/chat      |
                    | /api/ai/explain   |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
    +---------+----------+     +------------+-----------+
    | FiutoAiGlobalService|     | TTS Microservice       |
    | (Angular)           |     | FastAPI + edge_tts     |
    | Route detection     |     | POST /api/tts/synthesize|
    | Context building    |     | Port 5100              |
    | System prompts      |     +------------+-----------+
    +---------+----------+                  |
              |                             |
    +---------+----------+     +------------+-----------+
    | MascotBottomSheet   |     | TtsService (Angular)   |
    | Chat thread UI      |     | LRU Cache (20 blobs)   |
    | Voice input/output  |     | Web Speech fallback    |
    +--------------------+     +------------------------+
```

---

## 2. Servizio AI Globale

### File: `core/services/fiuto-ai-global.service.ts`

Il cuore del sistema. Servizio singleton (`providedIn: 'root'`) che:

- **Rileva la route corrente** via `Router.events` → `NavigationEnd`
- **Auto-seleziona il mode AI** in base alla route (es. `map` → `guide`, `search` → `search`)
- **Costruisce system prompts dinamici** combinando:
  - Personalita base di Fiuto (amichevole, competente, conciso)
  - Istruzioni specifiche per mode (concierge, search, guide, questionnaire, results)
  - Contesto della route corrente
- **Gestisce la chat history** (max 20 messaggi) con signals reattivi
- **Streaming HTTP** verso il backend con timeout 35s e fallback responses

### API Pubblica

```typescript
// Invia messaggio con context auto-detected
sendMessage(message: string, context?: Partial<FiutoContext>): Promise<string>

// Signals reattivi
messages: Signal<FiutoChatMessage[]>
isTyping: Signal<boolean>
error: Signal<string | null>
currentRoute: Signal<FiutoRoute>
currentMode: Signal<FiutoMode>
contextualGreeting: Signal<string>
contextualSuggestions: Signal<FiutoSuggestion[]>

// Utility
clearHistory(): void
getHistory(): FiutoChatMessage[]
buildContext(override?): FiutoContext
buildSystemPrompt(context): string
```

### Route → Mode Mapping

| Route | Default Mode | Comportamento Fiuto |
|-------|-------------|---------------------|
| home | concierge | Guida verso funzionalita utili |
| search | search | Interpreta query naturali, suggerisce filtri |
| map | guide | Suggerisce POI vicini |
| calendar | guide | Info su eventi |
| breeds | guide | Confronta razze, da info |
| adoption | concierge | Incoraggia, info pratiche |
| lost-pets | concierge | Sensibile e utile |
| onboarding | questionnaire | Aiuta con le domande del quiz |
| premium | general | Presenta vantaggi senza essere commerciale |

### Backward Compatibility

Il servizio originale `onboarding/questionnaire-v2/engine/fiuto-ai.service.ts` e ora un **thin wrapper** che:
- Mappa `ChatContext` → `FiutoContext`
- Delega tutte le chiamate al servizio globale
- Mantiene la stessa interfaccia pubblica (zero breaking changes per `FiutoChatComponent`)
- L'unica eccezione e `explainBreed()` che chiama ancora direttamente `/api/ai/explain`

---

## 3. Text-to-Speech (TTS)

### 3.1 Microservizio Python (`tts/`)

**Stack**: FastAPI + edge_tts (Microsoft Neural Voices gratuite)

```
tts/
  Dockerfile          # Python 3.12-slim, porta 5100
  requirements.txt    # edge-tts, fastapi, uvicorn, pydantic
  app/
    main.py           # FastAPI app + CORS
    models.py          # Pydantic schemas
    routes/tts.py      # Endpoints
    services/tts_service.py  # edge_tts wrapper
```

**Endpoints**:

| Method | Path | Input | Output |
|--------|------|-------|--------|
| POST | `/api/tts/synthesize` | `{ text, voice_id, rate, pitch }` | `audio/mpeg` stream |
| GET | `/api/tts/voices?lang=it-IT` | Query param opzionale | `VoiceInfo[]` |
| GET | `/api/tts/health` | - | `{ status, service }` |

**Voci selezionate per Fiuto** (calde, amichevoli, maschili):

| Lingua | Voice ID |
|--------|----------|
| Italiano | `it-IT-DiegoNeural` |
| English | `en-US-GuyNeural` |
| Deutsch | `de-DE-ConradNeural` |
| Espanol | `es-ES-AlvaroNeural` |
| Francais | `fr-FR-HenriNeural` |
| Portugues BR | `pt-BR-AntonioNeural` |

**Deploy**: Container Docker `fiutami-tts` su porta 5100. Proxy dev configurato in `proxy.conf.json`.

### 3.2 Frontend TTS Service (`core/services/tts.service.ts`)

| Feature | Dettaglio |
|---------|----------|
| **LRU Cache** | 20 blob URLs cached, eviction con `URL.revokeObjectURL()` |
| **Audio Queue** | Messaggi sequenziali con coda FIFO |
| **Playback** | Singolo `HTMLAudioElement` riusato |
| **Offline Fallback** | `window.speechSynthesis` (Web Speech API) quando backend non raggiungibile |
| **Preferences** | Auto-play on/off, volume → `localStorage` (`fiutami_tts_autoplay`, `fiutami_tts_volume`) |
| **Controls** | `speak()`, `pause()`, `resume()`, `stop()`, `skip()`, `setVolume()`, `toggleAutoPlay()` |

**Signals esposti**: `isPlaying`, `isPaused`, `isLoading`, `currentText`, `error`, `autoPlay`, `volume`

---

## 4. Speech-to-Text (STT)

### File: `core/services/stt.service.ts`

Usa la **Web Speech Recognition API** nativa del browser (Chrome, Edge, Safari).

| Feature | Dettaglio |
|---------|----------|
| **Modes** | `single-shot` (auto-stop dopo risultato finale) e `continuous` |
| **Interim Results** | Trascrizione live mostrata nell'input mentre l'utente parla |
| **Silence Timeout** | 5 secondi di silenzio → auto-stop |
| **NgZone** | Tutti i callback recognition eseguono in zona Angular (change detection) |
| **Permission** | `navigator.mediaDevices.getUserMedia({ audio: true })` per richiesta proattiva |
| **Language** | Auto da lingua app → BCP-47 locale (`it-IT`, `en-US`, `pt-BR`, etc.) |
| **Graceful Degradation** | Se browser non supporta, `isSupported = false` → bottone mic nascosto |

**Signals esposti**: `isListening`, `transcript`, `interimTranscript`, `confidence`, `error`, `isSupported`

**Errori mappati in italiano**: `not-allowed` → "Permesso microfono negato", `no-speech` → "Nessun audio rilevato", etc.

---

## 5. Componenti UI Voice

### 5.1 VoiceInputButtonComponent

```html
<app-voice-input-button
  [mode]="'tap-toggle'"    <!-- o 'hold-to-record' -->
  [size]="'md'"            <!-- 'sm' | 'md' | 'lg' -->
  (transcriptReady)="onText($event)"
  (interimTranscript)="onPartial($event)" />
```

- Pulse animation rossa durante recording
- `prefers-reduced-motion` rispettato
- Si nasconde automaticamente se STT non supportato

### 5.2 MessagePlayButtonComponent

```html
<app-message-play-button [text]="messageText" />
```

- Computed `isThisPlaying` basato su `ttsService.currentText() === text`
- 3 stati: idle (volume_up), loading (hourglass), playing (stop)

### 5.3 AudioPlaybackIndicatorComponent

```html
<app-audio-playback-indicator [variant]="'mini'" />
<!-- Varianti: 'inline' | 'floating' | 'mini' -->
```

- 4 barre sonore animate con delay sfalsati
- Controlli pause/resume/stop (nascosti in `mini`)
- Variant `floating`: posizionamento fisso bottom-right

### 5.4 TtsToggleComponent

```html
<app-tts-toggle />
```

- Toggle auto-play on/off con icona `volume_up`/`volume_off`
- Persiste preferenza via `TtsService.toggleAutoPlay()`

---

## 6. Wiring Concierge Globale

### MascotPeekComponent (modificato)

**Prima**: Tap su mascot expanded → solo collapse, `mascotTapped` mai emesso
**Dopo**: Tap su mascot expanded → **emette `mascotTapped`** e poi collapse

### TabPageShellDefaultComponent (modificato)

Questo componente wrappa **tutte le pagine con tab bar** (Calendar, Map, Breeds, etc.).

Aggiunto:
- `MascotBottomSheetComponent` nel template
- `FiutoAiGlobalService` injection
- `showMascotSheet`, `mascotMessages`, `mascotAiMessage` signals
- `onMascotTapped()` → apre bottom sheet con greeting contestuale
- `onChatMessage(msg)` → chiama AI e aggiorna messages

**Risultato**: Fiuto e disponibile su **ogni pagina** dell'app che usa il layout standard.

### MascotBottomSheetComponent (modificato)

Nuovi Input/Feature:
- `@Input() enableVoice = false` → abilita UI vocale
- `@Input() messages: FiutoChatMessage[] = []` → chat thread scrollable
- Mic button accanto a send
- Play button su ogni messaggio AI
- Audio indicator nel header
- TTS toggle nel header
- Chat thread con bolle user (blu) e assistant (grigio)
- Typing indicator con 3 punti animati
- Icona mic sui messaggi inviati con voce

---

## 7. AI-Assisted Search

### AiSearchService (`core/services/ai-search.service.ts`)

```typescript
processNaturalQuery(query): Promise<AiSearchInterpretation>
summarizeResults(results, query): Promise<string>
getRelatedSearches(query): Promise<string[]>
```

### SearchPageComponent (modificato)

Nuove feature:
- **Voice input button** accanto alla search bar
- **Chip "Cerca con Fiuto"** per attivare AI mode
- **AI summary bubble** (AiMessageBubbleComponent) sopra i risultati quando AI mode attivo
- In AI mode: query → `AiSearchService.processNaturalQuery()` + search normale in parallelo

---

## 8. Internazionalizzazione

Chiavi aggiunte a tutti 6 i file i18n (`it`, `en`, `de`, `es`, `fr`, `pt-BR`):

```json
{
  "voice": {
    "record", "stopRecording", "listening",
    "micPermission", "micDenied", "notSupported",
    "play", "stop", "pause", "resume",
    "autoPlayOn", "autoPlayOff", "noSpeech"
  },
  "fiuto": {
    "greeting", "thinking", "aiMode",
    "searchWithFiuto", "concierge"
  }
}
```

---

## 9. Configurazione e Deploy

### Proxy Dev (`proxy.conf.json`)

```json
{
  "/api/tts": { "target": "http://localhost:5100" },
  "/api":     { "target": "http://localhost:5062" }
}
```

> L'ordine e importante: `/api/tts` deve venire PRIMA di `/api` per evitare match generico.

### Docker TTS

```bash
cd tts/
docker build -t fiutami-tts .
docker run -p 5100:5100 fiutami-tts
```

### Costanti Configurabili

| Costante | Valore | File |
|----------|--------|------|
| `TTS_CONFIG.CACHE_SIZE` | 20 | `voice.constants.ts` |
| `TTS_CONFIG.MAX_TEXT_LENGTH` | 5000 | `voice.constants.ts` |
| `TTS_CONFIG.DEFAULT_VOLUME` | 0.8 | `voice.constants.ts` |
| `STT_CONFIG.SILENCE_TIMEOUT_MS` | 5000 | `voice.constants.ts` |
| `ANIMATION_DELAY.TTS_FADE_IN` | 200 | `timing.constants.ts` |
| `ANIMATION_DELAY.TTS_FADE_OUT` | 150 | `timing.constants.ts` |
| `REQUEST_TIMEOUT_MS` (AI) | 35000 | `fiuto-ai-global.service.ts` |
| `MAX_HISTORY` (AI) | 20 | `fiuto-ai-global.service.ts` |

---

## 10. File Map Completa

### File Creati (14)

| # | File | Descrizione |
|---|------|-------------|
| 1 | `core/models/fiuto-ai.models.ts` | Types AI globali |
| 2 | `core/services/fiuto-ai-global.service.ts` | Servizio AI concierge |
| 3 | `core/config/fiuto-prompts.config.ts` | Prompt e suggestions per route |
| 4 | `core/services/tts.service.ts` | TTS frontend con cache |
| 5 | `core/config/constants/voice.constants.ts` | Voci e config vocali |
| 6 | `core/services/stt.service.ts` | STT Web Speech API |
| 7 | `core/services/fiuto-context-detector.service.ts` | Context detection |
| 8 | `core/services/fiuto-proactive-tips.service.ts` | Tips contestuali |
| 9 | `core/services/ai-search.service.ts` | AI search interpretation |
| 10 | `shared/components/voice-input-button/*` | Bottone microfono |
| 11 | `shared/components/message-play-button/*` | Play su messaggi |
| 12 | `shared/components/audio-playback-indicator/*` | Indicatore audio |
| 13 | `shared/components/tts-toggle/*` | Toggle auto-play |
| 14 | `tts/` (7 file Python) | Microservizio TTS |

### File Modificati (9)

| # | File | Modifica |
|---|------|----------|
| 1 | `onboarding/.../fiuto-ai.service.ts` | Wrapper → globale |
| 2 | `hero/home/home.component.ts` | Wire `onChatMessage` al servizio AI |
| 3 | `core/config/constants/timing.constants.ts` | `TTS_FADE_IN/OUT` |
| 4 | `shared/components/mascot-bottom-sheet/*` | Voice UI + chat thread |
| 5 | `shared/components/ai-message-bubble/*` | Play button inline |
| 6 | `shared/components/mascot-peek/*` | Emit `mascotTapped` |
| 7 | `shared/components/tab-page-shell-default/*` | Bottom sheet + AI wire |
| 8 | `search/search-page/*` | Voice search + AI mode |
| 9 | `proxy.conf.json` | `/api/tts` proxy |

### File i18n Aggiornati (6)

`it.json`, `en.json`, `de.json`, `es.json`, `fr.json`, `pt-BR.json`

---

## 11. Testing Checklist

| # | Test | Come Verificare |
|---|------|-----------------|
| 1 | AI Chat | Home → tap mascot → scrivi messaggio → risposta AI |
| 2 | TTS Backend | `curl -X POST localhost:5100/api/tts/synthesize -d '{"text":"Ciao"}' -H 'Content-Type: application/json' --output test.mp3` |
| 3 | TTS Frontend | Bottom sheet → messaggio AI → click play → audio riprodotto |
| 4 | STT | Bottom sheet → tap mic → parla → testo nell'input |
| 5 | Concierge globale | Calendar/Map/Breeds → tap mascot → saluto contestuale |
| 6 | AI Search | Search → chip "Cerca con Fiuto" → query → summary AI |
| 7 | Offline TTS | Disattiva rete → TTS fallback Web Speech API |
| 8 | i18n | Cambia lingua → voci cambiano, saluti tradotti |
| 9 | Auto-play | Toggle on → messaggi AI letti automaticamente |
| 10 | Preferences | Refresh pagina → volume e auto-play persistono |

---

## 12. Dipendenze Esterne

| Dipendenza | Tipo | Note |
|-----------|------|------|
| OpenRouter API | Backend (.NET) | Gia configurato, proxy `/api/ai/chat` |
| edge_tts | Python package | Gratuito, usa voci Microsoft Neural |
| Web Speech API | Browser API | Chrome/Edge/Safari. Non serve su Firefox |
| FastAPI | Python framework | Microservizio TTS |

### Browser Support STT

| Browser | Supportato | Note |
|---------|-----------|------|
| Chrome 33+ | Si | Pieno supporto |
| Edge 79+ | Si | Pieno supporto |
| Safari 14.1+ | Si | Con prefisso webkit |
| Firefox | No | `isSupported = false`, mic nascosto |

---

## 13. Possibili Evoluzioni Future

- **Persistent chat history**: Salvare conversazioni in backend per continuita tra sessioni
- **Streaming TTS**: Invece di scaricare tutto l'audio, streammare chunks per latenza ridotta
- **Wake word**: "Ehi Fiuto!" per attivare STT senza tap
- **Emotion detection**: Analisi sentiment del testo utente per adattare tono Fiuto
- **Multimodal**: Fiuto che "vede" foto di animali caricate dall'utente
- **Rate limiting**: Throttle richieste AI per utente (backend)
- **Analytics**: Tracciare metriche su uso vocale, domande frequenti, satisfaction
