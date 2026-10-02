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

### 2. Autodetekcja języka i trwałość wyboru
- **Middleware:** weryfikacja nagłówka HTTP `Accept-Language`. Jeśli użytkownik ma język ukraiński (`uk`, `uk-UA`) lub rosyjski (`ru`, `ru-RU`) i nie posiada zapisanego ciasteczka preferencji, middleware automatycznie przekierowuje go na odpowiednik z `/uk` (zarówno na stronie głównej, jak i przy wejściu na podstrony).
- **Trwałe ciasteczko (`preferred_locale`):** ręczny wybór w przełączniku języka zapisuje ciasteczko funkcjonalne o długim czasie życia (1 rok). Wartość w ciasteczku ma bezwzględny priorytet nad nagłówkami przeglądarki, zapobiegając niepożądanym ponownym przekierowaniom.

### 3. Prezentacja przełącznika w UI
- **Format:** widoczne oznaczenie flagowe z kodem `🇵🇱 PL | 🇺🇦 UA`.
- **Lokalizacja:**
  - Desktop: obok przycisku CTA „Bezpłatna wycena” w pasku nawigacyjnym `Navbar`.
  - Mobile: w wysuwanym menu mobilnym (`Drawer`) w łatwo dostępnym miejscu.

### 4. Spójność domeny Call-back Widget
- Widżet call-back zostaje w pełni zlokalizowany na język ukraiński (formularz, wybory, komunikaty dynamiczne godzin pracy).
- Zgłoszenia z widżetu zawierają pole `locale: 'pl' | 'uk'`.
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

## Konsekwencje
- **Pozytywne:**
  - Przyjazne i bezproblemowe wejście dla klientów ukraińsko- i rosyjskojęzycznych.
  - Ochrona dotychczasowego SEO dla polskojęzycznych zapytań.
  - Wygodne przełączanie języka bez utraty kontekstu przeglądanej podstrony.
  - Zwiększona konwersja dzięki przygotowaniu zespołu biura do kontaktu w odpowiednim języku.
