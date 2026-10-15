# ADR 0005: Strona FAQ

## Status
Zaakceptowany (Accepted)

## Kontekst
TEWU przekazało szkic strony z odpowiedziami na częste pytania o księgowość, podatki i ZUS. Strona ma być dobrze widoczna w wyszukiwarkach i dla systemów AI, a link do niej ma być tylko w stopce. Ustalenia z sesji grillingu: `docs/superpowers/specs/2026-10-15-faq-page-design.md`.

## Decyzje

### 1. Adres i nawigacja
- `/faq` i `/uk/faq` (ten sam slug, ADR 0002 §1). Wcześniejsze serwisy TEWU nie miały strony FAQ (sprawdzone w Wayback Machine), więc nie ma Legacy URL.
- Link tylko w stopce, w kolumnie „Nawigacja”, przed „Polityką prywatności”: „Częste pytania (FAQ)” / „Поширені запитання (FAQ)”. Nie ma go w menu ani na stronie głównej, więc nagłówek (ADR 0004 §4) się nie zmienia. Strona jest w `sitemap.xml` i w `/llms.txt`.

### 2. Model treści
- Treść w typowanych modułach `src/content/faq/{pl,uk}.ts`, nie w słownikach (ten sam powód co w ADR 0004 §2). Czytają je tylko serwerowe `page.tsx`; klienckie `FaqPage` dostaje treść przez props.
- 5 kategorii, każda z H2 i ikoną. Pytanie ma stały, polski identyfikator (np. `ulga-na-start`), taki sam w obu językach. `/faq#ulga-na-start` otwiera i przewija do odpowiedzi. Kolejność pytań może się różnić między językami: w UK pytanie o rozmowę po ukraińsku jest pierwsze w kategorii „O Biurze TEWU”.
- Odpowiedzi używają dwóch znaczników: `[tekst](/ścieżka)` (link) i `**tekst**` (pogrubienie). Jeden parser (`src/lib/rich-text.ts`) zasila stronę i HTML odpowiedzi w JSON-LD.
- Kwoty i terminy (ZUS, VAT, rachunki) zostają w treści, bo strona pokazuje datę aktualizacji (`FAQ_UPDATED_AT`, z niej także `dateModified`). Odpowiedź z kwotą lub terminem musi mieć źródło urzędowe (biznes.gov.pl, podatki.gov.pl, zus.pl) – pilnuje tego test. Procedura aktualizacji jest w README („Aktualizacja FAQ”).
- Pytania z podstron usługowych nie są kopiowane 1:1: Google prosi o oznaczanie `FAQPage` tylko jednej kopii tego samego pytania.

### 3. Wygląd
- Akordeon (`FaqList`) i przyciski wyceny (`QuoteActions`) wydzielone z `ServiceLandingPage` – podstrony usług wyglądają tak samo.
- Nagłówek dzielony: tekst na ciemnym `slate.9` i prawdziwe zdjęcie budynku (78A), ładowane od razu (`fetchpriority="high"`), bo to element LCP na desktopie. Końcowe CTA ze zdjęciem recepcji z Prezesem (`loading="lazy"`). Zdjęcia bez metadanych EXIF, AVIF z zapasowym JPG, w `public/img/biuro/` (rejestr: `src/lib/office-photos.ts`). Zgodę Prezesa na publikację wizerunku przekazał właściciel projektu (15.10.2026).
- Przycisk w CTA otwiera widżet call-back ze źródłem `faq`.

### 4. SEO i AI
- JSON-LD: węzeł `FAQPage` jest zarazem węzłem strony (`url`, `inLanguage`, `dateModified`, `isPartOf` → `#strona`, `about` → `#firma`), plus `BreadcrumbList`. Odpowiedzi to HTML z bezwzględnymi linkami. `AccountingService.image` dostaje zdjęcie budynku obok obrazu do udostępnień (Google zaleca zdjęcia firmy lokalnej).
- `/llms.txt` (proponowany standard) opisuje biuro i wymienia kluczowe strony, w tym FAQ. Powstaje z rejestrów (`COMPANY`, `SERVICE_PAGES`, lista stron z `sitemap.ts`), żeby nie rozjeżdżał się z serwisem. Google go nie używa; koszt jest mały.
- `pnpm seo:check` wymaga na `/faq` typów `FAQPage` i `BreadcrumbList` oraz sprawdza `/llms.txt`.

## Konsekwencje
- Kwoty trzeba aktualizować co najmniej raz w roku (styczeń: płaca minimalna, składki ZUS) i przy zmianach przepisów. Bez tego strona pokazuje nieaktualną datę i kwoty.
- Zmiana identyfikatora pytania psuje linki, które biuro komuś wysłało (np. `/faq#ulga-na-start`).
- Po zmianie języka kotwica może zniknąć z adresu (przełącznik zachowuje stronę, nie kotwicę).

## Przed wydaniem
- **Treść ukraińską musi sprawdzić osoba z TEWU.** Wersja UK to tłumaczenie przygotowane przez Claude.
- TEWU potwierdza nowe pytania i zmiany merytoryczne z listy „Do weryfikacji przez TEWU” w specyfikacji.
