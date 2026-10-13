# Audyt techniczny SEO – tewu.szczecin.pl

Data audytu: 13.10.2026. Gałąź: `seo/audyt-poprawki` (od `devel`, 0aaf2bf). Zakres i zasady: [`docs/prompt_claude_code_audyt_seo_TEWU.md`](../prompt_claude_code_audyt_seo_TEWU.md).

Wszystkie ustalenia pochodzą z HTML zwracanego przez serwer (`curl`, bez wykonywania JS) z lokalnie zbudowanej wersji produkcyjnej. Serwer `standalone` uruchomiono tak samo jak w obrazie Dockera (`node server.js`).

## Etap 0: rozpoznanie

| Co | Stan |
| --- | --- |
| Framework | Next.js 16.1.6, App Router, Turbopack |
| Renderowanie | Wszystkie strony statyczne (SSG). Podstrony usługowe przez `generateStaticParams` z `dynamicParams = false`. Strona 404 dynamiczna (`global-not-found.tsx`, `experimental.globalNotFound`) |
| Wdrożenie | `output: 'standalone'`, wieloetapowy `Dockerfile` (`node:24-alpine`), Coolify na VPS w OVHcloud (ADR 0003). Aplikacja Coolify buduje gałąź `main` |
| Proxy | `src/proxy.ts`: hasło dla Preview Deployment, przekierowanie 307 na `/uk` według `Accept-Language`, nagłówek języka dla strony 404 |
| Wersja ukraińska | Osobne adresy z prefiksem `/uk` i tymi samymi slugami (ADR 0002), osobny root layout na język, więc `<html lang>` jest poprawny w HTML z serwera |
| Domena kanoniczna | `https://tewu.szczecin.pl` (bez `www`), stała `SITE_URL` w `src/constants.tsx`, `metadataBase` w obu layoutach |

**Trasy (26 stron = 13 × 2 języki):** `/`, `/o-nas`, `/uslugi`, `/uslugi/{pelna-ksiegowosc, kpir, ryczalt, kadry-i-place, ksef, inkubator-spolek}`, `/outsourcing`, `/certyfikaty`, `/kontakt`, `/polityka-prywatnosci` oraz te same ścieżki pod `/uk`. Do tego `/sitemap.xml`, ikony i `/api/*` (callback, health, internal).

**Żywa strona w dniu audytu:** `tewu.szczecin.pl` wskazywała jeszcze na Netlify z poprzednią wersją strony (bez podstron usługowych i `/uk`, `robots.txt` i `sitemap.xml` zwracały 404). `www` → domena bez `www` (301), `http` → `https` (301), ukośnik na końcu → 308. Tego samego dnia domenę przepięto na Coolify. Wyniki kontroli: [sekcja niżej](#po-przepięciu-domeny-13102026).

### Legacy URL (stare adresy)

| Źródło | Adresy | Stan w nowej wersji |
| --- | --- | --- |
| Wersja na Netlify (do 10.2026) | `/`, `/o-nas`, `/uslugi`, `/outsourcing`, `/certyfikaty`, `/kontakt` | Te same ścieżki istnieją (200). Przekierowania niepotrzebne |
| Prototyp (Vite, `HashRouter`) | `/#/o-nas` itd. | Fragment `#` nie trafia do serwera ani do indeksu. Bez znaczenia |
| Serwis w Laravelu (archiwum Wayback, do ok. 10.2025) | `/aktualnosci`, `/aktualnosc/1`, `/aktualnosc/2`, `/kariera`, `/program`, `/login` | Bez odpowiedników. Na żywej stronie zwracają 404 od miesięcy. Zgodnie z ustaleniem zostają przy 404 (bez hurtowego przekierowania na stronę główną) |

## Co już działa dobrze

- Każda strona zwraca 200, nieistniejące adresy prawdziwe 404 (również `/uk/...`, `/uslugi/nie-ma`, `/uk/stara.php`) z `noindex` i pełnym układem strony. Brak „soft 404”.
- Ukośnik na końcu: 308 na adres bez ukośnika. Wielkie litery (`/USLUGI`): 404, co jest poprawne, bo żadna strona nie ma takiego adresu.
- Treść, H1, FAQ (również odpowiedzi) i linki są w HTML z serwera. Komponenty `"use client"` renderują się na serwerze, nic nie jest ładowane w `useEffect`.
- Nawigacja, stopka i karty usług to prawdziwe `<a href>` (`next/link`).
- Dokładnie jeden H1 na każdej stronie.
- `canonical` bezwzględny i samoodnoszący się na wszystkich 26 stronach. `hreflang` `pl`/`uk`/`x-default` wzajemne. `lang` zgodny z językiem.
- `sitemap.xml`: 26 adresów kanonicznych z alternatywami językowymi, bez `lastmod`.
- Czcionka przez `next/font` (Inter, preload podzbioru łacińskiego, cyrylica dostępna przez `unicode-range`). CLS ≈ 0.
- Linki `tel:` w formacie E.164 (`tel:+48…`), `mailto:` poprawne.
- Favicon (`.ico` + SVG) i `apple-touch-icon`.
- Nic nie blokuje robotów wyszukiwarek AI: nie ma `robots.txt` ani nagłówków, które by je blokowały. Decyzja należy do TEWU, stan opisuję bez zmian.

## Lighthouse (mobile)

Lighthouse 12.8.2 (`pnpm dlx`, bez dodawania do projektu), Chrome headless, domyślna emulacja mobilna (Moto G Power, symulowane wolne 4G). Pomiar lokalny, bez CDN.

| Strona | Wydajność | Dostępność | Dobre praktyki | SEO | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 85 | 93 | 100 | 100 | 1,7 s | 4,3 s | 20 ms | 0 |
| `/uslugi/kpir` | 89 | 96 | 100 | 100 | 1,8 s | 3,6 s | 20 ms | 0 |
| `/uslugi/inkubator-spolek` | 89 | 96 | 100 | 100 | 1,8 s | 3,6 s | 20 ms | 0,002 |

Elementem LCP na mobile jest akapit tekstu w hero (nie obraz). 87% czasu LCP to „render delay”, czyli blokujący CSS (3 pliki, ok. 950 ms w symulacji) i podmiana czcionki. Na stronie głównej telefon pobiera 3 zdjęcia (ok. 280 KB), które na mobile są ukryte (`visibleFrom="md"`/`"lg"`). React 19 wstawia dla nich `<link rel="preload">`, bo są zwykłymi `<img>` bez `loading="lazy"`.

## Lista problemów

Waga: **krytyczna** (blokuje indeksację lub kampanię), **wysoka**, **średnia**, **niska**.

| # | Problem | Waga | Gdzie | Proponowana poprawka | Widoczna treść? |
| --- | --- | --- | --- | --- | --- |
| 1 | Szablon adresu Preview Deployment w Coolify to `{{pr_id}}.{{domain}}`. Po dodaniu `tewu.szczecin.pl` podglądy PR trafią pod domenę klienta | krytyczna | Coolify, aplikacja `vove4fk84fv8vr6plcgwrgeo` | Ustawić na sztywno `{{pr_id}}.test-tewu-website.projekty-tewu.it` (ADR 0003, sekcja 3a). **Rozwiązane 13.10 przy przepięciu** | nie |
| 2 | Brak danych strukturalnych (JSON-LD) na wszystkich stronach | wysoka | `src/app/(pl)/layout.tsx`, `(uk)/layout.tsx`, podstrony usługowe | Komponent `JsonLd` z escapowaniem `<`. W layoucie `AccountingService` (`@id` `https://tewu.szczecin.pl/#firma`) i `WebSite`. Na podstronach usługowych `Service` (`provider` → `@id`), `BreadcrumbList` i `FAQPage` (pytania są widoczne na stronie). Uwaga: od sierpnia 2023 Google pokazuje wyniki rozszerzone FAQ praktycznie tylko serwisom rządowym i medycznym, więc `FAQPage` porządkuje dane, ale nie zmieni wyglądu wyniku | nie |
| 3 | Brak `robots.txt` (404), więc brak wskazania mapy strony | wysoka | brak `src/app/robots.ts` | `robots.ts`: `Allow: /`, `Sitemap: https://tewu.szczecin.pl/sitemap.xml`. Bez blokowania robotów AI | nie |
| 4 | `noindex` poza produkcją zależy tylko od ustawienia w Coolify (`noindex_domains` dla domeny testowej). Uruchomienie lokalne i każda nowa domena są indeksowalne | wysoka | `next.config.mjs` | Nagłówek `X-Robots-Tag: noindex` dla każdego hosta innego niż dokładnie `tewu.szczecin.pl` (`headers()` z warunkiem `missing: host`) | nie |
| 5 | Title strony głównej „Strona główna - Biuro Rachunkowe TEWU” (37 zn.) nie zawiera „Szczecin” i marnuje miejsce na „Strona główna” | wysoka | `src/app/(pl)/page.tsx` | „Biuro rachunkowe Szczecin – księgowość, kadry i płace \| TEWU” (60) | nie |
| 6 | H1 strony głównej „Księgowość bez stresu.” nie zawiera tematu strony (biuro rachunkowe Szczecin) | wysoka | `src/i18n/pl.ts` (`home.hero`), `uk.ts` | Propozycja: nad niezmienionym hasłem mniejsza linijka „Biuro rachunkowe w Szczecinie”, obie w jednym H1. **Do akceptacji TEWU** | tak |
| 7 | „Doradztwo podatkowe” w metadanych (zakazane w zasadzie 3), również w odpowiednikach ukraińskich („податкові консультації”) | wysoka | `/uslugi` i `/o-nas` (description), `(uk)/layout.tsx`, `/uk`, `/uk/uslugi` (description) | Nowe opisy bez tego sformułowania (pkt 12) | nie |
| 8 | „Doradztwo podatkowe” jako nagłówek H3 karty usługi oraz w podtytule strony usług („…po zaawansowane doradztwo podatkowe”), w wersji ukraińskiej „Податкове консультування” | wysoka | `src/i18n/pl.ts` (`servicesPage`, karta `doradztwo`), `uk.ts` | Zmienić podtytuł i nazwę karty (propozycja: „Wsparcie w sprawach podatkowych”) albo usunąć kartę. **Do decyzji TEWU** (to także kwestia prawna: doradztwo podatkowe jest zawodem regulowanym) | tak |
| 9 | Podstrony usługowe nie linkują do siebie w treści, tylko przez stopkę i link „Inkubator” w menu (brak KPiR ↔ ryczałt, pełna księgowość ↔ Inkubator, kadry ↔ pełna księgowość) | wysoka | `src/components/service-pages/ServiceLandingPage.tsx` | Blok „Zobacz też” z 2–3 powiązanymi usługami i opisowymi anchorami (nazwa usługi) przed sekcją CTA. Opisy z kart `/uslugi`, więc zależy od pkt 20 (opis pełnej księgowości bez fundacji) | tak (nowy blok linków) |
| 10 | Brak Open Graph i Twitter Card na wszystkich stronach (udostępnienia w mediach społecznościowych i komunikatorach bez tytułu i obrazu) | średnia | layouty, metadane stron | `openGraph` (title, description, url, `siteName`, `locale` `pl_PL`/`uk_UA`, `alternateLocale`) i `twitter: summary_large_image`. Obraz generowany przez wbudowane `next/og` (`opengraph-image.tsx`) z logo i nazwą firmy, bez nowych zależności | nie |
| 11 | Pozostałe title bez „Szczecin”, z mieszanymi separatorami (`-`, `\|`, `–`), `/outsourcing` ma 62 zn. i wielkie litery w środku | średnia | `/o-nas`, `/uslugi`, `/outsourcing`, `/certyfikaty`, `/kontakt` i odpowiedniki `/uk` | Tabela propozycji niżej. Jeden separator ` – ` / ` \| ` w całym serwisie | nie |
| 12 | Meta description poniżej 140 zn. lub bez zachęty: `/` (150, bez CTA), `/o-nas` (117), `/uslugi` (95), `/outsourcing` (115), `/kontakt` (120), `/uslugi/inkubator-spolek` (131, bez CTA) i odpowiedniki `/uk` (121–145 zn., bez CTA). Opis `/` jest identyczny z domyślnym opisem w layoucie | średnia | jw. | Tabela propozycji niżej | nie |
| 13 | Title KPiR używa skrótu („Księgowość KPiR Szczecin”) zamiast tematu „księga przychodów i rozchodów”. Title Inkubatora nie zawiera „założenie spółki z o.o.” | średnia | `src/content/service-pages/pl/kpir.ts`, `inkubator-spolek.ts` | „Księga przychodów i rozchodów (KPiR) Szczecin – TEWU” (52), „Założenie spółki z o.o. w Szczecinie – Inkubator spółek TEWU” (60) | nie |
| 14 | Przeskoki poziomów nagłówków: na stronie głównej H2 → H4 (karty usług), na `/uslugi` H1 → H3 (karty) i H2 → H4 (sekcja „Nie wiesz, która forma…”), na `/outsourcing` H2 → H4. To samo w wersjach `/uk`. Lighthouse: `heading-order` | średnia | `src/components/home/Services.tsx`, `src/app/(pl)/uslugi/ServicesClient.tsx`, `OutsourcingClient.tsx` | Zmiana poziomów (`order`) bez zmiany tekstu i wyglądu | nie |
| 15 | Obrazy jako zwykłe `<img>` bez `width`/`height`/`srcset`, w JPEG/PNG. Na mobile pobierane są ukryte zdjęcia (ok. 280 KB na `/`). Na `/certyfikaty` karta ładuje `library.png` (948 KB), choć w repozytorium jest `library.avif` (299 KB) | średnia | `Hero.tsx`, `WhyUs.tsx`, `AboutClient.tsx`, `CertificateCard.tsx` | `next/image` z `sizes` (AVIF/WebP, `srcset`, lazy) dla zdjęć poniżej pierwszego ekranu i ukrytych na mobile. Na certyfikatach pliki AVIF. Do sprawdzenia: `sharp` w obrazie Alpine | nie |
| 16 | LCP na mobile 3,6–4,3 s (symulacja), opóźnienie renderowania przez blokujący CSS i podmianę czcionki | średnia | layout, CSS Mantine | Najpierw poprawki z pkt 15, potem ponowny pomiar. Dalsze kroki (np. `display: 'optional'` dla czcionki) tylko jeśli dane terenowe CrUX będą słabe | nie |
| 17 | Dane firmy rozproszone: `CONTACT_DETAILS` w `constants.tsx`, ale trzy numery na stronie Kontakt są wpisane na sztywno, godziny i adres powtórzone w słownikach, zapasowe `\|\| '+48914824190'` w kilku miejscach | średnia | `ContactClient.tsx`, `Footer.tsx`, `i18n/pl.ts`, `uk.ts` | Jeden moduł danych firmy (nazwa, adres w częściach, telefony, e-mail, godziny, domena, obszar działania), używany przez stopkę, Kontakt, metadane i JSON-LD | nie |
| 18 | Coolify ma `redirect: both` (adres z `www` i bez `www` działa bez przekierowania). Przekierowania `www` brak też w kodzie | średnia | Coolify, `next.config.mjs` | Coolify: „non-www”. Kod: 308 z `www.tewu.szczecin.pl` na `https://tewu.szczecin.pl` jako zapas. **Po stronie Coolify rozwiązane 13.10** (301 w jednym skoku, etykiety Traefika). W kodzie zostaje sam zapas | nie |
| 19 | Anchory „Więcej” (×4) na kartach usług na stronie głównej nie mówią, dokąd prowadzą | średnia | `src/components/home/Services.tsx` | Dopisać nazwę usługi jako tekst dla czytników ekranu (`visually hidden`): „Więcej: Księga przychodów i rozchodów”. Wygląd bez zmian | nie |
| 20 | Opis karty pełnej księgowości wymienia „fundacje i stowarzyszenia”, które według ustaleń z 12.10 nie są grupą docelową | niska | `src/i18n/pl.ts`, `uk.ts` (strona główna i `/uslugi`). Nieużywana kopia listy usług w `constants.tsx` (`SERVICES`) do usunięcia przy okazji | Usunąć z opisu. **Do akceptacji TEWU**. Temat „Fundacja lub stowarzyszenie” w formularzu oddzwonienia: **usunąć (decyzja z 13.10)**. Skutki: w zdarzeniu `callback_request_submit` znika wartość `topic: 'fundacja'` (nazwa zdarzenia i pola bez zmian, do wiadomości specjalisty od pomiaru); zgłoszenie z tym tematem czekające w buforze w chwili wdrożenia dojdzie bez tematu (`delivery-pipeline.ts` zamienia nieznany temat na pusty); aktualizacja ADR 0001 i testów | tak |
| 21 | Linki Facebook i LinkedIn w stopce mają `href="#"` (na każdej stronie) | niska | `src/components/Footer.tsx` | Podać adresy profili (trafią też do `sameAs` w JSON-LD) albo usunąć ikony. **Do decyzji TEWU** | tak |
| 22 | Teksty alternatywne: zdjęcie stockowe opisane jako „Zespół TEWU” (sugeruje zdjęcie zespołu firmy), na stronach `/uk` alt po polsku, dwa różne certyfikaty z tym samym altem „Certyfikat Księgowy” | niska | `AboutClient.tsx`, `Hero.tsx`, `WhyUs.tsx`, `i18n` (certyfikaty) | Neutralne, przetłumaczone alt-y („Zespół przy pracy w biurze”). Alt certyfikatu z nazwiskiem z podpisu karty: „Certyfikat Księgowy – Sylwester Wrzeszcz”, „Certyfikat Księgowy – Tamara Ugha” | nie |
| 23 | Karty certyfikatów otwierają podgląd przez `onClick` na `<div>`: brak linku do PDF, brak obsługi klawiaturą. Napis „Podgląd Dokumentu” po polsku na `/uk/certyfikaty` | niska | `CertificateCard.tsx` | Element `<button>`. Tekst ze słownika | tak (tylko tłumaczenie istniejącego napisu) |
| 24 | Strona 404 ma dwa znaczniki `<meta name="robots" content="noindex">` (Next.js dodaje własny) | niska | `src/app/global-not-found.tsx` | Usunąć `robots` z `generateMetadata` (Next.js i tak dodaje `noindex`) | nie |
| 25 | Przekierowanie 307 na `/uk` według `Accept-Language` (także dla robotów, które wysyłają ten nagłówek). Google odradza automatyczne przekierowania językowe. Googlebot zwykle nie wysyła `Accept-Language`, ale reklamy Ads kierowane do Polaków z ukraińską przeglądarką wylądują na `/uk` | niska | `src/proxy.ts` (ADR 0002) | Bez zmian w kodzie (świadoma decyzja z ADR 0002). Omówić z TEWU przy kampanii | nie |
| 26 | Wildcard DNS `*.tewu.szczecin.pl` wskazywał stronę parkingową nazwa.pl (np. `123.tewu.szczecin.pl`) | niska | DNS (nazwa.pl) | **Rozwiązane 13.10 przy przepięciu:** po zmianach w DNS `*.tewu.szczecin.pl` zwraca NXDOMAIN | nie |
| 27 | Link do Map Google w stopce szuka „Biuro Rachunkowe TEWU Sp. z o.o. aleja Powstańców Wielkopolskich, Szczecin”, czyli bez numeru budynku i kodu pocztowego, i nie wskazuje bezpośrednio wizytówki firmy | niska | `src/components/Footer.tsx` | Zapytanie z pełnym adresem albo link do wizytówki Google (do podania przez TEWU) | nie |
| 28 | Kontrast tekstu #d0ebff na niebieskim tle sekcji CTA (4,18:1 zamiast 4,5:1). Dostępność, nie SEO | niska | `ServiceLandingPage.tsx:244`. Ten sam kolor `blue.1` na niebieskim tle także w `ServicesClient.tsx:96` i `ContactClient.tsx:125` | Jaśniejszy kolor tekstu (`white`/`blue.0`) | nie (kolor) |
| 29 | 13 KB polyfilli dla starych przeglądarek (`Array.prototype.at`, `Object.hasOwn` itd.) | niska | konfiguracja `browserslist` | Pominąć (mały zysk, ryzyko dla starszych urządzeń) | nie |
| 30 | Przełącznik języka PL/UA to `SegmentedControl` z `onChange` → `router.push`, bez `<a href>`. W HTML stron polskich nie ma żadnego linku do `/uk…` i odwrotnie. Wersje językowe łączą tylko `hreflang` i mapa strony | średnia | `src/components/layout/LanguageSwitcher.tsx:43`, `src/i18n/LocaleContext.tsx` | Dodać prawdziwy link do odpowiednika strony w drugim języku (np. przełącznik oparty na `<a href>` z zapisem ciasteczka przy kliknięciu). Wygląd bez zmian | nie |
| 31 | Podstrony usługowe mają odznakę „Certyfikaty MF i SKwP”, a strona `/certyfikaty` przypisuje oba dokumenty Ministrowi Finansów i nie wspomina SKwP | niska | `src/i18n/pl.ts:288`, `pl.ts` (`certificates`) | Ustalić z TEWU, czy któryś dokument wydało SKwP. Do tego czasu title `/certyfikaty` bez „MF i SKwP” | tak (jeśli TEWU poprawi odznakę lub opis) |

### Mapa tematów: title i H1 (PL)

Ocena według mapy tematów z promptu. Treść każdej strony odpowiada tematowi. Rozjazdy dotyczą głównie title i H1.

| Strona | Temat | Title dziś | H1 dziś | Ocena |
| --- | --- | --- | --- | --- |
| `/` | biuro rachunkowe Szczecin | Strona główna - Biuro Rachunkowe TEWU | Księgowość bez stresu. | nie trafia: pkt 5 i 6 |
| `/uslugi/pelna-ksiegowosc` | pełna księgowość / księgowość spółek Szczecin | Pełna księgowość spółek Szczecin – Biuro Rachunkowe TEWU | Pełna księgowość spółek w Szczecinie | trafia |
| `/uslugi/kpir` | księga przychodów i rozchodów Szczecin | Księgowość KPiR Szczecin – Biuro Rachunkowe TEWU | Księga przychodów i rozchodów (KPiR) w Szczecinie | H1 trafia, title skrótem: pkt 13 |
| `/uslugi/ryczalt` | księgowość na ryczałcie Szczecin | Księgowość na ryczałcie Szczecin – Biuro Rachunkowe TEWU | Ryczałt ewidencjonowany – księgowość w Szczecinie | trafia |
| `/uslugi/kadry-i-place` | kadry i płace Szczecin | Kadry i płace Szczecin – Biuro Rachunkowe TEWU | Kadry i płace w Szczecinie | trafia |
| `/uslugi/ksef` | KSeF, biuro rachunkowe Szczecin | KSeF – e-faktury i księgowość Szczecin – Biuro TEWU | KSeF – obsługa e-faktur w Szczecinie | trafia |
| `/uslugi/inkubator-spolek` | założenie spółki z o.o. / przekształcenie JDG, Szczecin | Inkubator spółek z o.o. Szczecin – Biuro Rachunkowe TEWU | Inkubator spółek z o.o. w Szczecinie | częściowo: title poprawia pkt 13. H1 bez zmian: lead mówi o zakładaniu spółki, sekcja „Dla kogo” o przekształceniu JDG |
| `/kontakt` | dane kontaktowe, dojazd | Kontakt - Biuro Rachunkowe TEWU | Kontakt | H1 wystarcza, title: pkt 11 |
| `/uk` | obsługa księgowa po ukraińsku w Szczecinie | Бухгалтерське бюро TEWU \| Польща, Щецин | Бухгалтерія без стресу. | jak `/`: pkt 6. TEWU potwierdziło rozmowy po ukraińsku (Decyzje, pkt 2), trafia to do JSON-LD |

### Propozycje title i description (PL)

Metadane mogę zmieniać bez akceptacji (zasada 4). Wersje ukraińskie przygotuję na tej podstawie w etapie 2 i oznaczę do sprawdzenia przez osobę znającą język (zasada 9). Fakty pochodzą z obecnej treści strony: „Ponad 25 lat na rynku” (hero), „Bezpośredni kontakt z szefostwem biura” (podstrony usługowe), „Uprawnienia wydane przez Ministerstwo Finansów” (certyfikaty), „oddzwonimy” (widżet).

| Strona | Title (znaki) | Description (znaki) |
| --- | --- | --- |
| `/` | Biuro rachunkowe Szczecin – księgowość, kadry i płace \| TEWU (60) | Biuro rachunkowe w Szczecinie: pełna księgowość spółek, KPiR, ryczałt, kadry i płace, KSeF. Ponad 25 lat na rynku. Bezpłatna wycena – oddzwonimy. (145) |
| `/o-nas` | O nas – biuro rachunkowe w Szczecinie od ponad 25 lat \| TEWU (60) | Biuro Rachunkowe TEWU w Szczecinie: ponad 25 lat na rynku, uprawnienia Ministerstwa Finansów i bezpośredni kontakt z szefostwem biura. Poznaj nas. (146) |
| `/uslugi` | Usługi księgowe i kadrowe w Szczecinie – Biuro TEWU (51) | Usługi biura rachunkowego TEWU w Szczecinie: pełna księgowość, KPiR, ryczałt, kadry i płace, KSeF oraz zakładanie spółek z o.o. Bezpłatna wycena. (145) |
| `/uslugi/kpir` | Księga przychodów i rozchodów (KPiR) Szczecin – TEWU (52) | bez zmian (133, ma CTA) |
| `/uslugi/inkubator-spolek` | Założenie spółki z o.o. w Szczecinie – Inkubator spółek TEWU (60) | Zakładasz spółkę z o.o. w Szczecinie albo przekształcasz JDG? Doradzimy, założymy spółkę z notariuszem i zapewnimy adres siedziby. Bezpłatna wycena. (148) |
| `/outsourcing` | Outsourcing księgowości i back-office w Szczecinie – TEWU (57) | Zredukuj koszty operacyjne i skup się na rozwoju. Outsourcing księgowy i procesów back-office w Biurze Rachunkowym TEWU w Szczecinie. Bezpłatna wycena. (151) |
| `/certyfikaty` | Certyfikaty księgowe – Biuro Rachunkowe TEWU w Szczecinie (57) | bez zmian (139) |
| `/kontakt` | Kontakt i dojazd – Biuro Rachunkowe TEWU w Szczecinie (53) | Biuro Rachunkowe TEWU, Al. Powstańców Wielkopolskich 78A LU2, Szczecin. Telefon 91 48 24 190, e-mail, godziny otwarcia (pn–pt 8–16) i mapa dojazdu. (147) |
| pozostałe podstrony usługowe | bez zmian (46–56 zn., zgodne z mapą tematów) | bez zmian (131–141 zn., mają CTA) |

### Dane firmy (NAP) – stan

Dane są spójne między stopką, stroną Kontakt i słownikami. Nie znalazłem rozbieżności.

| Pole | Wartość (z treści strony) |
| --- | --- |
| Nazwa | Biuro Rachunkowe TEWU Sp. z o.o. |
| Adres | Al. Powstańców Wielkopolskich 78A LU2, 70-110 Szczecin |
| Telefon główny | 91 48 24 190 (`+48914824190`), w stopce i jako numer widżetu. Od 13.10 TEWU wskazuje jako pierwszy wybór 602 235 736 (Decyzje, pkt 4) |
| Inne telefony | 602 235 736 (sekretariat), 501 482 555 (komórkowy, w stopce i na podstronach usługowych), 886 543 973 (komórkowy) |
| E-mail | biuro@tewu.szczecin.pl, sw@tewu.szczecin.pl |
| Godziny | pon–pt 8:00–16:00 |
| NIP / REGON / KRS | 9552249417 / 320601499 / 0000320281 |

## Decyzje (odpowiedzi TEWU i Twoje z 13.10.2026)

1. **Widoczna treść:** TEWU akceptuje pkt 6 (H1 strony głównej), 8 (nowy podtytuł `/uslugi`, karta „Doradztwo podatkowe” **usunięta**, wariant A), 9 (blok „Zobacz też”), 20 (opis bez fundacji), 23 (tłumaczenie „Podgląd dokumentu”) i wersję ukraińską tych zmian.
2. **Język obsługi:** biuro prowadzi rozmowy z klientami po polsku i po ukraińsku (zatrudnia osoby dwujęzyczne). Trafia to tylko do JSON-LD (`knowsLanguage`, `availableLanguage`). Na stronie nie dodajemy nowego zdania.
3. **Profile społecznościowe** (pkt 21): biuro ich nie prowadzi. Ikony Facebook i LinkedIn usunięte ze stopki, w JSON-LD brak `sameAs`.
4. **Telefon główny:** 602 235 736 jako pierwszy wybór (tak ma być w wizytówce Google). W JSON-LD to `telephone`, 91 48 24 190 drugi. W stopce i na `/kontakt` 602 235 736 stoi przed 91 48 24 190, wszystkie numery zostają linkami `tel:`. Numer przycisku „Zadzwoń” w widżecie oddzwonienia bez zmian (`NEXT_PUBLIC_CALLBACK_CALL_NUMBER`). Do wiadomości specjalisty od pomiaru: w stopce pierwszy link `tel:` zmienia numer.
5. **Wizytówka Google:** https://maps.app.goo.gl/5mcixYfd5ZfvRMJZ6, czyli miejsce „Biuro Rachunkowe TEWU Sp. z o.o.” (CID `12155973943651028905`, 53.4136901, 14.5328745). Adres potwierdzony: Al. Powstańców Wielkopolskich 78A LU2, 70-110 Szczecin. Link w stopce (pkt 27), `hasMap` i `geo` w JSON-LD prowadzą do tej wizytówki. Przy okazji: mapa osadzona na `/kontakt` wskazywała punkt ok. 770 m dalej (53.40715, 14.53674) z identyfikatorem miejsca innym niż wizytówka. Mapa ustawiona na wizytówkę.
6. **Certyfikaty** (pkt 31): oba wydał Minister Finansów. Odznaka „Certyfikaty MF i SKwP” zmieniona na „Certyfikaty MF” („Сертифікати MF”), za Twoją zgodą.
7. **Obraz Open Graph** (pkt 10): brak gotowej grafiki, generowany przez `next/og` (PL i UK).
8. **`next/image`** (pkt 15): zostaję przy `<img>` z `loading="lazy"`, wymiarami i plikami AVIF. LCP to tekst, więc zysk z `srcset` jest mały, a `next/image` w obrazie Alpine wymaga `sharp` w wersji musl, czego nie da się sprawdzić bez budowy obrazu Dockera.

## Plan poprawek (kolejność wdrożenia, jeden commit na obszar)

1. **Moduł danych firmy** (pkt 17): jedno źródło dla stopki, Kontaktu, metadanych i JSON-LD. Bez zmian w wyglądzie, linkach `tel:`/`mailto:`, identyfikatorach i zdarzeniach `dataLayer`.
2. **Indeksacja i adresy** (pkt 3, 4, 18, 24): `robots.ts`, `X-Robots-Tag: noindex` poza `tewu.szczecin.pl`, przekierowanie `www` w `next.config.mjs`, porządek z `robots` na stronie 404.
3. **Metadane PL i UK** (pkt 5, 7, 11, 12, 13): wspólna funkcja budująca metadane strony (title, description, canonical, hreflang, Open Graph, Twitter), nowe teksty z tabeli, wersje ukraińskie.
4. **Obraz Open Graph** (pkt 10): `opengraph-image.tsx` dla obu języków.
5. **JSON-LD** (pkt 2): komponent z escapowaniem `<`, `AccountingService` + `WebSite` w layoutach, `Service` + `BreadcrumbList` + `FAQPage` na podstronach usługowych.
6. **Nagłówki, alt, linki** (pkt 14, 19, 22, 30): poziomy nagłówków, teksty alternatywne, opisowe linki „Więcej”, przełącznik języka jako link.
7. **Obrazy i wydajność** (pkt 15, 16, 28): `next/image` lub lazy loading, AVIF na certyfikatach, kontrast, ponowny Lighthouse.
8. **Linkowanie między usługami** (pkt 9): blok „Zobacz też”, po akceptacji.
9. **Widoczna treść po akceptacji TEWU** (pkt 6, 8, 20, 21, 23). Usunięcie tematu „Fundacja lub stowarzyszenie” z formularza oddzwonienia (pkt 20) jest już zdecydowane i nie czeka na TEWU.
10. **`scripts/seo-check.mjs`** + `pnpm seo:check` i uruchomienie na zbudowanej wersji. Skrypt wysyła `Host: tewu.szczecin.pl`. `<title>` liczy tylko w `<head>`, bo logo w SVG ma własne `<title>` (`TewuLogo.tsx`).
11. **Raport „Wdrożone”** w tym pliku.

## Po przepięciu domeny (13.10.2026)

Domenę przepięto na Coolify 13.10 ok. 16:00. Konfigurację odczytano przez Coolify MCP, a wyniki `curl` sprawdzono dwukrotnie: w osobnej sesji i ponownie przy dopisywaniu do raportu.

**Coolify (aplikacja `vove4fk84fv8vr6plcgwrgeo`):**

- [x] Preview URL Template: `{{pr_id}}.test-tewu-website.projekty-tewu.it` (pkt 1).
- [x] Domains: `https://tewu.szczecin.pl,https://www.tewu.szczecin.pl`, bez `test-tewu-website.projekty-tewu.it`.
- [x] Redirect: „non-www” (pkt 18).
- [x] `noindex_domains` puste, więc produkcja nie ma `noindex`.
- [x] DNS (nazwa.pl): `A tewu.szczecin.pl → 57.131.199.28` (Coolify), `www` to CNAME na domenę główną. Wildcard `*.test-tewu-website.projekty-tewu.it` zostaje dla podglądów.

**Przekierowania:** Coolify domyślnie zwracał 307 (middleware `redirectscheme`/`redirectregex` bez `permanent`). Dlatego w etykietach Traefika dodano:

- middleware `vove4fk84fv8vr6plcgwrgeo-to-https` (`redirectscheme`, `permanent=true`) na routerze `http-0`;
- middleware `1-vove4fk84fv8vr6plcgwrgeo-to-non-www` (`permanent=true`, `replacement=https://${2}`) na routerach `http-1` i `https-1`, więc `http://www…` przechodzi na docelowy adres w jednym skoku.

Wspólnego middleware `redirect-to-https` nie zmieniano, bo definiują go wszystkie aplikacje na serwerze (konflikt w Traefiku).

**Ryzyko:** w aplikacji wyłączono „Readonly labels”. Przy każdej zmianie domen w Coolify trzeba ręcznie poprawić te etykiety, inaczej przekierowania wrócą do 307 albo przestaną działać. Opisane w ADR 0003, sekcja 3b, z listą kontrolną w „Wymaganiach operacyjnych” (pkt 5).

**Wyniki `curl`:**

| Adres | Wynik |
| --- | --- |
| `https://tewu.szczecin.pl/`, `/uslugi/kpir`, `/uk` | 200, bez `X-Robots-Tag` i bez `meta robots`. `canonical` `/uslugi/kpir` → `https://tewu.szczecin.pl/uslugi/kpir` |
| `https://tewu.szczecin.pl/sitemap.xml` | 200, 26 adresów |
| `https://tewu.szczecin.pl/robots.txt` | 404 (do poprawy w planie, pkt 3) |
| `/nie-ma`, `/uk/nema` | 404 |
| `/uslugi/` | 308 → `/uslugi` |
| `http://tewu.szczecin.pl/uslugi` | 301 → `https://tewu.szczecin.pl/uslugi` |
| `https://www.tewu.szczecin.pl/uslugi` | 301 → `https://tewu.szczecin.pl/uslugi` |
| `http://www.tewu.szczecin.pl/uslugi/kpir?utm_source=test` | 301 → `https://tewu.szczecin.pl/uslugi/kpir?utm_source=test` (jeden skok, parametry zachowane, ważne dla Ads) |
| `https://test-tewu-website.projekty-tewu.it/` | 503 (`http`: 404), kopia produkcji niedostępna |
| `https://2.test-tewu-website.projekty-tewu.it/` (podgląd PR #2) | 401, wymaga hasła |

Certyfikaty Let's Encrypt są osobne dla `tewu.szczecin.pl` i `www.tewu.szczecin.pl` (ważne do 11.01.2027). Kompresja gzip działa.

**Wnioski dla planu:**

- Pkt 1 rozwiązany.
- Pkt 18 rozwiązany po stronie Coolify. Przekierowanie `www` w `next.config.mjs` będzie tylko zapasem, bo proxy przekierowuje wcześniej.
- Pkt 26 rozwiązany: wildcard `*.tewu.szczecin.pl` zwraca po przepięciu NXDOMAIN (wcześniej strona parkingowa nazwa.pl).
- Rekord DNS samej nazwy `test-tewu-website.projekty-tewu.it` można usunąć ręcznie (bez wildcardu).

## Wdrożone (13.10.2026, gałąź `seo/audyt-poprawki`)

Poprawki z planu (`docs/superpowers/plans/2026-10-13-seo-fixes.md`). Każda zaczynała się od testu, przeszła osobną recenzję zadania, a na końcu recenzję całej gałęzi. Nic nie zostało wdrożone na produkcję.

### Co zmieniono

| Obszar | Pkt audytu | Commit | Co |
| --- | --- | --- | --- |
| Dane firmy | 17, 27, Decyzje 4–5 | `c04c8b7` | Jeden moduł `src/lib/company.ts` (nazwa, adres w częściach, telefony, e-maile, godziny, NIP/REGON/KRS, konto, wizytówka, współrzędne, języki). W stopce i na `/kontakt` 602 235 736 przed 91 48 24 190. Link adresu w stopce prowadzi do wizytówki Google, mapa na `/kontakt` wskazuje wizytówkę (wcześniej punkt ok. 770 m dalej). Tytuł mapy po ukraińsku na `/uk/kontakt`. Usunięta nieużywana lista `SERVICES` |
| Indeksacja | 3, 4, 18, 24 | `1530ec5` | `robots.txt` z adresem mapy strony. `X-Robots-Tag: noindex` dla każdego hosta innego niż dokładnie `tewu.szczecin.pl` (test na prawdziwym `matchHas` z Next.js). Zapasowe 308 z `www`. Strona 404 ma jeden znacznik `noindex` zamiast dwóch |
| Metadane | 5, 7, 11, 12, 13 | `7ac0828` | Wspólna funkcja `buildPageMetadata`: title, description, canonical, hreflang, Open Graph, Twitter. Nowe teksty z tabeli propozycji (PL i UK) |
| Obraz do udostępnień | 10 | `871cae5` | Generowany przez `next/og` (1200×630, PL i UK), czcionka Inter (OFL) w repozytorium |
| JSON-LD | 2, Decyzje 2–5 | `94985d8` | `AccountingService` (`@id` `https://tewu.szczecin.pl/#firma`, telefon główny 602 235 736, drugi w `contactPoint`, `knowsLanguage` pl/uk, `geo` i `hasMap` z wizytówki) i `WebSite` na każdej stronie. `Service`, `BreadcrumbList`, `FAQPage` na podstronach usług. Bez `sameAs`, ocen, opinii i cen |
| Nagłówki, alt, linki | 14, 19, 22, 23, 30 | `1e31867`, `9fad19d` | Kolejność nagłówków bez zmiany wyglądu. Linki „Więcej” z nazwą usługi dla czytników ekranu. Teksty alternatywne ze słowników (PL i UK). Karta certyfikatu jako `<button>`, napis „Перегляд документа” na `/uk`. Przełącznik języka jako prawdziwe linki `<a href>`, bez wstępnego pobierania (pobranie bez ciasteczka zapamiętywało przekierowanie na `/uk`) |
| Obrazy i kontrast | 15, 16, 28 | `b55125f` | Wymiary, `decoding="async"`, `loading="lazy"` na wszystkich zdjęciach. Miniatury certyfikatów w AVIF (PNG jako zapas). Jaśniejszy tekst w sekcjach CTA |
| Treść zaakceptowana przez TEWU | 6, 8, 20, 21, 31 | `d62f684` | Linijka „Biuro rachunkowe w Szczecinie” w H1 strony głównej. Nowy podtytuł `/uslugi`. Usunięta karta „Doradztwo podatkowe” (9 usług). Opis pełnej księgowości bez fundacji. Usunięte ikony Facebook i LinkedIn. Odznaka „Certyfikaty MF” |
| Formularz oddzwonienia | 20 | `fda8849` | Usunięty temat „Fundacja lub stowarzyszenie”. Stare zgłoszenia z tym tematem dochodzą jako „Nie określono” (testy trasy API, potoku i powiadomień). ADR 0001 zaktualizowany |
| Zobacz też | 9 | `70570d5` | Blok z 2–3 powiązanymi usługami przed sekcją „Porozmawiajmy o Twojej firmie” na sześciu podstronach (PL i UK) |
| Kontrola | – | `b2239df`, `4185915` | `pnpm seo:check [adres]` (opis niżej) |
| Poprawki po recenzji gałęzi | – | `31b1b14`, `4f3ac9b` | Przekierowanie językowe pomija adresy obrazów i ikon (wcześniej obraz udostępnień polskich stron trafiał na 404 dla przeglądarek po ukraińsku). Bez `inLanguage` w `Service`, jeden adres `WebSite`. Kontrast: odznaka w hero, tekst telefonu w CTA, stopka |

Bez zmian URL-i i bez przekierowań poza zapasowym `www`. Bez nowych zależności i skryptów zewnętrznych.

### Pomiar (dataLayer, `tel:`, `mailto:`)

Porównałem HTML obecnej produkcji z buildem gałęzi (`/`, `/kontakt`, `/uslugi/kpir`, `/uk/kontakt`) i diff kodu:

- zdarzenia `dataLayer`, ich nazwy i pola, identyfikatory i atrybuty `data-*`: bez zmian (doszły tylko `data-size` i `data-full-width` w przełączniku języka);
- stopka: `tel:+48602235736`, `tel:+48914824190`, `tel:+48501482555` (wcześniej bez 602, pierwszy był 91 48 24 190);
- `/kontakt`, karta „Telefon biuro”: 602 235 736 przed 91 48 24 190. Pozostałe linki w tej samej kolejności;
- zdarzenie `callback_request_submit` nie dostanie już wartości `topic: 'fundacja'`.

**Do przekazania specjaliście od pomiaru:** jeśli wyzwalacze liczą kliknięcia w konkretny numer, w stopce pierwszy link to teraz 602 235 736. Temat „fundacja” znika z raportów zgłoszeń.

### Weryfikacja

- `pnpm test` (867 testów), `pnpm check:types`, `pnpm lint`, `pnpm test:e2e` (16): zielone.
- `pnpm build`: wszystkie strony statyczne, oba obrazy do udostępnień prerenderowane.
- `pnpm seo:check` na zbudowanej wersji: **26 stron, 0 błędów, 2 ostrzeżenia** (opisy polityki prywatności PL 98 i UK 99 znaków, teksty TEWU bez zmian).
- Lighthouse 12.8.2 (lokalny build, `tewu.szczecin.pl` zmapowany na serwer lokalny, HTTP):

| Strona | Wydajność przed → po | LCP przed → po | Dostępność przed → po | SEO |
| --- | --- | --- | --- | --- |
| `/` (mobile) | 85 → 89 | 4,3 s → 3,6 s | 93 → 100 | 100 |
| `/uslugi/kpir` (mobile) | 89 → 89 | 3,6 s → 3,6 s | 96 → 100 | 100 |
| `/uslugi/inkubator-spolek` (mobile) | 89 → 89 | 3,6 s → 3,6 s | 96 → 100 | 100 |
| `/` (desktop) | nie mierzono → 100 | nie mierzono → 0,8 s | nie mierzono → 100 | 100 |

„Dobre praktyki” 79 wynikają tylko z pomiaru przez HTTP na serwerze lokalnym (produkcja działa na HTTPS). LCP na mobile to nadal tekst w hero, opóźniony przez blokujący CSS i czcionkę (pkt 16). Dalsze kroki dopiero po danych terenowych z CrUX.

### `pnpm seo:check`

`pnpm seo:check [adres]`, domyślnie `http://127.0.0.1:3000`, na zbudowanej i uruchomionej aplikacji (tylko HTTP, więc lokalnie albo w kontenerze, nie na produkcji przez HTTPS). Wysyła `Host: tewu.szczecin.pl`, czyta `sitemap.xml` i dla każdego adresu sprawdza:
- status 200 i brak `noindex`;
- jeden `<title>` w `<head>` (≤ 60 znaków);
- opis (120–160 znaków, poza zakresem ostrzeżenie);
- jeden canonical równy adresowi z mapy;
- hreflang `pl`/`uk`/`x-default`;
- jeden H1;
- Open Graph i Twitter;
- poprawny JSON-LD: z `AccountingService`, a na usługach także z `Service`, `BreadcrumbList` i `FAQPage`; bez `Review`/`AggregateRating`;
- brak „doradztwa podatkowego” w metadanych, nagłówkach i JSON-LD;
- `alt` przy obrazach;
- przeskoki nagłówków (ostrzeżenie).

Dodatkowo sprawdza `robots.txt`, `noindex` dla obcego hosta, 308 z `www` z zachowaniem parametrów, 404 z jednym `noindex` i obraz do udostępnień (także z `Accept-Language: uk`). Przy błędzie kończy się kodem wyjścia 1.

### Teksty ukraińskie do sprawdzenia (tłumaczenie automatyczne)

- tytuły i opisy stron `/uk`, `/uk/o-nas`, `/uk/uslugi`, `/uk/outsourcing`, `/uk/certyfikaty`, `/uk/kontakt`, `/uk/uslugi/kpir`, `/uk/uslugi/inkubator-spolek` (`src/app/(uk)/uk/**/page.tsx`, `src/content/service-pages/uk/`);
- H1 „Бухгалтерське бюро в Щецині”, podtytuł `/uk/uslugi`, opis pierwszej karty, odznaka „Сертифікати MF”, „Перегляд документа”, tytuł mapy „Карта проїзду до бюро TEWU у Щецині” (`src/i18n/uk.ts`);
- teksty alternatywne zdjęć (`uk.ts`, klucze `imageAlt`, `teamImageAlt`, `meetingImageAlt`);
- blok „Дивіться також” i nazwy usług w nim (`servicePages.seeAlsoNames`);
- obraz do udostępnień: „Бухгалтерське бюро в Щецині”, „Бухгалтерія · Кадри та зарплата · KSeF” (`src/lib/og-image-meta.ts`);
- JSON-LD: nazwy usług `UK_SERVICE_TYPE` i okruszki „Головна”, „Послуги” (`src/lib/structured-data.ts`). Ryczałt ma tu nazwę „Спрощене оподаткування (ryczałt)”. W stopce i w bloku „Дивіться також” jest „Податок з продажу (ryczałt)”, co brzmi jak podatek od sprzedaży. Warto ujednolicić po decyzji osoby znającej ukraiński.

### Decyzje podjęte w trakcie (do Twojej weryfikacji)

- **Bez `next/image`:** zostały `<img>` z wymiarami, `lazy` i AVIF. LCP to tekst, a działania `sharp` w Alpine nie da się sprawdzić bez budowy obrazu Dockera.
- **Zdjęcie w hero ładuje się leniwie:** na telefonie jest ukryte. Na desktopie jest elementem LCP, ale LCP wynosi 0,8 s (Lighthouse desktop 100).
- **Tekst alternatywny zdjęcia w hero** opisuje to, co widać („Dokumenty podatkowe, telefon z kalkulatorem i długopis”), a nie „Wnętrze nowoczesnego biura”.
- **Miniatury certyfikatów mają pusty `alt`:** `cert.png` i `library.png` to zdjęcia stockowe (anglojęzyczny dyplom i biblioteka), a nie skany. Opis „Certyfikat Księgowy – imię i nazwisko” byłby nieprawdziwy, a imię i tytuł są w tekście karty.
- **Adresy obrazów do udostępnień** zawierają dopisek, który Next.js nadaje przy grupach tras (`/opengraph-image-35ziip`, `/uk/opengraph-image-1xrru2`). Są wpisane w `src/lib/og-image-meta.ts`, a pilnuje ich test w CI i `seo:check`. Jeśli po aktualizacji Next.js dopisek się zmieni, test pokaże nową wartość.
- **`inLanguage` usunięte z `Service`:** plan go wymagał, ale schema.org nie zna tej właściwości dla `Service`.

### Propozycje (nie wdrożone)

1. **Miniatury certyfikatów:** zamiast zdjęć stockowych miniatury prawdziwych certyfikatów (z PDF-ów, które już są na stronie). Do decyzji TEWU.
2. **Kontrast na `/kontakt`:** etykieta „Godziny otwarcia” na karcie `blue.6` ma 3,56:1. Zmiana tła karty na `brandBlue.6` da 5,17:1. To widoczna zmiana koloru.
3. **Opisy polityki prywatności** (PL 98, UK 99 znaków) są krótsze niż zalecane 120 znaków. To teksty TEWU, zostawione bez zmian.
4. **Porządki w kodzie:** nieużywane `REASONS_TO_TRUST`, `NAV_LINKS`, `COMPANY_NAME` w `src/constants.tsx`. NIP/REGON/KRS w tekstach polityki prywatności są wciąż wpisane w słownikach, a nie brane z `COMPANY`.
5. **ADR 0003:** ryzyko ręcznych etykiet Traefika dopisane (sekcja 3b i wymaganie operacyjne 5).

### Po wdrożeniu (lista kontrolna)

1. `curl -sI https://tewu.szczecin.pl/` i `curl -sI https://tewu.szczecin.pl/uslugi/kpir`: odpowiedź **bez** `x-robots-tag`. To jedyny dowód, że Traefik przekazuje aplikacji niezmieniony nagłówek `Host`. Jeśli pojawi się `noindex`, trzeba od razu wycofać wdrożenie.
2. Adres podglądu PR: `x-robots-tag: noindex`.
3. `curl -s https://tewu.szczecin.pl/robots.txt`: linia `Sitemap: https://tewu.szczecin.pl/sitemap.xml`.
4. Google Search Console: zgłosić `sitemap.xml`, sprawdzić stronę główną i jedną usługę w „Sprawdzaniu adresu URL”, a `/uslugi/kpir` w teście wyników z elementami rozszerzonymi.
5. Podgląd linku (np. w komunikatorze) dla `/` i `/uk`: obraz i tytuł.
6. Przekazać specjaliście od pomiaru zmiany z sekcji „Pomiar”.
