# T1 STANDARD DEVICES TEST REPORT
## Drawer Menu E2E Tests - Mobile, Tablet, Desktop

**Test Execution Date:** 2025-12-13
**Duration:** 607.58 seconds (10.13 minutes)
**Projects:** drawer-mobile, drawer-tablet, drawer-desktop
**Workers:** 4 parallel workers

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Tests | 660 |
| Passed | 501 (75.9%) |
| Failed | 159 (24.1%) |
| Skipped | 0 |
| Flaky | 0 |

### Test Status by Device

| Device | Viewport | Passed | Failed | Pass Rate |
|--------|----------|--------|--------|-----------|
| Mobile | 375x667 | 167 | 53 | 75.9% |
| Tablet | 768x1024 | 167 | 53 | 75.9% |
| Desktop | 1440x900 | 167 | 53 | 75.9% |

---

## Failure Analysis

### Failures by Category

| Category | Total | Mobile | Tablet | Desktop | Issue |
|----------|-------|--------|--------|---------|-------|
| Bottom Tab Bar | 27 | 9 | 9 | 9 | Tab bar not hiding on secondary pages |
| Responsive Display | 21 | 7 | 7 | 7 | CSS selectors mismatch |
| Foldable Display | 18 | 6 | 6 | 6 | Tests expect foldable behavior on non-foldable devices |
| Device-specific | 18 | 6 | 6 | 6 | iPhone/Honor Magic tests running on wrong device |
| Performance | 9 | 3 | 3 | 3 | Pages not loading within 3s timeout |
| Error Handling | 9 | 3 | 3 | 3 | Error state classes not found |
| Navigation | 6 | 2 | 2 | 2 | Back navigation selector issues |
| Page Rendering | 3 | 1 | 1 | 1 | `.saved-page` class missing |
| Other | 48 | 16 | 16 | 16 | Various selector/timing issues |

---

## Root Cause Analysis

### 1. Bottom Tab Bar Issues (27 failures)
**Tests affected:** `should not have bottom tab bar on [Page]`

**Problem:** The bottom tab bar (`tablist "Main navigation"`) remains visible when navigating to secondary pages from the drawer menu.

**Expected behavior:** Tab bar should hide on pages like Account, Activity, Saved, etc.

**Screenshots:** See `screenshots/t1/*-bottom-tab-bar-*`

---

### 2. Responsive Display Issues (21 failures)
**Tests affected:** `should display correctly on mobile/tablet/desktop`

**Problem:** CSS class selectors for responsive breakpoints not matching. Tests look for:
- `.drawer-mobile-layout`
- `.drawer-tablet-layout`
- `.drawer-desktop-layout`

But actual CSS uses different class names or media queries.

**Fix needed:** Align test selectors with actual component CSS or add data-testid attributes.

---

### 3. Foldable/Device-Specific Issues (36 failures)
**Tests affected:**
- `should display correctly when folded/unfolded`
- `should display correctly on Honor Magic/iPhone 2025`

**Problem:** These tests are designed for specific device configurations but are running on all device projects (mobile, tablet, desktop).

**Recommendation:**
- Skip foldable tests on non-foldable projects
- Add device detection guards or test filtering

---

### 4. Performance Timeouts (9 failures)
**Tests affected:** `[Page] should load within 3 seconds`

**Pages failing:**
- Account
- Saved

**Problem:** Pages not rendering expected selector within 3000ms timeout.

**Root cause:** Missing CSS classes (`.account-page`, `.saved-page`) rather than actual performance issue.

---

### 5. Page Rendering Issues (3 failures)
**Tests affected:** `should render Saved page correctly`

**Problem:** Test expects `.saved-page` but:
- Menu item is "Preferiti" (Italian)
- Page may use different class name or no class

**Evidence from error-context.md:**
```yaml
button "Preferiti" [ref=e79]
```

---

## Failed Test Details

### Mobile Failures (53)

| Test Category | Count | Primary Issue |
|---------------|-------|---------------|
| Bottom tab bar | 9 | Tab bar visible on secondary pages |
| Display responsive | 7 | Missing CSS selectors |
| Foldable | 6 | Wrong device type |
| Device-specific | 6 | iPhone/Honor tests on mobile |
| Performance | 3 | Timeout on Account/Saved |
| Error handling | 3 | Missing error state classes |
| Navigation | 2 | Back button selectors |
| Page rendering | 1 | Missing .saved-page |
| Other | 16 | Various |

### Tablet Failures (53)
*Same distribution as mobile - indicates systematic issues not device-specific*

### Desktop Failures (53)
*Same distribution as mobile - confirms selector/class issues are universal*

---

## Key Findings

### 1. Symmetric Failure Pattern
All 3 device types have exactly 53 failures each. This indicates:
- Issues are NOT device-responsive-specific
- Root causes are missing CSS classes/selectors
- Tests designed for one device type running on all

### 2. Critical Missing Elements
The following selectors are not found:
- `.saved-page`
- `.account-page`
- `.drawer-mobile-layout` / `.drawer-tablet-layout` / `.drawer-desktop-layout`
- Device-specific breakpoint indicators

### 3. Test Design Issues
- Foldable tests should not run on standard devices
- Device-specific tests (iPhone, Honor Magic) are running on wrong projects
- Some tests check for CSS classes that don't exist in implementation

---

## Recommendations

### Immediate Fixes (P0)

1. **Add missing page classes:**
   ```scss
   // saved.component.scss
   :host { @extend .saved-page; }

   // account.component.scss
   :host { @extend .account-page; }
   ```

2. **Filter device-specific tests:**
   ```typescript
   test.skip(({ viewport }) => viewport.width < 768, 'Desktop only');
   ```

3. **Increase performance timeouts:**
   ```typescript
   await expect(pageLocator).toBeVisible({ timeout: 5000 });
   ```

### Short-term Fixes (P1)

4. **Add data-testid attributes** to critical elements
5. **Hide tab bar on secondary pages** (if intended behavior)
6. **Skip foldable tests on non-foldable projects**

### Long-term Improvements (P2)

7. Create device-aware test configurations
8. Add visual regression baselines
9. Implement page object model for selectors

---

## Test Execution Metrics

| Metric | Value |
|--------|-------|
| Start Time | 2025-12-13T12:55:47.075Z |
| End Time | 2025-12-13T13:05:54.650Z |
| Total Duration | 607.58s |
| Avg per test | 0.92s |
| Max workers used | 4 |

---

## Screenshots Location

All 159 failure screenshots saved to:
```
e2e/reports/drawer-menu/screenshots/t1/
```

### Screenshot Naming Convention
`drawer-menu-Drawer-Menu-Co-[hash]-[test-description]-drawer-[device].png`

### Example Files
- `drawer-menu-Drawer-Menu-Co-a9982-ave-bottom-tab-bar-on-Saved-drawer-mobile.png`
- `drawer-menu-Drawer-Menu-Co-af2cc-render-Saved-page-correctly-drawer-desktop.png`
- `drawer-menu-Performance-Saved-should-load-within-3-seconds-drawer-mobile.png`

---

## JSON Results

Full JSON results available at:
```
e2e/test-results/t1-standard-output.log
e2e/playwright-report/index.html
```

---

## Next Steps

1. Review this report with development team
2. Prioritize P0 fixes
3. Run T2/T3 tests on foldable devices separately
4. Update test suite with proper device guards
5. Create baseline screenshots for visual regression

---

*Report generated by T1 Standard Device Test Runner*
*For aggregation with T2/T3/T4 reports*
