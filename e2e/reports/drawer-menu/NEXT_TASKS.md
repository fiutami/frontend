# NEXT TASKS - Drawer Menu E2E Sprint Backlog
## Prioritized Fix List

**Created:** 2025-12-13
**Related Reports:** FULL_REPORT.md, RESPONSIVE_ISSUES.md
**Current Pass Rate:** 75.9% (1,336/1,760)
**Target Pass Rate:** 95%+

---

## Sprint Backlog

### P1 - Must Fix (Bloccanti per Release)

- [ ] **TASK-001**: Add `.saved-page` class to SavedComponent
  - **File:** `src/app/hero/drawer-sections/saved/saved.component.ts`
  - **Issue:** P1-001
  - **Tests Fixed:** ~24
  - **Effort:** 5 min

- [ ] **TASK-002**: Add `.account-page` class to AccountComponent
  - **File:** `src/app/hero/drawer-sections/account/account.component.ts`
  - **Issue:** P1-002
  - **Tests Fixed:** ~24
  - **Effort:** 5 min

- [ ] **TASK-003**: Add `.pet-register-page` class to PetRegisterComponent
  - **File:** `src/app/hero/drawer-sections/pet-register/pet-register.component.ts`
  - **Issue:** P1-003
  - **Tests Fixed:** ~24
  - **Effort:** 5 min

- [ ] **TASK-004**: Fix Bottom Tab Bar visibility on drawer pages
  - **File:** `src/app/shared/components/bottom-tab-bar/bottom-tab-bar.component.ts`
  - **Issue:** P1-004
  - **Tests Fixed:** ~108
  - **Effort:** 30-60 min
  - **Dependencies:** Need to define which routes should hide tab bar

---

### P2 - Should Fix (Importante per UX)

- [x] **TASK-005**: Implement Error States for Activity/Notifications/Saved ✅ **ALREADY IMPLEMENTED**
  - **Files:**
    - `src/app/hero/drawer-sections/activity/activity.component.html`
    - `src/app/hero/drawer-sections/notifications/notifications.component.html`
    - `src/app/hero/drawer-sections/saved/saved.component.html`
  - **Issue:** P2-002
  - **Tests Fixed:** ~24
  - **Status:** All three components already have complete error states with:
    - Error UI (`.activity-error`, `.notifications-error`, `.saved-error`)
    - Retry buttons
    - Error icons and messages

- [ ] **TASK-006**: Increase Touch Target Size for Back Button
  - **File:** `src/app/shared/components/drawer/drawer.component.scss` or header component
  - **Issue:** P2-003
  - **Tests Fixed:** ~16
  - **Effort:** 15 min

- [x] **TASK-007**: Add responsive layout indicators (data-viewport attribute) ✅ **COMPLETED**
  - **Files:**
    - `src/app/shared/components/drawer/drawer.component.ts`
    - `src/app/hero/drawer-sections/activity/activity.component.ts`
    - `src/app/hero/drawer-sections/notifications/notifications.component.ts`
    - `src/app/hero/drawer-sections/saved/saved.component.ts`
  - **Issue:** P2-004
  - **Tests Fixed:** ~48
  - **Implementation:**
    - Added `data-viewport` attribute to drawer and page containers
    - Values: `mobile`, `tablet`, `desktop`, `foldable-folded`, `foldable-unfolded`
    - Added `data-testid` attributes for E2E targeting

- [ ] **TASK-008**: Fix Back Button positioning on short viewports
  - **File:** `src/app/shared/components/drawer/drawer.component.scss`
  - **Issue:** P2-005
  - **Tests Fixed:** ~8
  - **Effort:** 15 min

---

### P3 - Nice to Have (Miglioramenti)

- [ ] **TASK-009**: Skip device-specific tests on wrong devices
  - **File:** `e2e/tests/drawer-menu.spec.ts`
  - **Issue:** P3-001
  - **Tests Fixed:** ~72 (false failures removed)
  - **Effort:** 30 min

- [ ] **TASK-010**: Add max-width constraint for desktop
  - **File:** `src/app/hero/drawer-sections/drawer-section.component.scss` (or global)
  - **Issue:** P3-002
  - **Tests Fixed:** ~24
  - **Effort:** 15 min

- [ ] **TASK-011**: Remove redundant Honor Magic V5 project
  - **File:** `e2e/playwright.config.ts`
  - **Issue:** P3-003
  - **Tests Saved:** 220 tests execution time
  - **Effort:** 5 min

- [ ] **TASK-012**: Add iPhone safe area CSS
  - **File:** `src/styles/global.scss` or component
  - **Issue:** P3-004
  - **Tests Fixed:** ~8
  - **Effort:** 15 min

---

## Dependencies Graph

```
TASK-001 ─┬─> TASK-005 (error states need page structure)
TASK-002 ─┤
TASK-003 ─┘

TASK-004 (standalone, no dependencies)

TASK-006 ──> TASK-008 (both affect drawer header)

TASK-007 ──> TASK-009 (tests depend on implementation)

TASK-010 (standalone)
TASK-011 (standalone)
TASK-012 (standalone)
```

---

## Execution Plan

### Sprint 1: Quick Wins (2-4 hours)

**Goal:** Increase pass rate from 75.9% to ~86%

| Order | Task | Effort | Cumulative Pass Rate |
|-------|------|--------|---------------------|
| 1 | TASK-001 | 5 min | 77.3% |
| 2 | TASK-002 | 5 min | 78.7% |
| 3 | TASK-003 | 5 min | 80.1% |
| 4 | TASK-004 | 60 min | 86.2% |

**Deliverables:**
- 4 component files modified
- ~180 tests fixed
- Commit: `fix(drawer): add missing page classes and fix tab bar visibility`

---

### Sprint 2: UX Improvements (4-6 hours)

**Goal:** Increase pass rate from ~86% to ~93%

| Order | Task | Effort | Cumulative Pass Rate |
|-------|------|--------|---------------------|
| 5 | TASK-006 | 15 min | 87.1% |
| 6 | TASK-008 | 15 min | 87.6% |
| 7 | TASK-007 | 30 min | 90.3% |
| 8 | TASK-005 | 2 hours | 91.7% |

**Deliverables:**
- Error state UI components
- Improved touch targets
- Responsive indicators
- Commit: `feat(drawer): add error states and improve accessibility`

---

### Sprint 3: Test Suite Cleanup (1-2 hours)

**Goal:** Increase pass rate from ~93% to 95%+

| Order | Task | Effort | Cumulative Pass Rate |
|-------|------|--------|---------------------|
| 9 | TASK-009 | 30 min | 94.8% (false failures removed) |
| 10 | TASK-010 | 15 min | 95.2% |
| 11 | TASK-011 | 5 min | N/A (config) |
| 12 | TASK-012 | 15 min | 95.6% |

**Deliverables:**
- Clean test suite
- Optimized test configuration
- Commit: `chore(e2e): optimize test suite and add device guards`

---

## Files to Modify Summary

### Component Files

| File | Tasks |
|------|-------|
| `src/app/hero/drawer-sections/saved/saved.component.ts` | TASK-001 |
| `src/app/hero/drawer-sections/account/account.component.ts` | TASK-002 |
| `src/app/hero/drawer-sections/pet-register/pet-register.component.ts` | TASK-003 |
| `src/app/shared/components/bottom-tab-bar/bottom-tab-bar.component.ts` | TASK-004 |
| `src/app/hero/drawer-sections/activity/activity.component.html` | TASK-005 |
| `src/app/hero/drawer-sections/notifications/notifications.component.html` | TASK-005 |
| `src/app/hero/drawer-sections/saved/saved.component.html` | TASK-005 |
| `src/app/shared/components/drawer/drawer.component.scss` | TASK-006, TASK-008 |
| `src/app/shared/components/drawer/drawer.component.ts` | TASK-007 |
| `src/styles/global.scss` | TASK-010, TASK-012 |

### Test/Config Files

| File | Tasks |
|------|-------|
| `e2e/tests/drawer-menu.spec.ts` | TASK-009 |
| `e2e/playwright.config.ts` | TASK-011 |

---

## Verification Commands

After each sprint, run:

```bash
# Quick validation (single device)
cd e2e && MOCK_API=true npx playwright test drawer-menu.spec.ts --project=drawer-mobile --workers=4

# Full validation (all 8 devices)
cd e2e && MOCK_API=true npx playwright test drawer-menu.spec.ts --workers=auto

# Generate updated report
npx playwright test --reporter=html
```

---

## Success Criteria

| Metric | Current | Sprint 1 | Sprint 2 | Sprint 3 |
|--------|---------|----------|----------|----------|
| Pass Rate | 75.9% | 86% | 93% | 95%+ |
| P1 Issues | 4 | 0 | 0 | 0 |
| P2 Issues | 5 | 5 | 0 | 0 |
| P3 Issues | 4 | 4 | 4 | 0 |

---

## Notes

### For Claude Code Agents

When implementing these tasks:
1. Start with TASK-001, 002, 003 (5 min each, high impact)
2. TASK-004 requires understanding of routing logic
3. TASK-005 may need a shared error-state component
4. TASK-009 requires careful test.skip() conditions

### For Human Review

After Sprint 1:
- Verify tab bar behavior is intentional
- Confirm which pages should hide tab bar
- Review error state UI design

---

*Backlog generated by T4 Aggregation Agent*
*Based on 1,760 test results across 8 devices*
