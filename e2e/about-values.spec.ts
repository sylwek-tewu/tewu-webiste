import { test, expect } from '@playwright/test';
import { localizePath } from '../src/i18n/config';
import { plTranslations } from '../src/i18n/pl';
import { ukTranslations } from '../src/i18n/uk';
import { PATHS } from '../src/lib/paths';

// The values under the about page's intro are a check icon and a one-word label. The label must stay
// beside its icon at every width; jsdom does no layout, so this runs in a browser.

// Phones (where two columns are too narrow for „Bezpieczeństwo” or „Професіоналізм”), the first
// width with two columns (xs, 576 px), and the photo beside the text from lg (1200 px).
const WIDTHS = [320, 360, 390, 400, 430, 575, 576, 768, 1199, 1200, 1280];

for (const t of [plTranslations, ukTranslations]) {
  const path = localizePath(PATHS.about, t.locale);
  test(`each value label sits beside its check icon: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    const intro = page.locator('section', { has: page.getByRole('heading', { name: t.about.intro.title }) });
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      for (const value of t.about.intro.bullets) {
        const label = intro.getByText(value, { exact: true });
        const icon = label.locator('xpath=preceding-sibling::*[1]');
        const [l, i] = await Promise.all([label.boundingBox(), icon.boundingBox()]);
        expect(l && i, `${value}: label or icon not found`).toBeTruthy();
        const beside = l!.x >= i!.x + i!.width && Math.abs(l!.y + l!.height / 2 - (i!.y + i!.height / 2)) <= 1;
        expect.soft(beside, `${path} @${width}px: „${value}” is not beside its icon`).toBe(true);
      }
    }
  });
}
