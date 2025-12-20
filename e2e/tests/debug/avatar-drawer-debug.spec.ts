import { test, expect } from '@playwright/test';

/**
 * Diagnostic E2E Test for Avatar Button & Drawer
 *
 * This test investigates why:
 * 1. Avatar doesn't show image
 * 2. Avatar is not clickable
 * 3. Hamburger menu appears instead of avatar
 * 4. Drawer only opens after clicking "Esci" (logout)
 */

test.describe('Avatar Button & Drawer Debug', () => {

  test.beforeEach(async ({ page }) => {
    // Capture all console messages
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        console.log(`[${type.toUpperCase()}] ${msg.text()}`);
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      console.log(`[PAGE ERROR] ${error.message}`);
    });
  });

  test('diagnose avatar and drawer on /home/main', async ({ page }) => {
    // Step 1: Setup auth mock with CORRECT localStorage keys
    await page.addInitScript(() => {
      // Create a valid mock JWT token with future expiration
      // JWT format: header.payload.signature
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        sub: 'debug-user-id',
        email: 'debug@fiutami.pet',
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
        iat: Math.floor(Date.now() / 1000)
      }));
      const signature = 'mock-signature-for-testing';
      const mockToken = `${header}.${payload}.${signature}`;

      // Use CORRECT keys as defined in AuthService
      localStorage.setItem('fiutami_access_token', mockToken);
      localStorage.setItem('fiutami_refresh_token', mockToken);
      localStorage.setItem('fiutami_user', JSON.stringify({
        id: 'debug-user-id',
        email: 'debug@fiutami.pet',
        firstName: 'Debug',
        lastName: 'User'
      }));
    });

    // Step 2: Navigate to /home/main
    console.log('\n=== NAVIGATING TO /home/main ===');
    await page.goto('/home/main');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Extra wait for Angular

    // Step 3: Take screenshot before any action
    await page.screenshot({ path: 'e2e/screenshots/debug-01-before-click.png', fullPage: true });
    console.log('Screenshot saved: debug-01-before-click.png');

    // Step 4: Find all potential avatar/menu elements
    console.log('\n=== SEARCHING FOR AVATAR/MENU ELEMENTS ===');

    const selectors = [
      // Current implementation (should exist)
      { name: 'app-avatar-button', selector: 'app-avatar-button' },
      { name: '.avatar-button', selector: '.avatar-button' },
      { name: '.home__avatar-btn', selector: '.home__avatar-btn' },
      { name: '.avatar-button__initials', selector: '.avatar-button__initials' },
      { name: '.avatar-button__image', selector: '.avatar-button__image' },
      { name: '.avatar-button__placeholder', selector: '.avatar-button__placeholder' },

      // Old implementation (should NOT exist)
      { name: '.home__avatar (OLD)', selector: '.home__avatar' },
      { name: '.home__avatar-initials (OLD)', selector: '.home__avatar-initials' },
      { name: '.home__menu-avatar (OLD)', selector: '.home__menu-avatar' },
      { name: '.home__menu-avatar-initials (OLD)', selector: '.home__menu-avatar-initials' },

      // Hamburger patterns (should NOT exist on home)
      { name: '.hamburger', selector: '.hamburger' },
      { name: '.menu-btn', selector: '.menu-btn' },
      { name: '.home__menu-btn', selector: '.home__menu-btn' },

      // Header area
      { name: '.home__header', selector: '.home__header' },
      { name: '.home__header-actions', selector: '.home__header-actions' },

      // Drawer
      { name: '.drawer', selector: '.drawer' },
      { name: '.drawer-backdrop', selector: '.drawer-backdrop' },
      { name: 'aside[role=dialog]', selector: 'aside[role="dialog"]' },
    ];

    for (const { name, selector } of selectors) {
      const element = page.locator(selector);
      const count = await element.count();
      const isVisible = count > 0 ? await element.first().isVisible().catch(() => false) : false;
      console.log(`${name}: count=${count}, visible=${isVisible}`);
    }

    // Step 5: Get CSS properties of avatar button if it exists
    console.log('\n=== CSS PROPERTIES OF AVATAR ELEMENTS ===');

    const avatarButton = page.locator('.avatar-button');
    if (await avatarButton.count() > 0) {
      const styles = await avatarButton.first().evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          pointerEvents: computed.pointerEvents,
          zIndex: computed.zIndex,
          position: computed.position,
          width: computed.width,
          height: computed.height,
          cursor: computed.cursor,
        };
      });
      console.log('.avatar-button CSS:', JSON.stringify(styles, null, 2));
    } else {
      console.log('.avatar-button NOT FOUND in DOM');
    }

    // Check for blocking overlays
    console.log('\n=== CHECKING FOR BLOCKING OVERLAYS ===');
    const potentialBlockers = await page.evaluate(() => {
      const blockersList: string[] = [];
      const allElements = document.querySelectorAll('*');

      allElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const zIndex = parseInt(style.zIndex) || 0;

        if (zIndex > 100 && style.position !== 'static') {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            blockersList.push(`${el.tagName}.${el.className} z-index:${zIndex} pos:${style.position}`);
          }
        }
      });

      return blockersList;
    });
    console.log('High z-index elements:', potentialBlockers);

    // Step 6: Try clicking avatar button
    console.log('\n=== ATTEMPTING TO CLICK AVATAR ===');

    // Try multiple selectors
    const clickSelectors = [
      'app-avatar-button .avatar-button',
      '.avatar-button',
      '.home__avatar-btn button',
      '.home__header-actions button',
    ];

    let clickedSuccessfully = false;
    for (const selector of clickSelectors) {
      const el = page.locator(selector);
      if (await el.count() > 0 && await el.first().isVisible()) {
        console.log(`Clicking: ${selector}`);
        try {
          await el.first().click({ timeout: 3000 });
          clickedSuccessfully = true;
          console.log(`Click successful on: ${selector}`);
          break;
        } catch (e) {
          console.log(`Click failed on ${selector}: ${(e as Error).message}`);
        }
      }
    }

    if (!clickedSuccessfully) {
      console.log('WARNING: Could not click any avatar element!');
    }

    // Wait for drawer animation
    await page.waitForTimeout(500);

    // Step 7: Check if drawer opened
    console.log('\n=== CHECKING DRAWER STATE ===');

    const drawer = page.locator('.drawer');
    const drawerVisible = await drawer.isVisible().catch(() => false);
    console.log(`Drawer visible: ${drawerVisible}`);

    const drawerTransform = await drawer.evaluate(el => {
      return window.getComputedStyle(el).transform;
    }).catch(() => 'not found');
    console.log(`Drawer transform: ${drawerTransform}`);

    // Take screenshot after click
    await page.screenshot({ path: 'e2e/screenshots/debug-02-after-click.png', fullPage: true });
    console.log('Screenshot saved: debug-02-after-click.png');

    // Step 8: Log full header HTML for inspection
    console.log('\n=== HEADER HTML STRUCTURE ===');
    const headerHtml = await page.locator('.home__header').innerHTML().catch(() => 'not found');
    console.log(headerHtml.substring(0, 1000)); // First 1000 chars

    // Step 9: Final assertions
    console.log('\n=== FINAL DIAGNOSTIC SUMMARY ===');

    // This test is diagnostic, so we make it always pass but log everything
    expect(true).toBe(true);
  });

  test('check all pages with avatar button', async ({ page }) => {
    // Setup auth with CORRECT localStorage keys
    await page.addInitScript(() => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        sub: 'test-user',
        email: 'test@fiutami.pet',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      }));
      const mockToken = `${header}.${payload}.mock-sig`;

      localStorage.setItem('fiutami_access_token', mockToken);
      localStorage.setItem('fiutami_refresh_token', mockToken);
      localStorage.setItem('fiutami_user', JSON.stringify({
        id: 'test-user',
        email: 'test@fiutami.pet',
        firstName: 'Test',
        lastName: 'User'
      }));
    });

    const pages = [
      { name: 'Home', url: '/home/main' },
      { name: 'Map', url: '/home/map' },
      { name: 'Breeds', url: '/home/breeds' },
    ];

    for (const { name, url } of pages) {
      console.log(`\n=== Testing ${name} (${url}) ===`);
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Check for avatar button
      const avatarBtn = page.locator('.avatar-button');
      const count = await avatarBtn.count();
      const visible = count > 0 ? await avatarBtn.first().isVisible() : false;

      console.log(`${name}: avatar-button count=${count}, visible=${visible}`);

      if (visible) {
        await avatarBtn.first().click();
        await page.waitForTimeout(300);

        const drawerOpen = await page.locator('.drawer').isVisible();
        console.log(`${name}: drawer opened=${drawerOpen}`);

        // Close drawer for next test
        if (drawerOpen) {
          await page.locator('.drawer-backdrop').click();
          await page.waitForTimeout(300);
        }
      }

      await page.screenshot({
        path: `e2e/screenshots/debug-${name.toLowerCase()}.png`,
        fullPage: true
      });
    }
  });
});
