# Test Plan – Hero mobile-first (Playwright)

## Device matrix
- iOS: 5.8" (iPhone 12 mini), 6.1" (iPhone 14), 6.7" (iPhone 14 Pro Max).
- Android: 6.1" (Pixel 6a), 6.8" (Pixel 7 Pro).
- Tablet: 10" iPad landscape (centrato max-width 440 pt).

## Suite Playwright
1. **Snapshot portrait-360** – verifica assenza scroll, disposizione elementi, headroom cane.
2. **Snapshot android-360** – conferma spacing e gradient.
3. **Snapshot landscape-740** – tablet layout centrato.
4. **Focus order test** – simulazione tab order (lingua → claim → CTA … Social).
5. **Lingua switch** – attiva sheet, seleziona “English”, verifica update copy.
6. **Link legali** – clic su Termini/Privacy, assicurarsi `popup` con URL esterno.
7. **Touch targets** – utilizzare `locator.boundingBox()` per CTA/social (≥ 44×44).
8. **Contrast check** – eseguire axe + custom check su combinazioni principali.
9. **Performance** – misurare first paint via `page.metrics()` + profilo Lighthouse (manuale) < 100 ms.

## Manual/extra
- Screen reader (VoiceOver/TalkBack) su device reale.
- Rotazione forzata ≤ 8" → verificare blocco.
- Tablet landscape: ridimensionare browser e confermare gutter fluidi.

## Reporting
- Allegare screenshot Playwright e log test in PR.
- Segnalare deviazioni rispetto a criteria AC-01..AC-12.
