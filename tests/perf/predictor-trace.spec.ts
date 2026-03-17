import { test } from '@playwright/test';

test('Predictor Performance Trace', async ({ page, context }) => {
  // 1. Setup tracing
  await context.tracing.start({ screenshots: true, snapshots: true });

  // 2. Navigate to high-load predictor state
  await page.goto('http://localhost:3000/predictor');
  
  // Enter a rank to trigger full data load
  const rankInput = page.getByPlaceholder(/Enter your rank/i);
  await rankInput.fill('15000');
  await page.keyboard.press('Enter');

  // Wait for results
  await page.waitForSelector('.college-card, .results-table');

  // 3. Stress Test: Filter Typing
  // We'll type "Jadavpur" into the institute search one char at a time to measure INP
  const instituteSearch = page.getByPlaceholder(/Search institutes/i);
  await instituteSearch.click();
  
  const startTime = Date.now();
  await page.keyboard.type('Jadavpur University', { delay: 100 });
  const endTime = Date.now();

  console.log(`⏱️ Filtering interaction time: ${endTime - startTime}ms`);

  // 4. Stress Test: Favorite Toggle
  const favoriteButton = page.locator('button[aria-label*="favorites"]').first();
  await favoriteButton.click();
  await favoriteButton.click(); // Toggle back and forth

  // 5. Complete trace
  await context.tracing.stop({ path: 'reports/predictor-performance-trace.zip' });
});
