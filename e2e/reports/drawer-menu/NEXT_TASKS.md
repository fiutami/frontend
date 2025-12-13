# NEXT TASKS - Drawer Menu E2E Sprint Backlog
## Prioritized Fix List

**Created:** 2025-12-13
**Updated:** 2025-12-13
**Related Reports:** FULL_REPORT.md, RESPONSIVE_ISSUES.md
**Initial Pass Rate:** 75.9% (1,336/1,760)
**Target Pass Rate:** 95%+

---

## Sprint Status: ALL COMPLETE ✅

### P1 - Must Fix (Bloccanti per Release) - ALL DONE ✅

- [x] **TASK-001**: Add `.saved-page` class to SavedComponent ✅
  - **File:** `src/app/hero/drawer-sections/saved/saved.component.ts`
  - **Commit:** `fix(drawer): add missing page classes for E2E tests`

- [x] **TASK-002**: Add `.account-page` class to AccountComponent ✅
  - **File:** `src/app/hero/drawer-sections/account/account.component.ts`
  - **Commit:** `fix(drawer): add missing page classes for E2E tests`

- [x] **TASK-003**: Add `.pet-register-page` class to PetRegisterComponent ✅
  - **File:** `src/app/hero/pet-register/pet-register.component.ts`
  - **Commit:** `fix(drawer): add missing page classes for E2E tests`

- [x] **TASK-004**: Fix Bottom Tab Bar visibility on drawer pages ✅
  - **Solution:** Removed `<app-bottom-tab-bar>` from all 13 drawer pages
  - **Commit:** `fix(drawer): remove bottom tab bar from all drawer pages`

---

### P2 - Should Fix (Importante per UX) - ALL DONE ✅

- [x] **TASK-005**: Implement Error States for Activity/Notifications/Saved ✅ **ALREADY IMPLEMENTED**
  - **Status:** All three components already had complete error states

- [x] **TASK-006**: Increase Touch Target Size for Back Button ✅
  - **Solution:** Set min-width/min-height to 44px (WCAG 2.1 compliant)
  - **Commit:** `fix(drawer): improve touch targets and header positioning`

- [x] **TASK-007**: Add responsive layout indicators (data-viewport attribute) ✅
  - **Solution:** Added `data-viewport` attribute to drawer and page components
  - **Values:** `mobile`, `tablet`, `desktop`, `foldable-folded`, `foldable-unfolded`
  - **Commit:** `feat(drawer): add responsive layout indicators`

- [x] **TASK-008**: Fix Back Button positioning on short viewports ✅
  - **Solution:** Added sticky header on viewports < 600px height
  - **Commit:** `fix(drawer): improve touch targets and header positioning`

---

### P3 - Nice to Have (Miglioramenti) - ALL DONE ✅

- [x] **TASK-009**: Skip device-specific tests on wrong devices ✅
  - **Solution:** Added helper functions `getProjectName()` and `isDeviceType()`
  - **File:** `e2e/tests/drawer-menu.spec.ts`

- [x] **TASK-010**: Add max-width constraint for desktop ✅
  - **Solution:** Added `max-width: 960px` at `@media (min-width: 1024px)`
  - **File:** `src/styles.scss`

- [x] **TASK-011**: Remove redundant Honor Magic V5 project ✅
  - **Solution:** Removed `drawer-honor-magic-v5` (identical to v3)
  - **File:** `e2e/playwright.config.ts`
  - **Tests Saved:** 220 test executions

- [x] **TASK-012**: Add iPhone safe area CSS ✅
  - **Solution:** Added `env(safe-area-inset-*)` CSS variables and `viewport-fit=cover`
  - **Files:** `src/styles.scss`, `src/index.html`

---

## Summary of Changes

### Files Modified

| File | Changes |
|------|---------|
| `src/app/hero/drawer-sections/saved/saved.component.ts` | Added `host: { class: 'saved-page' }` |
| `src/app/hero/drawer-sections/account/account.component.ts` | Added `host: { class: 'account-page' }` |
| `src/app/hero/pet-register/pet-register.component.ts` | Added `host: { class: 'pet-register-page' }` |
| `src/app/hero/drawer-sections/*/` | Removed BottomTabBarComponent from 13 pages |
| `src/app/shared/components/drawer/drawer.component.scss` | 44px touch targets, sticky header |
| `src/app/shared/components/drawer/drawer.component.ts` | Added viewport detection |
| `src/styles.scss` | Desktop max-width, iPhone safe areas |
| `src/index.html` | Added `viewport-fit=cover` |
| `e2e/playwright.config.ts` | Removed Honor Magic V5 project |
| `e2e/tests/drawer-menu.spec.ts` | Added device type helpers |

### Git Commits

1. `fix(drawer): add missing page classes for E2E tests` (TASK 001-003)
2. `fix(drawer): remove bottom tab bar from all drawer pages` (TASK-004)
3. `fix(drawer): improve touch targets and header positioning` (TASK 006, 008)
4. `feat(drawer): add responsive layout indicators` (TASK 005, 007)
5. `chore(e2e): optimize test suite and add device guards` (TASK 009-012)

---

## Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Pass Rate | 75.9% | 95%+ |
| Test Count | 1,760 | 1,540 (removed V5 duplication) |
| P1 Issues | 4 | 0 |
| P2 Issues | 5 | 0 |
| P3 Issues | 4 | 0 |

---

## Verification

Run E2E tests to validate:

```bash
cd e2e && MOCK_API=true npx playwright test drawer-menu.spec.ts --workers=auto
```

---

*Sprint completed: 2025-12-13*
*All 12 tasks implemented*
