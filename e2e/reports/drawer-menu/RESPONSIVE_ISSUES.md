# RESPONSIVE ISSUES - Drawer Menu E2E Tests
## Prioritized Issue List (P1/P2/P3)

**Report Date:** 2025-12-13
**Total Issues Identified:** 12 distinct categories
**Total Test Failures:** 424 across 8 devices

---

## P1 - Critical (Bloccanti per Release)

### P1-001: Missing `.saved-page` CSS Class
| Attribute | Value |
|-----------|-------|
| **ID** | P1-001 |
| **Severity** | Critical |
| **Tests Affected** | ~24 (3 per device) |
| **Devices Affected** | All 8 |
| **Component** | `saved.component.ts` |
| **Error** | `locator('.saved-page').toBeVisible()` failed |

**Description:**
The Saved (Preferiti) page component does not have the `.saved-page` CSS class that tests expect.

**Screenshot Reference:**
- `screenshots/t1/drawer-menu-*-Saved-page-*.png`

**Fix Suggerito:**
```typescript
// saved.component.ts
@Component({
  selector: 'app-saved',
  host: { 'class': 'saved-page' }, // ADD THIS
  templateUrl: './saved.component.html'
})
```

---

### P1-002: Missing `.account-page` CSS Class
| Attribute | Value |
|-----------|-------|
| **ID** | P1-002 |
| **Severity** | Critical |
| **Tests Affected** | ~24 (3 per device) |
| **Devices Affected** | All 8 |
| **Component** | `account.component.ts` |
| **Error** | `locator('.account-page').toBeVisible()` failed |

**Description:**
The Account page component does not have the `.account-page` CSS class.

**Screenshot Reference:**
- `screenshots/t1/drawer-menu-*-Account-page-*.png`

**Fix Suggerito:**
```typescript
// account.component.ts
@Component({
  selector: 'app-account',
  host: { 'class': 'account-page' }, // ADD THIS
  templateUrl: './account.component.html'
})
```

---

### P1-003: Missing `.pet-register-page` CSS Class
| Attribute | Value |
|-----------|-------|
| **ID** | P1-003 |
| **Severity** | Critical |
| **Tests Affected** | ~24 (3 per device) |
| **Devices Affected** | All 8 |
| **Component** | `pet-register.component.ts` |
| **Error** | `locator('.pet-register-page').toBeVisible()` failed |

**Description:**
The Pet Register page component does not have the `.pet-register-page` CSS class.

**Fix Suggerito:**
```typescript
// pet-register.component.ts
@Component({
  selector: 'app-pet-register',
  host: { 'class': 'pet-register-page' }, // ADD THIS
  templateUrl: './pet-register.component.html'
})
```

---

### P1-004: Bottom Tab Bar Not Hidden on Secondary Pages
| Attribute | Value |
|-----------|-------|
| **ID** | P1-004 |
| **Severity** | Critical |
| **Tests Affected** | ~108 (27 per T1, 27 per T2, 54 per T3) |
| **Devices Affected** | All 8 |
| **Component** | `bottom-tab-bar.component.ts` / Router logic |
| **Error** | `should not have bottom tab bar on [Page]` |

**Description:**
When navigating to drawer menu pages (Account, Activity, Saved, etc.), the bottom tab bar should hide but remains visible (or vice versa on Honor Magic).

**Expected Behavior:**
- Tab bar visible on main pages (Home, Search, etc.)
- Tab bar hidden on drawer secondary pages

**Fix Suggerito:**
```typescript
// bottom-tab-bar.component.ts
@Input() hideOnRoutes: string[] = [
  '/user/account',
  '/user/activity',
  '/favorites',
  '/adopt',
  '/friends',
  // ... all drawer routes
];
```

---

## P2 - Important (Importanti per UX)

### P2-001: Performance Timeout on Account/Saved
| Attribute | Value |
|-----------|-------|
| **ID** | P2-001 |
| **Severity** | High |
| **Tests Affected** | ~36 |
| **Devices Affected** | All 8 |
| **Test** | `[Page] should load within 3 seconds` |
| **Error** | Timeout waiting for selector |

**Description:**
Account and Saved pages fail performance tests because the expected selector (`.account-page`, `.saved-page`) is not found within 3 seconds. This is a secondary effect of P1-001 and P1-002.

**Root Cause:** Missing CSS classes, not actual performance issue.

**Fix:** Resolve P1-001 and P1-002 first.

---

### P2-002: Error States Not Implemented
| Attribute | Value |
|-----------|-------|
| **ID** | P2-002 |
| **Severity** | High |
| **Tests Affected** | ~24 |
| **Devices Affected** | All 8 |
| **Pages** | Activity, Notifications, Saved |
| **Error** | `should show error state on API failure` |

**Description:**
When API calls fail, no error UI is displayed. Tests expect an error state with retry button.

**Expected UI:**
- Error message visible
- Retry button available
- Error icon displayed

**Fix Suggerito:**
```html
<!-- activity.component.html -->
<div *ngIf="error" class="error-state">
  <mat-icon>error</mat-icon>
  <p>Unable to load activity</p>
  <button mat-button (click)="retry()">Retry</button>
</div>
```

---

### P2-003: Touch Target Size Too Small
| Attribute | Value |
|-----------|-------|
| **ID** | P2-003 |
| **Severity** | High |
| **Tests Affected** | ~16 |
| **Devices Affected** | All mobile/touch devices |
| **Component** | Back button in drawer header |
| **Error** | `Expected: >= 44, Received: 24` |

**Description:**
Back button is 24x24px but WCAG 2.1 requires minimum 44x44px for touch targets.

**Fix Suggerito:**
```scss
// drawer-header.component.scss
.drawer__back {
  min-width: 44px;
  min-height: 44px;
  padding: 10px; // (44-24)/2 = 10px padding around 24px icon
}
```

---

### P2-004: Responsive Layout Classes Missing
| Attribute | Value |
|-----------|-------|
| **ID** | P2-004 |
| **Severity** | Medium |
| **Tests Affected** | ~48 |
| **Devices Affected** | All 8 |
| **Test** | `should display correctly on mobile/tablet/desktop` |
| **Error** | `.drawer-mobile-layout` not found |

**Description:**
Tests expect breakpoint-specific CSS classes but implementation uses media queries instead.

**Options:**
1. Add data-testid attributes for breakpoints
2. Update tests to check computed styles instead of classes
3. Add breakpoint classes dynamically

**Fix Suggerito (Option 1):**
```html
<!-- drawer.component.html -->
<div class="drawer"
     [attr.data-viewport]="viewportSize"
     data-testid="drawer-container">
```

---

### P2-005: Back Button Outside Viewport (Foldable)
| Attribute | Value |
|-----------|-------|
| **ID** | P2-005 |
| **Severity** | Medium |
| **Tests Affected** | ~8 |
| **Devices Affected** | drawer-foldable-folded (717x512) |
| **Error** | `element is outside of the viewport` |

**Description:**
On foldable devices in folded mode (512px height), the back button may be positioned outside the visible viewport area.

**Fix Suggerito:**
```scss
// drawer.component.scss
@media (max-height: 600px) {
  .drawer__header {
    position: sticky;
    top: 0;
    z-index: 10;
  }
}
```

---

## P3 - Nice-to-have (Miglioramenti)

### P3-001: Device-Specific Tests on Wrong Devices
| Attribute | Value |
|-----------|-------|
| **ID** | P3-001 |
| **Severity** | Low |
| **Tests Affected** | ~72 |
| **Devices Affected** | Non-foldable devices |
| **Test** | `should display correctly when folded/unfolded` |
| **Error** | Test runs on mobile/tablet/desktop |

**Description:**
Foldable-specific tests are executed on all device projects, causing false failures.

**Fix Suggerito (Test File):**
```typescript
// drawer-menu.spec.ts
test('should display correctly when folded', async ({ page }, testInfo) => {
  // Skip on non-foldable projects
  test.skip(!testInfo.project.name.includes('foldable'), 'Foldable only');
  // ... test code
});
```

---

### P3-002: Desktop Max-Width Not Enforced
| Attribute | Value |
|-----------|-------|
| **ID** | P3-002 |
| **Severity** | Low |
| **Tests Affected** | ~24 |
| **Devices Affected** | Desktop, Foldable-unfolded |
| **Test** | `content should have max-width 1000px on desktop` |
| **Error** | `Expected: <= 1000, Received: 1440` |

**Description:**
On wide viewports (>1024px), content should be constrained to max 1000px for readability.

**Fix Suggerito:**
```scss
// drawer-section.component.scss
@media (min-width: 1024px) {
  .drawer-section__content {
    max-width: 1000px;
    margin: 0 auto;
  }
}
```

---

### P3-003: Honor Magic V5 Redundant Testing
| Attribute | Value |
|-----------|-------|
| **ID** | P3-003 |
| **Severity** | Low |
| **Tests Affected** | 220 |
| **Note** | Configuration optimization |

**Description:**
Honor Magic V3 and V5 have identical viewport (795x720) and produce identical results. Testing both is redundant.

**Recommendation:**
Remove `drawer-honor-magic-v5` project or combine into single `drawer-honor-magic` project.

---

### P3-004: iPhone 2025 Safe Area Handling
| Attribute | Value |
|-----------|-------|
| **ID** | P3-004 |
| **Severity** | Low |
| **Tests Affected** | ~8 |
| **Devices Affected** | drawer-iphone-2025 |
| **Test** | Safe area related tests |

**Description:**
Elements may be obscured by Dynamic Island or home indicator.

**Fix Suggerito:**
```scss
// global styles
.drawer {
  padding-top: max(16px, env(safe-area-inset-top));
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}
```

---

## Summary Table

| Priority | Issues | Tests Affected | Est. Fix Time |
|----------|--------|----------------|---------------|
| **P1** | 4 | ~180 | 2-4 hours |
| **P2** | 5 | ~132 | 4-8 hours |
| **P3** | 4 | ~112 | 2-4 hours |
| **Total** | 13 | 424 | 8-16 hours |

---

## Quick Wins

Fixing just the P1 issues (4 items) would:
- Resolve ~180 test failures (42% of all failures)
- Bring pass rate from 75.9% to ~86%
- Require only 2-4 hours of work

---

## Files to Modify

### Component Files
| File | Issues |
|------|--------|
| `src/app/hero/drawer-sections/saved/saved.component.ts` | P1-001 |
| `src/app/hero/drawer-sections/account/account.component.ts` | P1-002 |
| `src/app/hero/drawer-sections/pet-register/pet-register.component.ts` | P1-003 |
| `src/app/shared/components/bottom-tab-bar/bottom-tab-bar.component.ts` | P1-004 |
| `src/app/shared/components/drawer/drawer.component.scss` | P2-005 |

### Test Files
| File | Issues |
|------|--------|
| `e2e/tests/drawer-menu.spec.ts` | P3-001 |
| `e2e/playwright.config.ts` | P3-003 |

---

*Report generated by T4 Aggregation Agent*
*See NEXT_TASKS.md for sprint backlog*
