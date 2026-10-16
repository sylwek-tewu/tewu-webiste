# Zdjęcia biura poza FAQ – plan wdrożenia

**Goal:** prawdziwe zdjęcia biura TEWU na podstronach usług, w „O nas” i na `/kontakt`. Zdjęcia mają budować zaufanie i wyglądać spójnie ze stroną FAQ.

**Baza:** gałąź `feat/faq-page` (PR #6), bo tam są zdjęcia, rejestr `OFFICE_PHOTOS` i FAQ. Po scaleniu PR #6 baza tego PR zmienia się na `devel`.

## Ustalenia (sesja 15.10.2026)

| # | Pytanie | Decyzja |
|---|---------|---------|
| 1 | Które podstrony dostają zdjęcie Prezesa? | 6 podstron usług, w końcowym CTA. |
| 2 | Jaki układ CTA? | Dzielone CTA jak na FAQ: po lewej tekst i przyciski, po prawej zdjęcie recepcji z Prezesem. Na telefonie zdjęcie jest pod przyciskami. Jeden wspólny komponent (`ReceptionCta`) dla FAQ i usług. |
| 3 | „O nas”: zdjęcie i opis alt | Nowe zdjęcie: Prezes przy biurku, za nim dwie osoby z zespołu. Kadr poziomy 4:3, bo pokazuje więcej biura. Opis alt w słowniku zmieniony, bo opisuje inne zdjęcie. |
| 4 | `/kontakt`: gdzie budynek? | W sekcji z mapą: zdjęcie po lewej, mapa po prawej, na telefonie zdjęcie nad mapą. Pod zdjęciem podpis, które drzwi prowadzą do biura. |
| 5 | LCP | Żadne nowe zdjęcie nie jest na pierwszym ekranie, więc wszystkie ładują się leniwie (`loading="lazy"`). Wyjątkiem pozostaje budynek na `/faq`. |
| 6 | Zdjęcia stockowe na stronie głównej (Hero, „Dlaczego my”) | Zostają, ewentualna wymiana w osobnym PR. |

## Zdjęcie do „O nas”

- Oryginał: `docs/photos/oryginal-zespol-prezes.jpg` (3264 × 2448, aparat z 2012 r., EXIF bez GPS).
- Kadr 4:3 `extract({ left: 360, top: 400, width: 2240, height: 1680 })`, potem 1200 × 900. Obcina większość matowej szyby u dołu i kamerę pod sufitem.
- Obróbka jak w planie FAQ (Task 5): `sharp` z zależności Next.js, JPEG (mozjpeg, q80) i AVIF (q55), bez EXIF. Pliki: `public/img/biuro/zespol.{jpg,avif}`.
- Karta „25+ lat na rynku” jest teraz po prawej stronie zdjęcia (nad monitorami), bo po lewej siedzi Prezes. Mieści się w szerokości zdjęcia, więc nie przewija strony w bok.

## Zadania

- [x] Testy najpierw: opisy alt (`src/app/image-alts.test.tsx`), wymiary, `lazy` i AVIF (`src/app/image-loading.test.tsx`), zdjęcie z podpisem w sekcji mapy (`ContactClient.test.tsx`).
- [x] `zespol.{jpg,avif}` i wpis `team` w `src/lib/office-photos.ts` (test rejestru sprawdza pliki, wymiary i brak EXIF).
- [x] Wspólny `<picture>` i siatka „tekst obok zdjęcia”: `src/components/OfficePicture.tsx` (`OfficePicture`, `BesidePhoto`; wcześniej prywatne w `FaqPage`).
- [x] Wspólne CTA: `src/components/ReceptionCta.tsx`, używane przez `FaqPage` (`source="faq"`, `id="kontakt"` dla linku z zastrzeżenia w nagłówku) i `ServiceLandingPage` (`source="service"`).
- [x] „O nas”: `OfficePicture` z `OFFICE_PHOTOS.team`, siatka wyśrodkowana w pionie.
- [x] `/kontakt`: `<figure>` ze zdjęciem wejścia i `<figcaption>` obok mapy. Mapa ma zaokrąglone rogi i na desktopie wysokość kolumny ze zdjęciem.
- [x] Słowniki: `servicePages.finalCta.imageAlt`, `about.intro.imageAlt` (nowy tekst), `contact.entrancePhotoAlt`, `contact.entranceCaption`.
- [x] Usunięty nieużywany `public/img/stock/team.jpg`.
- [x] Dopisek w ADR 0005 §3.

## Weryfikacja

`pnpm lint`, `pnpm check:types`, `pnpm test`, `pnpm build`, `pnpm seo:check http://127.0.0.1:3100`, `pnpm test:e2e` oraz zrzuty `/uslugi/kpir`, `/o-nas`, `/kontakt` (PL i UK) przy 390, 1024, 1200 i 1440 px.
