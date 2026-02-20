import { test, Page } from '@playwright/test';

/**
 * Drawer Pages Spacing Audit
 *
 * Takes screenshots of all drawer pages to verify
 * header/content spacing. Run with:
 *   npx playwright test tests/drawer/spacing-audit --project=mobile-chrome --headed
 */

const DRAWER_PAGES = [
  { name: 'activity', path: '/home/activity' },
  { name: 'notifications', path: '/home/notifications' },
  { name: 'favorites', path: '/home/favorites' },
  { name: 'adopt', path: '/home/adopt' },
  { name: 'friends', path: '/home/friends' },
  { name: 'invite', path: '/home/invite' },
  { name: 'lost-pets', path: '/home/lost-pets' },
  { name: 'blocked', path: '/home/blocked' },
  { name: 'terms', path: '/home/terms' },
  { name: 'subscriptions', path: '/home/subscriptions' },
  { name: 'contact', path: '/home/contact' },
  { name: 'privacy', path: '/home/privacy' },
  { name: 'account', path: '/home/account' },
];

async function measureHeaderSpacing(page: Page) {
  return page.evaluate(() => {
    const blueHeader = document.querySelector('.shell-blue-header') as HTMLElement;
    const shellContent = document.querySelector('.shell-content') as HTMLElement;
    const stickyYellow = document.querySelector('.shell-sticky-yellow') as HTMLElement;

    const headerRect = blueHeader?.getBoundingClientRect();
    const contentRect = shellContent?.getBoundingClientRect();
    const stickyRect = stickyYellow?.getBoundingClientRect();

    // Find the first visible child inside shell-content
    let firstContentChild: HTMLElement | null = null;
    if (shellContent) {
      for (const child of Array.from(shellContent.children)) {
        const el = child as HTMLElement;
        if (el.offsetHeight > 0) {
          firstContentChild = el;
          break;
        }
      }
    }
    const firstChildRect = firstContentChild?.getBoundingClientRect();

    return {
      headerHeight: headerRect?.height ?? 0,
      headerBottom: headerRect?.bottom ?? 0,
      contentTop: contentRect?.top ?? 0,
      stickyHeight: stickyRect?.height ?? 0,
      stickyDisplay: stickyYellow ? getComputedStyle(stickyYellow).display : 'n/a',
      firstChildTop: firstChildRect?.top ?? 0,
      gapHeaderToContent: (contentRect?.top ?? 0) - (headerRect?.bottom ?? 0),
      gapHeaderToFirstChild: (firstChildRect?.top ?? 0) - (headerRect?.bottom ?? 0),
      viewportHeight: window.innerHeight,
      headerCSSHeight: blueHeader ? getComputedStyle(blueHeader).height : 'n/a',
    };
  });
}

test.describe('Drawer Pages - Spacing Audit', () => {
  for (const { name, path } of DRAWER_PAGES) {
    test(`Screenshot & measure: ${name}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      // Wait for Angular rendering
      await page.waitForTimeout(1000);

      // Measure spacing
      const spacing = await measureHeaderSpacing(page);
      console.log(`\n=== ${name.toUpperCase()} ===`);
      console.log(`  Header height:        ${spacing.headerHeight}px`);
      console.log(`  Header CSS height:    ${spacing.headerCSSHeight}`);
      console.log(`  Sticky yellow height: ${spacing.stickyHeight}px (display: ${spacing.stickyDisplay})`);
      console.log(`  Content top:          ${spacing.contentTop}px`);
      console.log(`  First child top:      ${spacing.firstChildTop}px`);
      console.log(`  Gap header→content:   ${spacing.gapHeaderToContent}px`);
      console.log(`  Gap header→1st child: ${spacing.gapHeaderToFirstChild}px`);
      console.log(`  Viewport height:      ${spacing.viewportHeight}px`);

      // Take full page screenshot
      await page.screenshot({
        path: `e2e/test-results/spacing-audit/${name}.png`,
        fullPage: false,
      });
    });
  }
});
