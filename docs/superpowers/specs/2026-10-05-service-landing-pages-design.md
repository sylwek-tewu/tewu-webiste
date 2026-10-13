# Podstrony usługowe (strony docelowe reklam) – specyfikacja

Data: 2026-10-05 · Gałąź: `feat/service-landing-pages` · Źródło: sesja grillingu z właścicielem projektu.

## Cel

Reklamy (Google Ads) kierujemy na podstronę odpowiadającą wyszukiwanej frazie, a nie na stronę główną. Powstaje sześć podstron usługowych w wersji polskiej i ukraińskiej. Pełną treść napiszemy po odpowiedziach TEWU na pytania z `docs/pytania-do-tewu-podstrony-uslugowe.md`; teraz powstaje szkic bez wymyślonych faktów.

Gałąź nie trafi na produkcję, dopóki TEWU nie odpowie na pytania i nie zaakceptuje treści. Dlatego **nie** stosujemy `noindex` ani flagi szkicu.

## Podstrony i adresy

| Slug | PL | UK | Temat widżetu |
|---|---|---|---|
| `pelna-ksiegowosc` | `/uslugi/pelna-ksiegowosc` | `/uk/uslugi/pelna-ksiegowosc` | `spolka` |
| `kpir` | `/uslugi/kpir` | `/uk/uslugi/kpir` | `dzialalnosc` |
| `ryczalt` | `/uslugi/ryczalt` | `/uk/uslugi/ryczalt` | `dzialalnosc` |
| `kadry-i-place` | `/uslugi/kadry-i-place` | `/uk/uslugi/kadry-i-place` | `kadry-place` |
| `ksef` | `/uslugi/ksef` | `/uk/uslugi/ksef` | `inne` |
| `inkubator-spolek` | `/uslugi/inkubator-spolek` | `/uk/uslugi/inkubator-spolek` | `spolka` |

Zmiana adresu po starcie kampanii oznacza przekierowania 301 i edycję reklam, dlatego decyzję zapisujemy w ADR 0004. Wersje UK mają ten sam slug pod `/uk` (ADR 0002).

## Zawartość każdej podstrony (w tej kolejności)

1. Sekcja nagłówkowa: H1 z nazwą usługi i „Szczecin” (UK: „Щецин”), krótki lead, przycisk „Bezpłatna wycena – oddzwonimy” (otwiera widżet call-back) oraz główny numer `91 48 24 190` jako klikalny link `tel:`.
2. Pasek zaufania: dane już publikowane na stronie głównej (25+ lat, 150+ firm), polisa OC, certyfikaty MF i SKwP z linkiem do `/certyfikaty`.
3. Dla kogo jest usługa.
4. Zakres obsługi.
5. Cena: od czego zależy i jak wygląda wycena. Orientacyjne widełki są polem opcjonalnym, a sekcja z kwotami pojawia się tylko wtedy, gdy pole jest wypełnione. Na razie żadna podstrona nie ma widełek.
6. Trzy kroki z tytułem ustawianym per strona. Domyślnie to przejście z innego biura, a Inkubator ma na razie wariant „Jak zacząć w 3 krokach” (do potwierdzenia przez TEWU).
7. FAQ: od 4 do 6 pytań.
8. Końcowe CTA: ten sam przycisk i numer telefonu.

Bez JSON-LD (FAQ rich results Google pokazuje dziś prawie wyłącznie stronom rządowym i medycznym). Bez przyklejonego paska CTA na mobile, bo tę rolę pełni pływający przycisk widżetu.

## Model treści

- Treść podstron trzymamy w typowanych modułach `src/content/service-pages/{pl,uk}/<slug>.ts`, a nie w słownikach i18n (słownik trafia do bundla każdej strony).
- Serwerowy `page.tsx` pobiera treść i przekazuje ją jako props do jednego wspólnego komponentu `ServiceLandingPage`.
- Etykiety wspólne dla wszystkich podstron (tekst CTA, „Od czego zależy cena”, pasek zaufania, końcowe CTA) oraz krótkie nazwy podstron (linki w stopce) trafiają do słownika (`servicePages`).
- Szkic nie zawiera wymyślonych faktów: żadnych kwot, liczb ani obietnic terminów spoza tego, co strona już publikuje albo co wynika wprost z przepisów.

## Nawigacja

- Menu główne: pozycja „Inkubator” (UK: „Інкубатор”) zaraz po „Usługi”, prowadząca do `/uslugi/inkubator-spolek`. Krótka etykieta mieści się w menu, a pełną nazwę niesie H1. W pytaniach do TEWU pytamy, czy ta etykieta im odpowiada, i wyjaśniamy, dlaczego nie podajemy pełnej nazwy.
- Stopka, kolumna „Nawigacja”: link Inkubatora pojawia się automatycznie (pochodzi z `nav.links`). Kolumny dzielą się po 4 pozycje.
- Stopka, kolumna „Usługi”: 6 podstron i „Outsourcing BPO”.
- `/uslugi`: karty z odpowiednikiem linkują do podstron. Dochodzą 2 karty (KSeF, Inkubator), razem 10, ostatni rząd na desktopie jest niepełny – ocenimy to na podglądzie.
- Strona główna: przycisk „Więcej” na kartach usług prowadzi do odpowiedniej podstrony.

## Widżet call-back i atrybucja leadów

- Każde otwarcie widżetu na podstronie usługowej (przycisk w treści, pływający przycisk, przycisk w nagłówku) zapisuje w leadzie `landingPage` (slug), wyliczone ze ścieżki w `CallbackProvider`. `source` dalej mówi, który przycisk kliknięto. CTA na podstronie otwiera widżet ze źródłem `service`.
- Temat formularza jest ustawiony z góry według tabeli wyżej, przy każdym otwarciu na podstronie usługowej, ale można go zmienić. Gdy użytkownik raz wybierze temat sam, jego wybór obowiązuje do wysłania formularza.
- API sprawdza `landingPage` według listy dozwolonych slugów (nieznana wartość jest pomijana, nie odrzuca zgłoszenia).
- `landingPage` trafia do e-maila, do pingu w Telegramie (slug i nazwa podstrony to nie są dane osobowe), do zdarzenia `callback_request_submit` w `dataLayer` (`landing_page`, `'none'` gdy brak) oraz do bufora awaryjnego (nowa kolumna `landing_page`, migracja drizzle).
- Bez śledzenia kliknięć w numer telefonu – to osobne zadanie.

## SEO

- Każda podstrona ma `title`, `description`, `canonical` oraz `alternates.languages` (`pl`, `uk`, `x-default` → PL), tak jak pozostałe strony.
- Nowy `src/app/sitemap.ts` obejmuje wszystkie strony serwisu w obu językach, z alternatywami hreflang.

## Dokumentacja

- `docs/pytania-do-tewu-podstrony-uslugowe.md`: po polsku, nietechnicznie. Pytania pogrupowane na wspólne i per podstrona, przy każdym „dlaczego pytamy” i miejsce na odpowiedź.
- `CONTEXT.md`: pojęcia **Strona usługowa** (Service Page), **Inkubator spółek**, **Atrybucja podstrony** (Landing Page Attribution).
- ADR 0004: adresy, model treści, atrybucja leadów. Zawiera notę, że przed wydaniem treść ukraińską musi sprawdzić osoba z TEWU.

## Poza zakresem

- Śledzenie kliknięć w `tel:` (osobne zadanie).
- `robots.txt` z odnośnikiem do sitemap (do rozważenia osobno; sitemap można zgłosić w Google Search Console).
- Ostateczna treść podstron – po odpowiedziach TEWU.
