# TEWU Website & Lead Generation

Strona internetowa Biura Rachunkowego TEWU, prezentująca ofertę usług księgowych, kadrowo-płacowych i doradczych oraz obsługująca pozyskiwanie zapytań (leadów) poprzez formularze i widżet call-back.

## Language

**Locale**:
Aktywny kontekst językowy serwisu – obecnie polski (`pl`, domyślny) lub ukraiński (`uk`).
_Avoid_: Język systemu, dialekt

**Preferred Locale**:
Jawna preferencja językowa użytkownika zapisana w trwałym ciasteczku funkcjonalnym (`preferred_locale`), mająca bezwzględny priorytet nad nagłówkami przeglądarki.
_Avoid_: Ustawienie sesji, stan lokalny

**Browser Locale Detection**:
Automatyczne wykrywanie preferencji językowej w middleware na podstawie nagłówka HTTP `Accept-Language` (mapujące `uk` i `ru` na wersję ukraińską `/uk`), aktywne wyłącznie przy braku zapisanego ciasteczka preferencji.
_Avoid_: Detekcja po IP, geolokalizacja

**Language Switcher**:
Komponent przełącznika w nagłówku (oraz menu mobilnym) w formacie `🇵🇱 PL | 🇺🇦 UA`, umożliwiający natychmiastową zmianę wersji językowej z zachowaniem bieżącej podstrony.
_Avoid_: Flagi narodowe, selektor państw

**Callback Lead Locale**:
Atrybut zgłoszenia z widżetu call-back (`pl` lub `uk`) przekazywany do powiadomień e-mail i Telegram, informujący konsultantów biura o preferowanym języku rozmowy klienta.
_Avoid_: Pochodzenie klienta, język przeglądarki leada

## Service Pages

**Service Page**:
Podstrona usługowa pod `/uslugi/<slug>` (i `/uk/uslugi/<slug>`), będąca stroną docelową reklam dla jednej usługi: pełna księgowość, KPiR, ryczałt, kadry i płace, KSeF, Inkubator spółek z o.o.
_Avoid_: „landing” jako nazwa samej podstrony, lejek, mikrostrona (pole `landingPage` i termin „Landing Page Attribution” zostają)

**Inkubator spółek**:
Usługa TEWU dla zakładanych spółek z o.o., jedyna podstrona usługowa z linkiem w menu głównym (etykieta „Inkubator”). Obejmuje informacje pomagające zdecydować o formie działalności, założenie spółki z notariuszem (KRS lub S24), adres siedziby oraz wsparcie na starcie (doradztwo, w razie potrzeby lokal). „Inkubacja” trwa zwykle do trzech miesięcy, potem spółka przechodzi na stałą obsługę księgową.
_Avoid_: Akcelerator, start-up

**Landing Page Attribution**:
Przypisanie zgłoszenia call-back do podstrony usługowej, na której otwarto widżet (`landingPage`), niezależnie od przycisku, którym go otwarto (`source`).
_Avoid_: Źródło zgłoszenia, UTM

## Callback & Lead Intake

**Callback Lead**:
Zgłoszenie prośby o kontakt telefoniczny z widżetu call-back, zawierające numer telefonu w formacie E.164, preferowaną porę kontaktu, opcjonalny temat rozmowy, źródło wywołania, język, opcjonalną podstronę usługową oraz unikalny identyfikator.
_Avoid_: Rekord, zapytanie ofertowe, wiersz bazy, formularz kontaktowy

**Callback Commitment**:
Obietnica terminu kontaktu składana klientowi na podstawie wybranego slotu, bieżącego czasu w strefie `Europe/Warsaw`, dni roboczych oraz godzin pracy biura.
_Avoid_: Czas odpowiedzi, SLA, slot oddzwonienia

**Office Hours & Calendar**:
Zasady wyliczania dostępności biura i terminów kontaktu w oparciu o strefę `Europe/Warsaw`, polskie dni ustawowo wolne od pracy oraz dodatkowe dni zamknięte.
_Avoid_: Moduł świąt, biblioteka dat

**Emergency Outbox Buffer**:
Trwały bufor zgłoszeń oparty o lokalną bazę SQLite na wolumenie serwera, zapewniający transakcyjne kolejkowanie z szyfrowaniem AES-256-GCM przy awarii bezpośredniej wysyłki poczty e-mail.
_Avoid_: Kolejka zadań, baza tymczasowa

