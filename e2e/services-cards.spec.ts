import { test, expect } from '@playwright/test';

// Cards on the services page that open a service page must look clickable. jsdom computes no styles,
// so the cursor is checked in a browser.

for (const path of ['/uslugi', '/uk/uslugi']) {
  test(`linked service cards show a pointer cursor: ${path}`, async ({ page }) => {
    await page.goto(path);
    const cards = page.locator('main a[href*="/uslugi/"]');
    expect(await cards.count()).toBeGreaterThan(0);
    const cursors = await cards.evaluateAll((els) => els.map((el) => getComputedStyle(el).cursor));
    expect(cursors.every((c) => c === 'pointer'), `cursors: ${cursors.join(', ')}`).toBe(true);
  });
}
