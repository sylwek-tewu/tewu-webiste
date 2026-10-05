# ADR 0004: Podstrony usługowe (strony docelowe reklam)

## Status
Zaakceptowany (Accepted)

## Kontekst
Reklamy Google Ads mają kierować na podstronę odpowiadającą wyszukiwanej frazie, a nie na stronę główną. Powstaje sześć podstron usługowych w wersji polskiej i ukraińskiej. Adresy tych stron trafiają do kampanii, więc ich późniejsza zmiana oznacza przekierowania 301 i edycję reklam. Treść powstaje etapami: najpierw szkic, potem wersja oparta na odpowiedziach TEWU (`docs/pytania-do-tewu-podstrony-uslugowe.md`).

## Decyzje

### 1. Adresy
- Podstrony leżą pod `/uslugi/<slug>`, a wersje ukraińskie pod `/uk/uslugi/<slug>` z tym samym slugiem (ADR 0002 §1).
- Slugi: `pelna-ksiegowosc`, `kpir`, `ryczalt`, `kadry-i-place`, `ksef`, `inkubator-spolek`. Bez „Szczecin” w adresie – miasto niosą H1, `title` i treść.
- Jedna trasa dynamiczna na język (`src/app/(pl)/uslugi/[slug]`, `src/app/(uk)/uk/uslugi/[slug]`) z `generateStaticParams` i `dynamicParams = false`: strony są statyczne, a nieznany slug daje 404.
- Lista slugów, ścieżki, tematy widżetu i polskie nazwy dla powiadomień biura są w jednym rejestrze `src/lib/service-pages.ts`, bez treści stron, żeby mógł go używać kod kliencki.

### 2. Model treści
- Treść podstron jest w typowanych modułach `src/content/service-pages/{pl,uk}/<slug>.ts`, a nie w słownikach i18n. Słownik trafia do bundla każdej strony, a sześć podstron z FAQ to dużo tekstu.
- Serwerowy `page.tsx` przekazuje treść jednej podstrony do wspólnego komponentu `ServiceLandingPage`. Dodanie podstrony to wpis w rejestrze i plik treści w każdym języku.
- Etykiety wspólne (CTA, nagłówki sekcji ceny, pasek zaufania) i krótkie nazwy podstron są w słowniku (`servicePages`).
- Widełki cenowe są polem opcjonalnym. Sekcja z kwotami pokazuje się tylko wtedy, gdy pole jest wypełnione.
- FAQ jest w natywnych elementach `<details>`, żeby odpowiedzi były w HTML także po zwinięciu. Bez danych strukturalnych `FAQPage` – Google pokazuje dziś FAQ rich results prawie wyłącznie stronom rządowym i medycznym.

### 3. Atrybucja leadów
- Każde otwarcie widżetu call-back na podstronie usługowej (dowolnym przyciskiem) dostaje `landingPage` wyliczone ze ścieżki w `CallbackProvider`. `source` dalej mówi, który przycisk kliknięto (CTA podstrony to `service`).
- Formularz ma z góry ustawiony temat podstrony, ale można go zmienić. Wybór odwiedzającego ma pierwszeństwo przed podpowiedzią do czasu wysłania formularza.
- `POST /api/callback` sprawdza `landingPage` według rejestru. Nieznana wartość jest pomijana i nie odrzuca zgłoszenia.
- `landingPage` trafia do e-maila, do pingu w Telegramie (nazwa podstrony z rejestru to nie są dane osobowe), do `callback_request_submit` w `dataLayer` (`landing_page`) i do bufora awaryjnego (kolumna `landing_page`, migracja `0001_add_landing_page`).

### 4. Nawigacja i SEO
- Menu główne: „Inkubator” po „Usługi” – krótka etykieta, bo w menu brakuje miejsca. Pozostałe podstrony linkuje stopka, karty na `/uslugi` i karty na stronie głównej.
- Siódma pozycja nie mieściła się w jednym wierszu nagłówka (80 px wysokości): wersja ukraińska potrzebowała ok. 1366 px przy kontenerze 1288 px, polska łamała się poniżej ok. 1180 px. Dlatego:
  - menu desktopowe pokazuje się od `lg` (1200 px), a poniżej jest burger z szufladą: na telefonach na cały ekran, od `sm` (768 px) jako panel 400 px z prawej. „Desktop” w ADR 0002 §3 (przełącznik języka obok CTA) oznacza więc teraz ≥ 1200 px;
  - odstęp między linkami to `md` zamiast `lg`;
  - nazwa biura obok logo jest ukryta między `lg` a `xl` (1200–1407 px) w obu językach. W polskim by się zmieściła, ale nagłówek ma wyglądać tak samo w obu wersjach;
  - przyciski „Bezpłatna wycena” w nagłówku i pływający przycisk widżetu w wersji ukraińskiej to „Безкоштовна оцінка” (bez „вартості”), tak jak CTA podstron.
  Każda nowa pozycja menu lub dłuższa etykieta wymaga ponownego sprawdzenia nagłówka w obu językach przy 1200, 1280, 1408 i 1440 px. Najciaśniej jest po ukraińsku przy 1408 px, gdy wraca nazwa biura (zapas ok. 48 px). Test `e2e/layout.spec.ts` sprawdza wysokość nagłówka i brak przewijania w bok.
- `src/app/sitemap.ts` obejmuje wszystkie strony w obu językach z alternatywami hreflang.

## Konsekwencje
- Zmiana slugu po starcie kampanii wymaga przekierowania 301 ze starego adresu i aktualizacji reklam.
- Raporty Google Ads/GTM mogą rozbijać konwersje z widżetu według `landing_page`.
- Kliknięcia w numer telefonu nie są na razie mierzone (osobne zadanie).
- Next 16 przy `dynamicParams = false` loguje każde żądanie nieznanego slugu jako `Error: Internal: NoFallbackError`, choć odpowiedź to poprawne 404. Boty sprawdzające `/uslugi/*` mogą więc zaśmiecać logi błędów; jeśli logi zasilają alerty, ten komunikat trzeba odfiltrować.

## Przed wydaniem
- Gałąź z podstronami nie trafia na produkcję przed odpowiedziami TEWU i akceptacją treści.
- **Treść ukraińską musi przed wydaniem sprawdzić osoba z TEWU.** Wersje ukraińskie są tłumaczeniem szkicu i mogą zawierać błędy terminologiczne.

## Odchylenia od pierwotnego planu implementacji
- **Kontrast przycisku CTA w nagłówku Hero (`ServiceLandingPage`):** Pierwotny plan zakładał użycie klasy `layoutClasses.primaryButton` (kolor tła `slate.9`). Ponieważ sekcja Hero ma również ciemne tło `slate.9`, ciemny przycisk na ciemnym tle zlewał się z otoczeniem (brak kontrastu obrysu). Podczas implementacji Task 6 zamieniono stylizację przycisku w Hero na brandowy błękit (`variant="filled"`: jawny wariant nadpisuje domyślny `slate.9` z motywu i daje kolor po najechaniu; prop `bg` ustawiał tło inline i wyłączał ten kolor), co zapewnia wymagany kontrast dostępności (a11y) i wyrazistą hierarchię wizualną głównego CTA.
