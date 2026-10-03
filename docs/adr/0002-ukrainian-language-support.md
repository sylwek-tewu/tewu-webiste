# ADR 0002: Wdrożenie obsługi języka ukraińskiego (i18n)

## Status
Zaakceptowany (Accepted)

## Kontekst
Biuro Rachunkowe TEWU rozszerza swoją ofertę na klientów ukraińskojęzycznych prowadzących lub planujących działalność gospodarczą i spółki w Polsce. Strona musi zapewniać pełną obsługę języka ukraińskiego, automatycznie kierować użytkowników z przeglądarkami ukraińskimi i rosyjskimi na wersję ukraińską, jednocześnie gwarantując, że wersja polska pozostaje domyślna i jej dotychczasowa pozycja w wyszukiwarkach (SEO) nie ulegnie pogorszeniu.

## Decyzje architektoniczne i projektowe

### 1. Strategia adresów URL i Routing
- **Polski (domyślny):** bez zmian, pod dotychczasowymi ścieżkami bez prefiksu (`/`, `/uslugi`, `/kontakt`, `/o-nas` itd.). Zapobiega to jakimkolwiek wahaniom SEO i konieczności stosowania przekierowań 301 dla dotychczasowego ruchu.
- **Ukraiński:** prefiks `/uk` (`/uk`, `/uk/uslugi`, `/uk/kontakt`, `/uk/o-nas` itd.).
- **Slugi podstron:** zachowanie identycznych slugów w obu wersjach językowych pod prefiksem `/uk` (np. `/uslugi` ↔ `/uk/uslugi`). Umożliwia to bezpośrednie i bezbłędne przełączanie języka 1:1 na dowolnej podstronie bez konieczności mapowania słowników tras.
- **Osobny root layout dla każdego języka:** strony leżą w grupach tras `src/app/(pl)` i `src/app/(uk)/uk`, każda z własnym `layout.tsx`. Dzięki temu `<html lang>` jest poprawny już w HTML z serwera (wyszukiwarki, czytniki ekranu, tłumacz przeglądarki), strony pozostają statyczne, a każda strona ładuje tylko słownik swojego języka. Zmiana języka przechodzi między root layoutami, więc Next.js ładuje stronę docelową w całości.
- **Strona 404:** bez wspólnego root layoutu nieznane adresy obsługuje `src/app/global-not-found.tsx` (opcja `experimental.globalNotFound` w `next.config.mjs`). Proxy przekazuje język ścieżki w nagłówku `x-site-locale`, więc `/uk/...` dostaje ukraińską stronę 404, a reszta polską – obie w pełnym układzie strony.
- **SEO:** każda strona ma `canonical` oraz `alternates.languages` z `pl`, `uk` i `x-default` (wskazującym wersję polską). Oba root layouty ustawiają `metadataBase` (`SITE_URL` w `src/constants.tsx`), więc adresy w tych linkach są bezwzględne – wyszukiwarki mogą ignorować względne adresy hreflang.

### 2. Autodetekcja języka i trwałość wyboru
- **Middleware:** weryfikacja nagłówka HTTP `Accept-Language`. Jeśli użytkownik ma język ukraiński (`uk`, `uk-UA`) lub rosyjski (`ru`, `ru-RU`) i nie posiada zapisanego ciasteczka preferencji, middleware automatycznie przekierowuje go na odpowiednik z `/uk` (zarówno na stronie głównej, jak i przy wejściu na podstrony).
  - **Priorytet względem polskiego:** przekierowanie następuje tylko wtedy, gdy waga (`q`) ukraińskiego lub rosyjskiego jest co najmniej równa wadze polskiego. Przeglądarka ustawiona przede wszystkim na polski, z ukraińskim jako językiem zapasowym (np. `pl,uk;q=0.8`), zostaje na wersji polskiej. Przy równych wagach wygrywa ukraiński.
  - Przekierowanie (307) ma nagłówki `Vary: Accept-Language, Cookie` i `Cache-Control: private, no-store`, żeby żaden współdzielony cache nie podał go innym odwiedzającym.
- **Trwałe ciasteczko (`preferred_locale`):** ręczny wybór w przełączniku języka zapisuje ciasteczko funkcjonalne o długim czasie życia (1 rok). Wartość w ciasteczku ma bezwzględny priorytet nad nagłówkami przeglądarki, zapobiegając niepożądanym ponownym przekierowaniom. Ciasteczko z nieobsługiwaną wartością jest ignorowane (działa wtedy autodetekcja).

### 3. Prezentacja przełącznika w UI
- **Format:** widoczne oznaczenie flagowe z kodem `🇵🇱 PL | 🇺🇦 UA`.
- **Lokalizacja:**
  - Desktop: obok przycisku CTA „Bezpłatna wycena” w pasku nawigacyjnym `Navbar`.
  - Mobile: wyłącznie w wysuwanym menu mobilnym (`Drawer`) w łatwo dostępnym miejscu.

### 4. Spójność domeny Call-back Widget
- Widżet call-back zostaje w pełni zlokalizowany na język ukraiński (formularz, wybory, komunikaty dynamiczne godzin pracy).
- Zgłoszenia z widżetu zawierają pole `locale: 'pl' | 'uk'`.
- Błędy `POST /api/callback` mają stały kod `code` (`invalid_request`, `phone_required`, `phone_invalid`, `slot_invalid`, `unavailable`, `delivery_failed`, `unexpected`) obok polskiego komunikatu `error`. Formularz pokazuje tekst ze słownika dla danego kodu, więc odwiedzający nie widzi komunikatów w innym języku niż strona. Dotyczy to również ekranów ładowania i błędu wczytania formularza.
- Treść powiadomienia e-mail oraz ping w Telegramie zawierają wyróżnik językowy `[Język: Ukraiński / UA]`, umożliwiając pracownikom biura natychmiastową identyfikację preferowanego języka rozmowy przed wybraniem numeru do klienta.

### 5. Zakres tłumaczeń i polityka prawna
- Wszystkie podstrony ofertowe, informacyjne i interfejsowe podlegają pełnemu tłumaczeniu na język ukraiński.
- Podstrona `/polityka-prywatnosci` zostaje przetłumaczona na język ukraiński z klauzulą, że w sprawach interpretacyjnych i prawnych wiążący pozostaje oryginał w języku polskim.
- Pliki PDF z certyfikatami urzędowymi (Ministerstwo Finansów, SKwP) pozostają w języku polskim; interfejs i opisy certyfikatów podlegają tłumaczeniu.

### 6. Format danych kontaktowych i adresowych
- Dane kontaktowe biura (telefon `+48 91 48 24 190`, e-mail `biuro@tewu.szczecin.pl`) są identyczne w obu wersjach językowych, z zachowaniem międzynarodowego formatu numeru.
- Oficjalna nazwa spółki („Biuro Rachunkowe TEWU Sp. z o.o.”) oraz adres siedziby („Al. Powstańców Wielkopolskich 78A LU2, 70-110 Szczecin”) pozostają w alfabecie łacińskim, zapewniając zgodność z nawigacją GPS (Google Maps), pocztą oraz rejestrami KRS/CEIDG. Etykiety i nagłówki sekcji są przetłumaczone na język ukraiński.

### 7. Informacja o strefie czasowej
- W ukraińskich komunikatach dotyczących godzin pracy biura oraz slotów oddzwonienia w widżecie call-back dodana zostaje adnotacja „(за польським часом)”, eliminująca ryzyko nieporozumień z uwagi na różnicę 1 godziny pomiędzy Polską a Ukrainą.

## Ryzyka

- **Eksperymentalna strona 404:** `global-not-found.tsx` działa tylko z flagą `experimental.globalNotFound` (Next.js 16.1). Flaga może zmienić działanie lub zniknąć w kolejnej wersji Next.js, a strona zależy też od tego, czy runtime Netlify (`@netlify/plugin-nextjs`) przekazuje nagłówki ustawione przez proxy (`x-site-locale`). Przy każdej aktualizacji Next.js lub wtyczki Netlify, a także przed pierwszym wdrożeniem, trzeba na podglądzie wdrożenia sprawdzić `/nie-ma` i `/uk/nema`: status 404, `noindex`, pełny układ strony i właściwy język. Gdy flaga przestanie działać, wariantem awaryjnym jest wspólny root layout z językiem odczytywanym z nagłówka (strony stałyby się dynamiczne).

## Konsekwencje
- **Pozytywne:**
  - Przyjazne i bezproblemowe wejście dla klientów ukraińsko- i rosyjskojęzycznych.
  - Ochrona dotychczasowego SEO dla polskojęzycznych zapytań.
  - Wygodne przełączanie języka bez utraty kontekstu przeglądanej podstrony.
  - Zwiększona konwersja dzięki przygotowaniu zespołu biura do kontaktu w odpowiednim języku.
