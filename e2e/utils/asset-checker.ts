import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface ImageAsset {
  src: string | null;
  loaded: boolean;
  missing: boolean;
  naturalWidth: number;
  naturalHeight: number;
}

export interface SvgAsset {
  id: string | null;
  visible: boolean;
  hasContent: boolean;
  viewBox: string | null;
}

export interface BackgroundAsset {
  selector: string;
  backgroundImage: string;
  loaded: boolean;
}

export interface ConsoleError {
  type: string;
  message: string;
  url?: string;
}

export interface AssetReport {
  url: string;
  route: string;
  timestamp: string;
  images: ImageAsset[];
  svgs: SvgAsset[];
  backgrounds: BackgroundAsset[];
  consoleErrors: ConsoleError[];
  networkErrors: string[];
  missingAssets: string[];
  summary: {
    totalImages: number;
    loadedImages: number;
    missingImages: number;
    totalSvgs: number;
    visibleSvgs: number;
    totalBackgrounds: number;
    loadedBackgrounds: number;
    consoleErrorCount: number;
    networkErrorCount: number;
    status: 'OK' | 'WARNING' | 'ERROR';
  };
}

export interface FullAuditReport {
  generatedAt: string;
  totalScreens: number;
  screensOk: number;
  screensWarning: number;
  screensError: number;
  screens: AssetReport[];
  allMissingAssets: string[];
}

/**
 * Check all assets on a page and return a detailed report
 */
export async function checkPageAssets(page: Page, route: string): Promise<AssetReport> {
  const consoleErrors: ConsoleError[] = [];
  const networkErrors: string[] = [];

  // Setup console error listener
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({
        type: msg.type(),
        message: msg.text(),
        url: page.url()
      });
    }
  });

  // Setup network error listener for 404s
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()} - ${response.url()}`);
    }
  });

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Check all images
  const images: ImageAsset[] = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.map(img => ({
      src: img.getAttribute('src'),
      loaded: img.complete && img.naturalWidth > 0,
      missing: !img.complete || img.naturalWidth === 0,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight
    }));
  });

  // Check all SVGs
  const svgs: SvgAsset[] = await page.evaluate(() => {
    const svgElements = Array.from(document.querySelectorAll('svg'));
    return svgElements.map((svg, index) => ({
      id: svg.id || `svg-${index}`,
      visible: svg.getBoundingClientRect().width > 0 && svg.getBoundingClientRect().height > 0,
      hasContent: svg.innerHTML.trim().length > 0,
      viewBox: svg.getAttribute('viewBox')
    }));
  });

  // Check background images
  const backgrounds: BackgroundAsset[] = await page.evaluate(() => {
    const elementsWithBg: BackgroundAsset[] = [];
    const allElements = document.querySelectorAll('*');

    allElements.forEach((el, index) => {
      const style = window.getComputedStyle(el);
      const bgImage = style.backgroundImage;

      if (bgImage && bgImage !== 'none') {
        elementsWithBg.push({
          selector: el.tagName.toLowerCase() + (el.className ? '.' + el.className.toString().split(' ').join('.') : ''),
          backgroundImage: bgImage,
          loaded: true // We assume it's loaded if computed style returns it
        });
      }
    });

    return elementsWithBg.slice(0, 20); // Limit to first 20 to avoid huge reports
  });

  // Identify missing assets
  const missingAssets: string[] = [];

  images.filter(img => img.missing && img.src).forEach(img => {
    missingAssets.push(`IMAGE: ${img.src}`);
  });

  networkErrors.filter(err => err.includes('404')).forEach(err => {
    missingAssets.push(`404: ${err}`);
  });

  // Calculate summary
  const totalImages = images.length;
  const loadedImages = images.filter(img => img.loaded).length;
  const missingImages = images.filter(img => img.missing).length;
  const totalSvgs = svgs.length;
  const visibleSvgs = svgs.filter(svg => svg.visible && svg.hasContent).length;
  const totalBackgrounds = backgrounds.length;
  const loadedBackgrounds = backgrounds.filter(bg => bg.loaded).length;

  // Determine status
  let status: 'OK' | 'WARNING' | 'ERROR' = 'OK';
  if (missingImages > 0 || networkErrors.length > 0) {
    status = 'ERROR';
  } else if (consoleErrors.length > 0) {
    status = 'WARNING';
  }

  return {
    url: page.url(),
    route,
    timestamp: new Date().toISOString(),
    images,
    svgs,
    backgrounds,
    consoleErrors,
    networkErrors,
    missingAssets,
    summary: {
      totalImages,
      loadedImages,
      missingImages,
      totalSvgs,
      visibleSvgs,
      totalBackgrounds,
      loadedBackgrounds,
      consoleErrorCount: consoleErrors.length,
      networkErrorCount: networkErrors.length,
      status
    }
  };
}

/**
 * Save screenshot for a page
 */
export async function saveScreenshot(page: Page, route: string, outputDir: string): Promise<string> {
  const sanitizedRoute = route.replace(/\//g, '_').replace(/^_/, '') || 'home';
  const filename = `${sanitizedRoute}.png`;
  const filepath = path.join(outputDir, filename);

  await page.screenshot({
    path: filepath,
    fullPage: true
  });

  return filepath;
}

/**
 * Generate full audit report
 */
export function generateFullReport(reports: AssetReport[]): FullAuditReport {
  const allMissingAssets = new Set<string>();

  reports.forEach(report => {
    report.missingAssets.forEach(asset => allMissingAssets.add(asset));
  });

  return {
    generatedAt: new Date().toISOString(),
    totalScreens: reports.length,
    screensOk: reports.filter(r => r.summary.status === 'OK').length,
    screensWarning: reports.filter(r => r.summary.status === 'WARNING').length,
    screensError: reports.filter(r => r.summary.status === 'ERROR').length,
    screens: reports,
    allMissingAssets: Array.from(allMissingAssets)
  };
}

/**
 * Save report to JSON file
 */
export function saveReportToFile(report: FullAuditReport, outputPath: string): void {
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
}

/**
 * Print report summary to console
 */
export function printReportSummary(report: FullAuditReport): void {
  console.log('\n========================================');
  console.log('       ASSET AUDIT REPORT SUMMARY       ');
  console.log('========================================\n');
  console.log(`Generated: ${report.generatedAt}`);
  console.log(`Total Screens: ${report.totalScreens}`);
  console.log(`  - OK: ${report.screensOk}`);
  console.log(`  - Warning: ${report.screensWarning}`);
  console.log(`  - Error: ${report.screensError}`);

  if (report.allMissingAssets.length > 0) {
    console.log('\n--- MISSING ASSETS ---');
    report.allMissingAssets.forEach(asset => {
      console.log(`  - ${asset}`);
    });
  }

  console.log('\n--- PER-SCREEN DETAILS ---');
  report.screens.forEach(screen => {
    const statusIcon = screen.summary.status === 'OK' ? '✅' :
                       screen.summary.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`${statusIcon} ${screen.route}`);
    console.log(`   Images: ${screen.summary.loadedImages}/${screen.summary.totalImages}`);
    console.log(`   SVGs: ${screen.summary.visibleSvgs}/${screen.summary.totalSvgs}`);
    if (screen.summary.networkErrorCount > 0) {
      console.log(`   Network Errors: ${screen.summary.networkErrorCount}`);
    }
  });

  console.log('\n========================================\n');
}
