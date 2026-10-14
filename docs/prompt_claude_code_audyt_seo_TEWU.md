Pracujesz w repozytorium strony **tewu.szczecin.pl**. To strona Biura Rachunkowego TEWU Sp. z o.o. ze Szczecina. Jest napisana w Next.js, bez CMS, a kod utrzymuje nasza firma (Motherboard). Twoje zadanie to **audyt techniczny SEO obecnego kodu**, potem **poprawki** i **sprawdzenie, że działają w zbudowanej wersji strony**. Pisz do mnie i prowadź dokumentację po polsku.

## Kontekst

- Nowa wersja strony weszła 12.10.2026. Ma podstrony usługowe, sekcję „Inkubator spółek”, obsługę w języku ukraińskim i przycisk „Bezpłatna wycena” otwierający prośbę o oddzwonienie. Poprzednia wersja miała 6 podstron (Start, O nas, Usługi, Outsourcing, Certyfikaty, Kontakt) i wszystkie usługi na jednej stronie.
- Od 16.11 ruszają kampanie Google Ads. Prowadzą do podstron usługowych, więc te strony mają być szybkie, indeksowalne i spójne pod względem treści.
- Pomiar (GTM, GA4, Cookiebot, Consent Mode v2, konwersje Ads) wdraża osobno zewnętrzny specjalista. Ta praca go nie obejmuje.
- Klienci docelowi: firmy ze Szczecina i okolic (Police, Dobra, Kołbaskowo, Gryfino, Goleniów, Stargard), w szczególności JDG przechodzące na spółkę z o.o. Według ustaleń z TEWU z 12.10 fundacje i stowarzyszenia nie są grupą docelową, więc nie optymalizuj stron pod te frazy.
- Mapa tematów (sprawdź, czy title, H1 i treść każdej strony trafiają w temat; nie upychaj fraz):

| Strona                  | Temat główny                                                     |
| ----------------------- | ---------------------------------------------------------------- |
| Strona główna           | biuro rachunkowe Szczecin                                        |
| Pełna księgowość spółek | pełna księgowość / księgowość spółek Szczecin                    |
| KPiR                    | księga przychodów i rozchodów Szczecin                           |
| Ryczałt                 | księgowość na ryczałcie Szczecin                                 |
| Kadry i płace           | kadry i płace Szczecin                                           |
| KSeF                    | KSeF, biuro rachunkowe Szczecin                                  |
| Inkubator spółek        | założenie spółki z o.o. / przekształcenie JDG w spółkę, Szczecin |
| Kontakt                 | dane kontaktowe, dojazd                                          |
| Wersja ukraińska        | obsługa księgowa po ukraińsku w Szczecinie                       |

## Twarde zasady

1. **Nie dodawaj skryptów analitycznych, GTM, Cookiebota ani innych skryptów zewnętrznych.** Nie usuwaj i nie zmieniaj nazw istniejących zdarzeń `dataLayer`, identyfikatorów, atrybutów `data-*` ani linków `tel:`/`mailto:`. Numery i adresy mają zostać linkami.
2. **Nie zmyślaj faktów.** Nie dopisuj cen, liczby klientów, lat działalności, opinii ani certyfikatów, których nie ma w treści strony. Dane firmy (nazwa, adres, telefony, godziny) bierz wyłącznie z obecnej treści strony. Jeśli są niespójne, wypisz rozbieżności i zapytaj.
3. **Nie używaj sformułowania „doradztwo podatkowe”** w metadanych, nagłówkach ani danych strukturalnych.
4. **Treść merytoryczna należy do TEWU.** Bez pytania możesz zmieniać metadane, teksty alternatywne, strukturę nagłówków (poziomy) i linkowanie wewnętrzne. Zmiany widocznego tekstu (np. treści H1) proponuj w raporcie, a wprowadzaj dopiero po mojej akceptacji.
5. **Nie zmieniaj adresów URL istniejących stron**, chyba że to konieczne. Każda zmiana adresu wymaga stałego przekierowania (301/308) i wpisu w raporcie.
6. **Bez danych o ocenach.** Nie dodawaj `AggregateRating` ani `Review` w danych strukturalnych, bo Google ignoruje opinie wystawiane przez firmę o samej sobie.
7. **Bez nowych zależności bez pytania.** Najpierw sprawdź, czy wystarczą wbudowane funkcje Next.js (Metadata API, `sitemap.ts`, `robots.ts`).
8. **Pracuj na nowej gałęzi** `seo/audyt-poprawki` i rób małe commity, po jednym na obszar. Nie wypychaj zmian na gałąź produkcyjną i niczego nie wdrażaj.
9. **Teksty po ukraińsku tłumacz automatycznie.** Jeśli brakuje metadanych w wersji ukraińskiej, przygotuj je na podstawie polskich i wprowadź. Dodatkowo oznacz je w raporcie do sprawdzenia przez osobę znającą język.

## Etap 0: rozpoznanie (bez zmian w kodzie)

- Ustal wersję Next.js, rodzaj routera (App czy Pages), sposób renderowania stron (SSG, SSR, ISR, client-side) i sposób wdrażania (`netlify.toml`, `Dockerfile`, `output: 'standalone'` itd.).
- Wypisz wszystkie trasy, w tym wersje językowe, i ustal, jak działa wersja ukraińska: osobne adresy (np. `/uk/...`) czy przełączanie po stronie przeglądarki pod tym samym adresem.
- Ustal kanoniczną domenę: z `www` czy bez, `https`. Sprawdź `curl -I` na żywej stronie.
- Zbuduj projekt (`next build`) i uruchom produkcyjnie lokalnie (`next start`). Wszystkie testy rób na zbudowanej wersji, nie na `next dev`.

## Etap 1: audyt (bez zmian w kodzie)

Sprawdź co najmniej poniższe punkty i oceniaj na podstawie **HTML zwracanego przez serwer** (`curl`), a nie tego, co widać w przeglądarce po wykonaniu JS:

**Indeksacja i adresy**

- Kody odpowiedzi wszystkich tras (200, przekierowania, prawdziwe 404 dla nieistniejących adresów, bez „soft 404”).
- `robots.txt`: czy istnieje, czy nie blokuje potrzebnych zasobów i czy zawiera bezwzględny adres mapy strony.
- `sitemap.xml`: czy istnieje i czy zawiera tylko kanoniczne adresy ze statusem 200, z wersjami językowymi. Nie ustawiaj `lastmod` na datę budowania dla wszystkich stron. Jeśli nie ma wiarygodnej daty, pomiń to pole.
- `meta robots` i `X-Robots-Tag`: nic produkcyjnego nie może mieć `noindex`. Kopie podglądowe i testowe (np. `*.netlify.app`, deploy previews) powinny mieć `noindex`.
- Spójność ukośnika na końcu adresu, wielkości liter, `www` i `https`. Wskaż, co trzeba ustawić w kodzie, a co po stronie hostingu lub DNS.
- Stare adresy z poprzedniej wersji strony: odtwórz je z historii gita (wcześniejsze trasy) i sprawdź, czy prowadzą stałym przekierowaniem do odpowiednich nowych stron, a nie na 404 ani hurtowo na stronę główną. Jeśli w historii ich nie ma, poproś mnie o listę.

**Treść widoczna dla robota**

- Czy główna treść, H1 i linki wewnętrzne są w HTML z serwera. Zwróć uwagę na komponenty `"use client"`, które ładują treść dopiero w `useEffect`.
- Czy nawigacja używa prawdziwych linków (`<a href>` / `<Link>`), a nie `onClick` z `router.push`.
- Dokładnie jeden H1 na stronie i logiczna hierarchia H2/H3.
- Czy każda podstrona usługowa jest podlinkowana ze strony głównej lub ze strony usług oraz z powiązanych podstron (np. KPiR ↔ ryczałt, pełna księgowość ↔ Inkubator spółek). Sprawdź, czy anchory opisują cel, a nie brzmią „kliknij tutaj”.

**Metadane**

- Unikalny `title` na każdej stronie: temat + Szczecin + marka, około 50–60 znaków.
- Unikalny `meta description`, około 140–160 znaków, z wyróżnikiem i zachętą (np. bezpłatna wycena).
- `canonical`: bezwzględny i samoodnoszący się na każdej stronie oraz w każdej wersji językowej. Wymaga `metadataBase` lub odpowiednika.
- `lang` w `<html>` zgodny z językiem strony (`pl`, `uk`).
- `hreflang`: wzajemne odnośniki `pl` ↔ `uk` i `x-default`, tylko dla stron, które mają odpowiednik w drugim języku.
- Open Graph i Twitter: title, description, image (bezwzględny adres, sensowny obraz), `og:locale`.
- Favicon, `apple-touch-icon`, `manifest`, jeśli są.

**Dane strukturalne (JSON-LD)**

- Jedna definicja firmy w layoucie (`AccountingService` jako typ `LocalBusiness`) ze stałym `@id`. Pola: nazwa, adres (`PostalAddress`), telefon, `url`, godziny otwarcia (`openingHoursSpecification`), `areaServed` (Szczecin i okoliczne gminy), `knowsLanguage` (pl, uk). Logo i zdjęcia tylko wtedy, gdy są w repozytorium.
- `WebSite` z nazwą witryny (wpływa na nazwę strony w wynikach Google).
- Na podstronach usługowych `Service` z `provider` wskazującym na `@id` firmy oraz `BreadcrumbList`.
- `FAQPage` tylko wtedy, gdy na stronie są widoczne pytania i odpowiedzi. Zaznacz w raporcie, że Google zwykle nie pokazuje dla nich wyników rozszerzonych.
- JSON-LD ma się parsować, odpowiadać widocznej treści i nie dublować się między layoutem a stronami.

**Obrazy i wydajność**

- `alt` dla obrazów treściowych, pusty `alt` dla dekoracyjnych. Użycie `next/image` z poprawnymi `width`/`height`/`sizes`, priorytet dla obrazu LCP, brak przesunięć układu (CLS).
- Czcionki przez `next/font` albo z `font-display: swap`. Brak blokujących zasobów w `<head>`.
- Jeśli masz dostęp do Chrome, uruchom Lighthouse (mobile) dla strony głównej i dwóch podstron usługowych. Jeśli nie masz, pomiń ten punkt i napisz o tym.

**Inne**

- Strona 404 z linkami do najważniejszych podstron i statusem 404.
- Spójność danych NAP (nazwa, adres, telefon) w stopce, na stronie Kontakt i w danych strukturalnych. Telefony w formacie `tel:+48…`.
- Czy w `robots.txt` lub nagłówkach coś blokuje roboty wyszukiwarek AI. Nie zmieniaj tego, tylko opisz stan, bo decyzja należy do TEWU.

**Wynik etapu 1:** plik `docs/seo/AUDYT_SEO.md` z tabelą: problem | waga (krytyczna/wysoka/średnia/niska) | gdzie (plik, trasa) | proponowana poprawka | czy zmienia widoczną treść. Na końcu plan poprawek w kolejności wdrożenia.

**Zatrzymaj się po audycie, pokaż mi podsumowanie i poczekaj na akceptację planu.**

## Etap 2: poprawki (po mojej akceptacji)

- Wspólne dane firmy (nazwa, adres, telefony, godziny, domena) w jednym module konfiguracyjnym, używanym przez stopkę, stronę Kontakt, metadane i JSON-LD, żeby dane nie rozjeżdżały się w wielu miejscach.
- Metadane przez Metadata API (`metadata` / `generateMetadata`, `metadataBase`, `alternates.canonical`, `alternates.languages`), a przy Pages Router odpowiednik w `next/head`.
- `app/sitemap.ts` i `app/robots.ts` (lub odpowiedniki) generowane z listy tras, żeby nowa podstrona sama trafiała do mapy strony.
- Przekierowania i nagłówki (`X-Robots-Tag` dla domen podglądowych) w `next.config`, żeby działały niezależnie od hostingu. Jeśli coś da się ustawić tylko na hostingu lub w DNS, wypisz to w raporcie.
- JSON-LD jako komponent, z bezpiecznym wstawianiem treści (escapowanie `<`).
- Poprawki nagłówków, `alt`, linkowania wewnętrznego i wydajności zgodnie z zaakceptowanym planem.

## Etap 3: weryfikacja

- `next build` bez błędów. Lint, typy i istniejące testy przechodzą.
- Dodaj skrypt `scripts/seo-check.mjs` (i komendę w `package.json`), który na uruchomionej wersji produkcyjnej:
  - pobiera wszystkie adresy z `sitemap.xml` i sprawdza status 200;
  - sprawdza dokładnie jeden `<title>`, unikalne title i description, dokładnie jeden H1;
  - sprawdza bezwzględny `canonical` wskazujący na siebie, wzajemne `hreflang` i poprawne `lang`;
  - sprawdza brak `noindex`;
  - parsuje JSON-LD i sprawdza w nim obecność wymaganych pól;
  - sprawdza, że stare adresy zwracają 301/308 do właściwych nowych stron, a losowy adres zwraca 404.
- Uruchom skrypt i wklej wynik do raportu. Wszystkie testy mają przejść.
- Potwierdź, że zdarzenia `dataLayer`, identyfikatory i linki `tel:`/`mailto:` są takie jak przed zmianami (pokaż diff tych miejsc).

## Etap 4: raport końcowy

Dopisz do `docs/seo/AUDYT_SEO.md` sekcję „Wdrożone”: co zmieniono (z commitami), co zostało świadomie pominięte i dlaczego, oraz listę rzeczy do zrobienia ręcznie poza kodem. Co najmniej:

- dodanie domeny w Google Search Console (weryfikacja rekordem DNS TXT) i przesłanie mapy strony, sprawdzenie najważniejszych adresów narzędziem „Sprawdzenie adresu URL”;
- import witryny do Bing Webmaster Tools z Search Console;
- ustawienia hostingu i DNS (przekierowanie `www` ↔ bez `www`, `http` → `https`);
- zgodność adresu strony i danych NAP w wizytówce Google;
- teksty do akceptacji przez TEWU (zmiany widocznej treści, metadane po ukraińsku);
- test danych strukturalnych w Rich Results Test po wdrożeniu.

Na koniec podaj mi krótkie podsumowanie: liczbę znalezionych problemów według wagi, co poprawiono i co czeka na decyzję.
