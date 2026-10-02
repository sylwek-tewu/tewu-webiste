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
