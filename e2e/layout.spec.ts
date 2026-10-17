import { test, expect, type Page } from '@playwright/test';
import { localizePath } from '../src/i18n/config';
import { PAGE_PATHS } from '../src/lib/site-pages';

// Layout guards from ADR 0004 §4: the header must stay on one row, no page may scroll sideways,
// and no button label may be cut off. Also: no label may drop below the icon it belongs to.
// jsdom cannot check any of this, so it runs in a browser.

// Every page of the sitemap (sitemap.test.ts keeps PAGE_PATHS in step with the routes) and the 404
// page, in both languages: a new page is checked without anyone adding it here.
const PAGES = [...PAGE_PATHS, '/nie-ma-takiej-strony'].flatMap((path) => [path, localizePath(path, 'uk')]);

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
    // Only the header's own items: the header row is the sticky <nav>; other <nav>s on a page
    // (the FAQ category tiles) are not the menu.
    const header = [...document.querySelectorAll('nav')].find((el) => getComputedStyle(el).position === 'sticky')!;
    const nav = header.getBoundingClientRect();
    const outsideHeader = [...header.querySelectorAll('a, button')]
      .filter(visible)
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top < nav.top || r.bottom > nav.bottom || r.right > nav.right;
      })
      .map((el) => el.textContent?.trim() || el.getAttribute('aria-label'));
    // A Group that opens with an icon (an svg or a ThemeIcon) and wraps puts the text under the icon
    // when the row runs out of space; wrap="nowrap" keeps it beside the icon, wrapping its own lines.
    // In a nowrap row the icon also needs flexShrink 0, or the text squeezes it: an svg must keep the
    // width it was given, a ThemeIcon must stay square.
    const isIcon = (el: Element) => el.tagName.toLowerCase() === 'svg' || el.classList.contains('mantine-ThemeIcon-root');
    const iconRows = [...document.querySelectorAll('.mantine-Group-root')]
      .filter((group) => group.children.length >= 2 && isIcon(group.children[0]) && visible(group));
    const labelOf = (group: Element) => group.children[1].textContent?.trim();
    const labelsBelowIcons = iconRows
      .filter((group) => group.children[1].getBoundingClientRect().top >= group.children[0].getBoundingClientRect().bottom - 1)
      .map(labelOf);
    const squeezedIcons = iconRows
      .filter((group) => {
        const icon = group.children[0];
        const r = icon.getBoundingClientRect();
        const width = icon.tagName.toLowerCase() === 'svg' ? Number(icon.getAttribute('width')) : r.height;
        return r.width < width - 1;
      })
      .map(labelOf);
    return { sideways: root.scrollWidth - root.clientWidth, outsideHeader, clippedLabels, labelsBelowIcons, squeezedIcons };
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
    expect.soft(m.labelsBelowIcons, `${path} @${width}px labels below their icons`).toEqual([]);
    expect.soft(m.squeezedIcons, `${path} @${width}px icons squeezed by their labels`).toEqual([]);
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
