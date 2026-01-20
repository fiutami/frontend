# FIUTAMI – Correzioni UX/UI (Implementazione FE)
**Owner:** Sam  
**Dev:** Leo  
**Obiettivo:** Allineare l’implementazione FE ai frame UX/UI ufficiali (Figma) senza variazioni.

---

## 0) Contesto
Dopo l’iscrizione (e dopo la registrazione/creazione Pet), tutti gli utenti atterrano sulla **Home FIUTAMI**.  
Questa pagina è **standard**, quindi deve essere **uguale per tutti** e coerente con le altre sezioni (tab bar inclusa).

> Nota: l’implementazione attuale risulta incoerente con UX/UI definita (layout + navigazione).  
> Questo documento descrive cosa correggere in modo operativo.

---

## 1) Link di riferimento (da aprire mentre si lavora)
- Home attuale (implementata): https://fiutami.pet/home/main
- Home corretta (Figma / reference):https://www.figma.com/design/FxJsfOV7R7qoXBM2xTyXRE/MVP-Phone-Ok--originale-?node-id=12271-5283&t=DcbBUqA7dZ8H2aTo-4
- Tab bar corretta (Figma / reference): https://www.figma.com/design/FxJsfOV7R7qoXBM2xTyXRE/MVP-Phone-Ok--originale-?node-id=12667-11260&t=DcbBUqA7dZ8H2aTo-4
- Reference campanella / notifiche (se disponibile): https://www.figma.com/design/FxJsfOV7R7qoXBM2xTyXRE/MVP-Phone-Ok--originale-?node-id=12271-5300&t=DcbBUqA7dZ8H2aTo-4
- Reference mascotte / bottom sheet (se disponibile): https://www.figma.com/design/FxJsfOV7R7qoXBM2xTyXRE/MVP-Phone-Ok--originale-?node-id=12668-5500&t=DcbBUqA7dZ8H2aTo-4

---

## 2) Home – Struttura corretta (layout e contenuti)

### 2.1 Header
**Da rimuovere:**
- Box riepilogo pet in alto (nome/età/taglia ecc.)
- Qualsiasi riquadro/CTA che porta al **Profilo personale - mappe - razze - calendario - galleria**

**Da mantenere:**
- Testo “Ciao utente” / saluti in header
- Barra di ricerca: **“Cosa posso fiutare”**
- Background/immagine hero 
- Avatar utente in alto a destra 

**Motivo:** la Home deve essere pulita e non duplicare funzioni che devono stare nella Tab Bar.

---

### 2.2 Contenuto principale (above the fold)
**Elemento principale:**
- Testo “Ciao utente” / saluti in header
- e sotto Barra di ricerca: **“Cosa posso fiutare”**
  - deve essere la prima cosa evidente
  - deve restare sempre visibile nella parte alta del contenuto

**Vicino alla search:**
- Icona **campanella** (notifiche) a fianco della barra “Cosa posso fiutare”, come da reference.

---

### 2.3 Campanella – Centro notifiche e suggerimenti
La **campanella** è il punto unico per:
- notifiche di sistema
- eventi personali dell’utente
- suggerimenti intelligenti legati al pet (NON in Home)

**Comportamento:**
- La campanella mostra un **badge numerico** (numero notifiche/eventi non letti).
- Al tap si apre una **lista notifiche/suggerimenti** (layout come da reference).

**Nota di prodotto (importante):**
- In fase iniziale (utente free):
  - suggerimenti limitati / informativi
- In fase successiva (utente premium):
  - suggerimenti avanzati
  - maggiore frequenza
  - maggiore personalizzazione

> La struttura UI deve essere pronta anche se la logica verrà estesa più avanti.

---

### 2.4 Mascotte FIUTAMI (interazione)
- La mascotte deve essere **visibile**
- Al tap sulla mascotte deve aprirsi una **bottom tab / bottom sheet** come da reference:
  - stile e comportamento identici al frame
  - animazione e gerarchia coerenti

---

### 2.5 Elementi da rimuovere dalla Home
**Da eliminare completamente dalla Home:**
- Bottoni/icone aggiunti nella Home tipo: **Calendario / Mappa / Galleria / Razza**
  - queste funzioni devono esistere **solo nella Tab Bar**
  - non devono comparire come bottoni separati nella Home e non con quel design
- Riquadro/CTA che porta al **Profilo personale** (duplicazione)
- Card/sezione **“Prossimi eventi”**
  - gli eventi/notifiche devono essere gestiti solo tramite **campanella**
- Widget / box duplicati di funzioni già nella tab bar
- Sezioni che appesantiscono e non servono all’azione immediata

**Regola:** se non risponde a “cosa posso fare adesso?”, va tolto.

---

## 3) Tab Bar – Regole NON negoziabili

### 3.1 La tab bar è globale
La tab bar:
- è **sempre presente**
- è **sempre identica** su tutte le schermate
- non cambia icone / ordine / stile da pagina a pagina

### 3.2 Ordine e voci corrette
1. Home  
2. Calendario  
3. Mappa  
4. Profilo Pet  
5. Specie  

> Nessuna icona extra, nessuna sostituzione.

### 3.3 Stato attivo corretto
- L’icona attiva deve riflettere la pagina corrente.
- Solo 1 tab attiva per volta.
- La selezione non deve cambiare in modo errato entrando in una sezione.


### Regola principale (NON negoziabile)
Ogni tap su una Tab:
- NON ricarica la pagina (non è refresh)
- FA SEMPRE reset dello stack della sezione e porta alla ROOT

Esempio:
Se sono in `Calendario > Crea evento` e tocco `Calendario` nella tab bar,
devo finire in `Calendario (root)` (vista principale calendario), sempre.

> Nota: questo NON è un “reload”. È un **reset della navigazione** della sezione verso la root.

### Implementazione attesa (concetto)
Tab tap = navigateToRoot(section) + resetNavigationStack(section)
Back arrow = pop() dello stack (torna alla pagina precedente)


---

### Back (freccia in alto a sinistra)
La freccia in alto a sinistra deve gestire il comportamento “torna indietro” nello stack:
- se l’utente è in una sottopagina (es. crea evento), torna alla pagina precedente nello stack
- non deve essere sostituita dalla tab bar

---

### Mappa destinazioni (single source of truth)
- **Home tab →** `Home: https://www.figma.com/design/FxJsfOV7R7qoXBM2xTyXRE/MVP-Phone-Ok--originale-?node-id=12271-5283&t=DcbBUqA7dZ8H2aTo-4
- **Calendario tab →** `Calendario : https://www.figma.com/design/FxJsfOV7R7qoXBM2xTyXRE/MVP-Phone-Ok--originale-?node-id=12271-6457&t=DcbBUqA7dZ8H2aTo-4`
- **Mappa tab →** `Mappa : https://www.figma.com/design/FxJsfOV7R7qoXBM2xTyXRE/MVP-Phone-Ok--originale-?node-id=12271-6258&t=DcbBUqA7dZ8H2aTo-4`
- **Profilo Pet tab →** `Profilo Pet:https://www.figma.com/design/FxJsfOV7R7qoXBM2xTyXRE/MVP-Phone-Ok--originale-?node-id=12271-5303&t=DcbBUqA7dZ8H2aTo-4`
- **Specie tab →** `Specie : https://www.figma.com/design/FxJsfOV7R7qoXBM2xTyXRE/MVP-Phone-Ok--originale-?node-id=12667-11260&t=DcbBUqA7dZ8H2aTo-4

---

### Stato attivo (selezione tab)
- La tab attiva deve riflettere la sezione corrente.
- Se sei in una pagina figlia della sezione, la tab resta attiva sulla sezione.
  - Esempio: `Specie > Razza > Dettaglio` → tab attiva = `Specie`


**Reference tab bar:** https://www.figma.com/design/FxJsfOV7R7qoXBM2xTyXRE/MVP-Phone-Ok--originale-?node-id=12667-11260&t=DcbBUqA7dZ8H2aTo-4
---

## 4) Acceptance Criteria (quando consideriamo “ok” la Home)

### 4.1 Pulizia e rimozione elementi non corretti
- [ ] Rimossi i bottoni/icone in Home tipo: **Profilo personale/Calendario / Mappa / Galleria / Razza**
- [ ] Rimossa la card/sezione **“Prossimi eventi”** dalla Home
- [ ] Rimossa la sezione suggerimenti

### 4.2 Notifiche (campanella)
- [ ] Aggiunta icona **campanella** a fianco della barra “Cosa posso fiutare” (posizione come reference)
- [ ] La campanella mostra un **badge numerico** per notifiche/eventi non letti
- [ ] Al tap, la campanella apre la lista notifiche/suggerimenti (come da reference)
- [ ] Non esistono altri blocchi “eventi” in Home

### 4.3 Search e contenuto core
- [ ] Search “Cosa posso fiutare” è l’elemento principale e sempre visibile
- [ ] “Suggerimenti per te” NON presente in Home (i suggerimenti sono nella campanella)

### 4.4 Mascotte
- [ ] Mascotte visibile e apre bottom sheet corretta (come reference)

### 4.5 Tab Bar
- [ ] Tab bar globale identica su tutte le schermate
- [ ] Selezione tab corretta (solo 1 attiva) coerente con pagina corrente

---

## 5) Note operative (per evitare errori ricorrenti)
- Non reinterpretare i frame: replicare gerarchie e spaziature.
- La tab bar è un componente shared: una sola fonte di verità.
- Evitare duplicazioni: navigazione e accessi principali devono stare nella tab bar.
- Verificare su diverse risoluzioni e dispositivi.

---

## 6) Changelog
- v2: Home aggiornata con rimozioni (bottoni/icone, profilo personale, prossimi eventi) + campanella come centro notifiche/suggerimenti + rimozione suggerimenti dalla Home.



### Voci Drawer collegate a feature future (IMPORTANTE)

Nel Drawer Menu sono presenti **collegamenti a frame e sezioni importanti** che:
- sono corrette e volute in questa posizione
- non devono comparire ora in Home
- non devono essere replicate nella Tab Bar

**Motivo UX e di prodotto:**
- La Home, in questa fase, deve restare **pulita ed essenziale**
- Alcune funzionalità verranno:
  - esposte in modo più evidente in futuro
  - oppure spostate anche in Home o altre sezioni
  - solo per utenti a pagamento o in release successive

Questa scelta è **intenzionale** e serve a:
- non sovraccaricare l’utente free
- mantenere una crescita progressiva dell’esperienza
- evitare refactor UI futuri

### Regola da rispettare
- Le voci presenti nel Drawer:
  - restano nel Drawer
  - seguono il frame di riferimento
- NON devono essere duplicate in Home
- NON devono essere anticipate con bottoni o shortcut non previsti

**Reference frame Drawer Menu:**  
https://www.figma.com/design/FxJsfOV7R7qoXBM2xTyXRE/MVP-Phone-Ok--originale-?node-id=12271-11089&t=DcbBUqA7dZ8H2aTo-4

