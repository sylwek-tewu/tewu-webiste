import { test, expect, type Page } from '@playwright/test';

// Layout guards from ADR 0004 §4: the header must stay on one row, no page may scroll sideways,
// and no button label may be cut off. jsdom cannot check any of this, so it runs in a browser.

const PAGES = [
  '/', '/uk',
  '/uslugi', '/uk/uslugi',
  '/uslugi/kpir', '/uk/uslugi/kpir',
  '/uslugi/inkubator-spolek', '/uk/uslugi/inkubator-spolek',
  '/o-nas', '/uk/o-nas',
  '/kontakt', '/uk/kontakt',
];

// Phones, the mobile bar's last width, the burger range, and the header's tight points
// (1200: full menu appears; 1408: the office name returns next to the logo).
const WIDTHS = [320, 360, 390, 430, 767, 1024, 1199, 1200, 1280, 1407, 1408, 1440, 1920];

// A weekday within office hours (8:00–16:00 Europe/Warsaw): the mobile bar shows the call button.
const OFFICE_OPEN = new Date('2026-10-06T10:00:00+02:00');

async function measure(page: Page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const visible = (el: Element) => (el as HTMLElement).offsetParent !== null;
    const clippedLabels = [...document.querySelectorAll('.mantine-Button-label')]
      .filter(visible)
      .filter((el) => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
      .map((el) => el.textContent?.trim());
    // The header row has a fixed height, so a menu that wraps spills out of it instead of growing it.
    const nav = document.querySelector('nav')!.getBoundingClientRect();
    const outsideHeader = [...document.querySelectorAll('nav a, nav button')]
      .filter(visible)
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top < nav.top || r.bottom > nav.bottom || r.right > nav.right;
      })
      .map((el) => el.textContent?.trim() || el.getAttribute('aria-label'));
    return { sideways: root.scrollWidth - root.clientWidth, outsideHeader, clippedLabels };
  });
}

async function checkAllWidths(page: Page, path: string) {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const m = await measure(page);
    expect.soft(m.sideways, `${path} @${width}px scrolls sideways`).toBe(0);
    expect.soft(m.outsideHeader, `${path} @${width}px header items spill out of the header row`).toEqual([]);
    expect.soft(m.clippedLabels, `${path} @${width}px clipped button labels`).toEqual([]);
  }
}

for (const path of PAGES) {
  test(`layout holds at every width: ${path}`, async ({ page }) => {
    await checkAllWidths(page, path);
  });
}

// The mobile bar's left button depends on office hours; check the open state too.
for (const path of ['/', '/uk']) {
  test(`layout holds with the office open: ${path}`, async ({ page }) => {
    await page.clock.install({ time: OFFICE_OPEN });
    await checkAllWidths(page, path);
  });
}
