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
| 20 | Opis karty pełnej księgowości wymienia „fundacje i stowarzyszenia”, które według ustaleń z 12.10 nie są grupą docelową | niska | `src/i18n/pl.ts`, `uk.ts` (strona główna i `/uslugi`). Nieużywana kopia listy usług w `constants.tsx` (`SERVICES`) do usunięcia przy okazji | Usunąć z opisu. **Do akceptacji TEWU**. Temat „Fundacja lub stowarzyszenie” w formularzu oddzwonienia zostaje, bo jego zmiana dotknęłaby danych zgłoszeń (zasada 1) | tak |
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
| `/uk` | obsługa księgowa po ukraińsku w Szczecinie | Бухгалтерське бюро TEWU \| Польща, Щецин | Бухгалтерія без стресу. | jak `/`: pkt 6. Zdanie o rozmowach po ukraińsku dopiero po potwierdzeniu przez TEWU (Do decyzji, pkt 2) |

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
| Telefon główny | 91 48 24 190 (`+48914824190`), w stopce i jako numer widżetu |
| Inne telefony | 602 235 736 (sekretariat), 501 482 555 (komórkowy, w stopce i na podstronach usługowych), 886 543 973 (komórkowy) |
| E-mail | biuro@tewu.szczecin.pl, sw@tewu.szczecin.pl |
| Godziny | pon–pt 8:00–16:00 |
| NIP / REGON / KRS | 9552249417 / 320601499 / 0000320281 |

## Do decyzji (Ty lub TEWU)

1. **Zmiany widocznej treści** (pkt 6, 8, 9, 20, 21, 23): akceptacja propozycji albo wskazanie innych tekstów.
2. **`knowsLanguage: uk` w JSON-LD:** prompt zakłada obsługę po ukraińsku, a ukraińska polityka prywatności obiecuje oddzwonienie „відповідною мовою”. Jawnego zdania „rozmawiamy po ukraińsku” na stronie nie ma, a TEWU nie wymieniło tego w odpowiedzi A9. Czy potwierdzasz, że biuro prowadzi rozmowy po ukraińsku?
3. **Profile społecznościowe** (pkt 21): adresy albo usunięcie ikon.
4. **Obraz Open Graph** (pkt 10): generowany z logo i nazwy firmy przez `next/og`, czy masz gotową grafikę 1200×630?
5. **`next/image`** (pkt 15): wymaga `sharp` w obrazie Alpine. Sprawdzę to przy budowie obrazu Dockera. Jeśli nie zadziała, zostanę przy `<img>` z `loading="lazy"`, wymiarami i plikami AVIF.

## Plan poprawek (kolejność wdrożenia, jeden commit na obszar)

1. **Moduł danych firmy** (pkt 17): jedno źródło dla stopki, Kontaktu, metadanych i JSON-LD. Bez zmian w wyglądzie, linkach `tel:`/`mailto:`, identyfikatorach i zdarzeniach `dataLayer`.
2. **Indeksacja i adresy** (pkt 3, 4, 18, 24): `robots.ts`, `X-Robots-Tag: noindex` poza `tewu.szczecin.pl`, przekierowanie `www` w `next.config.mjs`, porządek z `robots` na stronie 404.
3. **Metadane PL i UK** (pkt 5, 7, 11, 12, 13): wspólna funkcja budująca metadane strony (title, description, canonical, hreflang, Open Graph, Twitter), nowe teksty z tabeli, wersje ukraińskie.
4. **Obraz Open Graph** (pkt 10): `opengraph-image.tsx` dla obu języków.
5. **JSON-LD** (pkt 2): komponent z escapowaniem `<`, `AccountingService` + `WebSite` w layoutach, `Service` + `BreadcrumbList` + `FAQPage` na podstronach usługowych.
6. **Nagłówki, alt, linki** (pkt 14, 19, 22, 30): poziomy nagłówków, teksty alternatywne, opisowe linki „Więcej”, przełącznik języka jako link.
7. **Obrazy i wydajność** (pkt 15, 16, 28): `next/image` lub lazy loading, AVIF na certyfikatach, kontrast, ponowny Lighthouse.
8. **Linkowanie między usługami** (pkt 9): blok „Zobacz też”, po akceptacji.
9. **Widoczna treść po akceptacji TEWU** (pkt 6, 8, 20, 21, 23).
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

**Ryzyko:** w aplikacji wyłączono „Readonly labels”. Przy każdej zmianie domen w Coolify trzeba ręcznie poprawić te etykiety, inaczej przekierowania wrócą do 307 albo przestaną działać. Warto dopisać to do ADR 0003.

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
