# Calendar Module

Modulo calendario per la gestione degli eventi del pet in Fiutami Angular app.

## Struttura

```
calendar/
├── calendar.component.ts              - Componente principale calendario
├── calendar.component.html
├── calendar.component.scss
├── calendar-month/
│   ├── calendar-month.component.ts    - Vista mese con griglia 7x6 giorni
│   ├── calendar-month.component.html
│   └── calendar-month.component.scss
├── event-create/
│   ├── event-create.component.ts      - Modal/bottom-sheet creazione evento
│   ├── event-create.component.html
│   └── event-create.component.scss
└── README.md
```

## Features

### CalendarComponent
- Vista mese corrente con navigazione prev/next
- Header con mese/anno corrente
- Pulsante "Oggi" per tornare al mese corrente
- Lista eventi del mese corrente
- FAB button per aggiungere nuovi eventi
- Mobile-first responsive design

### CalendarMonthComponent
- Griglia 7x6 giorni (calendario mensile completo)
- Evidenziazione giorno corrente
- Indicatori visivi per giorni con eventi (pallini colorati)
- Giorni del mese precedente/successivo in grigio
- Click su giorno per mostrare dettagli eventi

### EventCreateComponent
- Modal/bottom-sheet per creare nuovo evento
- Campi: titolo, data, ora, tipo evento
- 3 tipi di evento:
  - Appuntamento (blu - #4A74F0)
  - Promemoria (arancione - #F5A623)
  - Attività (verde - #43A047)
- Validazione form
- Animazioni slide-up/fade-in

## Routing

La route è configurata in `hero-routing.module.ts`:

```typescript
{
  path: 'calendar',
  component: CalendarComponent
}
```

Accessibile tramite: `/home/calendar`

## Dati Mock

Il calendario usa dati hardcoded per testing:

```typescript
events = [
  {
    id: '1',
    title: 'Visita veterinaria',
    date: new Date(2025, 11, 15, 10, 0),
    type: 'appointment',
    color: '#4A74F0',
  },
  {
    id: '2',
    title: 'Vaccino annuale',
    date: new Date(2025, 11, 20, 14, 30),
    type: 'reminder',
    color: '#F5A623',
  },
  // ...
];
```

## Design Tokens

Il modulo usa i token da `src/styles/_tokens-figma.scss`:

- `$color-cta-primary`: Background FAB button
- `$color-text-primary`: Testo principale
- `$color-text-secondary`: Testo secondario
- `$spacing-*`: Spaziature responsive
- `$border-radius-*`: Border radius
- `$shadow-*`: Ombre

## Responsive Breakpoints

- **Mobile** (< 768px): Layout verticale, bottom-sheet modal
- **Tablet** (768px - 1024px): Layout ottimizzato, padding aumentati
- **Desktop** (> 1024px): Layout centrato con max-width 1200px

## UI Components

### Header
- Pulsante indietro (← freccia)
- Titolo "Calendario"
- Pulsante "Oggi"

### Month Navigation
- Frecce prev/next
- Mese e anno corrente centrati

### Calendar Grid
- 7 colonne (Lun - Dom)
- 6 righe (42 celle totali)
- Giorni correnti evidenziati
- Giorni altri mesi al 30% opacità
- Oggi con background gradient giallo

### Event Indicators
- Pallini colorati sotto i giorni con eventi
- Max 3 pallini visibili per giorno
- Colori personalizzati per tipo evento

### FAB Button
- Position: fixed bottom-right
- Background: `$color-cta-primary`
- Icona: "+" (aggiungi)
- Shadow: `$shadow-xl`
- Hover: scale(1.1)

### Event List
- Card con sfondo bianco semi-trasparente
- Indicatore colorato per tipo evento
- Titolo e data/ora formattati
- Empty state: "Nessun evento in questo mese."

## Interactions

### Click su Giorno
```typescript
onDaySelected(date: Date): void {
  const eventsOnDay = this.events().filter(/* ... */);
  // Future: mostra modal con dettaglio eventi giorno
}
```

### Crea Evento
```typescript
onEventCreated(event: Partial<CalendarEvent>): void {
  const newEvent: CalendarEvent = {
    id: Date.now().toString(),
    title: event.title || 'Nuovo evento',
    date: event.date || new Date(),
    type: event.type || 'activity',
    color: event.color || '#4A74F0',
  };

  this.events.update(events => [...events, newEvent]);
  this.closeEventModal();
}
```

## Future Enhancements

- [ ] Integrazione con API backend
- [ ] Notifiche push per eventi
- [ ] Sincronizzazione calendario dispositivo
- [ ] Filtri per tipo evento
- [ ] Vista settimanale/giornaliera
- [ ] Ricorrenza eventi
- [ ] Inviti ad altri utenti
- [ ] Integrazione con servizi esterni (Google Calendar)
- [ ] Export eventi in formato iCal

## Accessibility

- ARIA labels su tutti i button
- `aria-current="date"` sul giorno corrente
- Focus visibile su elementi interattivi
- Screen reader support per event indicators
- Keyboard navigation (Tab/Enter/Escape)

## Testing

Per testare il modulo:

```bash
# Build
npm run build

# Serve
npm start

# Navigate to
http://localhost:4200/home/calendar
```

## Notes

- Componenti standalone (Angular 18)
- Change detection: OnPush
- Signals API per state management
- CSS Grid per layout calendario
- Mobile-first responsive design
- Design tokens da Figma
