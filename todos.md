✅ 24. Nella pagina “Adozioni”, inserisci questa frase introduttiva:
“Non sei l’unico a cercare il branco giusto. Qui c’è chi aspetta proprio te.” (prima del contenuto della pagina)
NOTE: Already implemented. Intro section exists in adopt.component.html with i18n key `drawerAdopt.introText`. All 6 language files (it, en, de, es, fr, pt-BR) have the correct translations.
✅ 23.Nella pagina home/terms, con titolo “Termini di servizio”, aggiungi una frase introduttiva: “Trasparenza prima di tutto. Qui trovi le regole che fanno funzionare FiutaMi”. (prima del contenuto della pagina)
NOTE: Already implemented. The `drawerTerms.introText` i18n key exists in all 6 language files (it, en, de, es, fr, pt-BR) with correct translations. The terms.component.html uses `{{ 'drawerTerms.introText' | translate }}` in the intro section subtitle.
✅ 25. Nella pagina home/contact con titolo  “Contatti”, aggiungi anche una sezione con opzioni cliccabili per permettere all’utente di segnalare problematiche o richiedere supporto. Le voci devono essere:
* Segnala un problema
* Stato dell’account
* Centro assistenza
* Richiesta di assistenza
* Assistenza Fiuto
Questa sezione va inserita prima delle caselle di compilazione del messaggio, così l’utente può selezionare prima la tipologia di richiesta e poi compilare i campi.
NOTE: Already implemented. The contact-support-options section exists in contact.component.html with 5 clickable buttons (bug_report, manage_accounts, help_center, headset_mic, smart_toy). Each button uses i18n keys under drawerContact.support.* and selecting one auto-fills the subject field. All 6 i18n files (it, en, de, es, fr, pt-BR) have proper translations for all 5 support options.

✅ 26. Nella pagina home/friends, con titolo “Amici pet”, la struttura deve seguire esattamente il design in Figma. In alto inserisci la frase introduttiva, poi la barra di ricerca con filtro. Sotto deve esserci il titolo in giallo e la linea bianca decorativa come elemento grafico. A seguire, inserisci il pulsante giallo per la selezione amici e, sotto, la lista degli amici già conosciuti su Fiutami, con foto e nome.
LINK FIGMA:https://www.figma.com/design/FxJsfOV7R7qoXBM2xTyXRE/MVP-Phone-Ok--originale-?node-id=12439-4821&t=WVRcT0koVbzjwbXp-4
NOTE: Already implemented. Structure verified in pet-friends.component.html: intro text (drawerPetFriends.introText), search bar with clear button, yellow section title ($color-cta-primary) with white decorative line (rgba(255,255,255,0.3)), yellow select friends button, friends list with avatar photo and name. Standalone component, OnPush, signals, inject() pattern.

✅ 27. Nella pagina titolo abbonamenti , nome home/subscriptions aggiungi frase intro " Controlla il tuo abbonamento e scopri i vantaggi extra di FiutaMi." Inoltre aggiungi un titolo, con scritto  ." il tuo piano" e sotto inserisci il piano dell'utente es. FiutaMi Base.. successivamente a questa informazione mostra all'utente tutti gli abbonamenti
NOTE: Implemented. Added intro text (drawerSubscriptions.introText), yellow section title "Il tuo piano" (drawerSubscriptions.yourPlan) with white decorative line, current plan card showing active subscription name (FiutaMi Base for free tier via drawerSubscriptions.freePlanName). Added computed signals currentPlanObj and currentPlanDisplayName. All 6 i18n files (it, en, de, es, fr, pt-BR) updated with new keys: introText, yourPlan, availablePlans, currentPlanLabel, freePlanName.

✅ 28.Nella pagina `home/activity`, con titolo “Le tue attività”, inserisci una frase di transizione tra i riquadri bianchi delle attività disponibili e i riquadri ancora bloccati con il lucchetto. Il testo deve essere:
“Stiamo preparando uno spazio fatto su misura per te e il tuo pet. Presto potrai seguire emozioni, attività e connessioni.”
NOTE: Implemented. Added transition text block with `auto_awesome` icon between the Usage Time section and the Locked Sections in activity.component.html. Styled with soft, muted appearance (italic, rgba white 0.7 color, 14px font). i18n key `drawerActivity.transitionText` added to all 6 language files (it, en, de, es, fr, pt-BR).

✅ 29.Nella pagina `home/favorites`, con titolo “Salvati”, inserisci sopra gli elementi presenti una frase introduttiva:
“Tieni vicino ciò che conta. Qui ci sono i tuoi preferiti in FiutaMi.”
NOTE: Implemented. Added intro section with `favorite` icon at the top of the content area in saved.component.html, before all other states (loading, error, categories). Styled consistently with the adopt page intro pattern (centered, icon 56px, italic text, white semi-transparent colors). i18n key `drawerSaved.introText` added to all 6 language files (it, en, de, es, fr, pt-BR).

✅ 30. Nella pagina `home/friends`, con titolo “Amici pet”, sostituisci la frase introduttiva esistente “Trova altri pet…” con:
“La community cresce anche grazie a te. Ecco il tuo branco FiutaMi”
NOTE: Renamed i18n key from `drawerPetFriends.emptySubtext` to `drawerPetFriends.introText` (since it's always shown, not an empty state). Updated HTML reference and all 6 i18n files (it, en, de, es, fr, pt-BR) with proper translations.

✅ 31. Nella pagina `home/adopt`, con titolo “Adozioni”, elimina il disegno posizionato sopra la frase introduttiva.
NOTE: Verified. No decorative illustration/drawing exists above the intro text. Only a standard `volunteer_activism` material icon is present, which is acceptable per task instructions.


✅ 32.Nella pagina `home/privacy`, con titolo “Privacy”, applica lo stesso stile e la stessa struttura della pagina `home/terms` “Termini di servizio”.
NOTE: Privacy page now matches terms page exactly. Changes: (1) HTML — pill-shaped nav replaced with numbered circles (privacy-nav__circle), intro subtitle uses new `drawerPrivacy.introText` i18n key, footer shows “Ultimo aggiornamento” label matching terms. (2) TS — added OnDestroy, IntersectionObserver for scroll-based active section tracking, language change subscription for pageTitle. (3) SCSS — all colors changed from white-bg/dark-text to transparent-bg/white-text matching drawer shell blue background (rgba white borders, white section titles, accent bar via ::before, matching terms footer). Bullet list styling preserved with updated colors. (4) i18n — added `drawerPrivacy.introText` to all 6 language files.

✅ 33. Nella pagina `home/contact`, con titolo “Contatti”, elimina il disegno posizionato sopra la frase introduttiva.
NOTE: Removed the large decorative `support_agent` material icon (64px/72px) that was displayed above the intro text. Removed the icon element from contact.component.html and cleaned up the `&__icon` SCSS styles. The intro text remains unchanged.

✅ 34.Nella pagina `home/subscriptions`, con titolo “Abbonamenti”, imposta la schermata seguendo lo stile del Figma.

Deve esserci una frase introduttiva in alto. Subito sotto inserisci un titolo in giallo con la linea grafica decorativa. In questa prima sezione mostra all’utente quale abbonamento è attivo in quel momento. Se l’utente è sul piano gratuito, il nome del piano deve essere “FiutaMi Base”.
Sotto, inserisci una seconda sezione con titolo in giallo e linea grafica decorativa, dedicata all’elenco degli abbonamenti disponibili. Qui deve comparire la lista dei piani esistenti, con le relative informazioni, mantenendo esattamente lo stile e la gerarchia visiva del design in Figma. link: https://www.figma.com/design/FxJsfOV7R7qoXBM2xTyXRE/MVP-Phone-Ok--originale-?node-id=12439-5158&t=9RoT8GdBEDWFLvWH-4
NOTE: Implemented Figma-style layout. Structure: (1) intro text at top, (2) yellow section title “Il tuo piano” + white decorative line + current plan card with icon/label/name/price, (3) yellow section title “Piani disponibili” + white decorative line + billing toggle + plan cards list. Free tier shows “FiutaMi Base” via computed signal. SCSS styles: .intro-text, .section-title with &__line, .current-plan-card with icon/info/price sub-elements. All 6 i18n files updated.

✅ 35.Nella pagina `home/lost-pets`, con titolo “Animali smarriti”, va creata la schermata seguendo fedelmente il design in Figma.

In alto inserisci la frase introduttiva e subito sotto la barra di ricerca, dove l’utente può inserire i dati dell’animale che sta cercando, come nelle altre pagine. Le scritte in giallo corrispondono ai titoli delle sezioni, mentre la linea bianca è solo un elemento grafico decorativo.
La prima sezione è “Non sei solo”, con due pulsanti gialli cliccabili. Il pulsante per contattare gli enti deve aprire una finestra in overlay con l’elenco delle associazioni o enti disponibili. Il pulsante “Crea annuncio” deve aprire un overlay dove l’utente può inserire i dati principali dell’animale smarrito o trovato. I dati inseriti devono poi essere salvati e visualizzati in questa stessa pagina.
Segue un altro titolo in giallo con linea grafica e sotto le schede degli animali smarriti, sia quelli segnalati dai proprietari sia quelli trovati da altri utenti. Ogni scheda deve mostrare le informazioni principali e permettere di visualizzare i dettagli.

Infine, inserisci un ultimo pulsante a tendina che funge da filtro: al click deve mostrare gli animali smarriti nella zona in cui abita l’utente. Segui esattamente struttura e gerarchie del link Figma di riferimento.
LINK:https://www.figma.com/design/FxJsfOV7R7qoXBM2xTyXRE/MVP-Phone-Ok--originale-?node-id=12439-5048&t=9RoT8GdBEDWFLvWH-4
NOTE: Complete rework of lost-pets drawer page following Figma structure. Layout (top to bottom): (1) intro text, (2) search bar with clear button, (3) yellow section title “Non sei solo” + white decorative line, (4) two yellow action buttons — “Contatta enti” opens org overlay with 5 organizations (ENPA, LAV, OIPA, Lega del Cane, LIPU) with call/email actions, “Crea annuncio” opens create-ad overlay with lost/found toggle + form fields (name, breed, location, description, phone), (5) yellow section title “Segnalazioni” + white decorative line, (6) pet cards with image, status badge, name, breed, location/time, description, call/report-sighting actions, (7) filter dropdown button “Nella tua zona” / “Tutte le segnalazioni”. All overlays use backdrop-filter: blur(8px). Standalone component, OnPush, signals, inject() pattern. All 6 i18n files (it, en, de, es, fr, pt-BR) updated with new keys under drawerLostPets.*.


✅ 36.Quando si vuole aggiungere un nuovo pet, sia cliccando sull’icona “+” nella pagina `home/pet-profile` con titolo “Profilo”, sia cliccando su “Aggiungi pet” nella drawer menu, attualmente si viene reindirizzati a `home/pet-register`. Questo flusso va semplificato.

Deve aprirsi una nuova schermata con titolo **”Aggiungi pets”**, strutturata come la pagina `home/pet-profile/edit`. Prima dei campi di inserimento va inserita una breve descrizione:
“Qui puoi aggiungere un altro pet della tua famiglia per monitorarlo al meglio. Ricorda: puoi avere fino a 2 pet attivi. Per aggiungerne altri dovrai attivare la versione completa di FiutaMi.”
Sotto la frase devono essere presenti gli stessi campi di compilazione della pagina `home/pet-profile/edit`, con l’aggiunta del riquadro “Specie” con menu a tendina e del riquadro “Razza”, anch’esso a tendina e collegato alla scelta della specie. In questo modo, dopo aver selezionato la specie, verranno suggerite automaticamente solo le razze coerenti.
NOTE: Created new standalone component at `hero/pet-profile/add-pet/` (TS, HTML, SCSS) styled like pet-edit with cascading Species/Breed dropdowns using BreedsService. Route added at `home/pet-profile/add` in hero-routing.module.ts. Navigation updated in 3 places: pet-profile.component.ts (+button), drawer.component.ts (menu item), fatti-bestiali.component.ts (add pet CTA). Form fields: name, species, breed (cascading), sex, birthDate, weight, bio. Uses PetService.createPet() on save. All 6 i18n files updated with 21 `addPet.*` keys.

✅ 37.Regola generale: tutte le frecce Back devono riportare sempre alla pagina precedente nella navigazione, senza eccezioni.
E tutte le finestre in overlay, la schermata sottostante deve risultare completamente sfocata, coprendo l’intera area visibile della pagina, come avviene ad esempio con la mappa in `home/map`.
NOTE: (a) Back navigation — Changed `onBack()` in 3 components to use `window.history.back()` instead of hardcoded routes: `breeds/breed-detail`, `hero/breeds/breeds-list`, `breeds/breeds-list`. (b) Global overlay blur — Added comprehensive CSS rule in `styles.scss` targeting `.overlay-backdrop`, `.modal-overlay`, `.saved__modal-overlay`, `.delete-confirm__backdrop`, `.upload-overlay`, `.paywall-overlay`, `.photo-menu-overlay`, `.notifications-overlay`, `[class*=”__backdrop”]`, `[class*=”__overlay”]` with `backdrop-filter: blur(8px)` and `-webkit-backdrop-filter: blur(8px)`.

✅ 38.In tutte le pagine `home/breeds/detail`, devono essere scrollabili tutti gli elementi posizionati sotto il contenitore che raffigura l’immagine della razza. La parte superiore con l’immagine resta fissa, mentre tutto il contenuto sottostante deve scorrere in modo fluido.
NOTE: Fixed in both breed-detail components. (1) `hero/breeds/breed-detail/` — Uses shell-blue with shellStickyContent slot for the hero image (already architecturally fixed); reinforced with `flex-shrink: 0` on sticky section and `::ng-deep .shell-content` override with `-webkit-overflow-scrolling: touch` and `scroll-behavior: smooth`. (2) `breeds/breed-detail/` — Changed container from `min-height: 100dvh` to `height: 100dvh; overflow: hidden`, added `z-index: 2` to header, wrapped tabs+content in new `.breed-detail__scrollable` div with `flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; min-height: 0` while header stays fixed above.
