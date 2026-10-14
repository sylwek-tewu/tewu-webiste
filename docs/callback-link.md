# Callback Link – link otwierający formularz oddzwonienia

**Callback Link** to adres strony serwisu z parametrem `callback`. Po wejściu w taki adres strona otwiera się z już rozwiniętym formularzem „Bezpłatna wycena – oddzwonimy”, bez klikania przycisku. Służy do udostępniania w reklamach, mailach, SMS-ach, kodach QR i social mediach.

## Gotowe adresy

| Co się otwiera | Adres |
|---|---|
| Strona główna, polska | `https://tewu.szczecin.pl/?callback` |
| Strona główna, ukraińska | `https://tewu.szczecin.pl/uk?callback` |
| Podstrona usługowa, np. KPiR | `https://tewu.szczecin.pl/uslugi/kpir?callback` |
| Podstrona usługowa, ukraińska | `https://tewu.szczecin.pl/uk/uslugi/kpir?callback` |

Parametr działa na każdej podstronie serwisu. Do reklam dla konkretnej usługi warto dać adres jej podstrony usługowej: zgłoszenie dostanie wtedy w mailu także pole „Podstrona usługowa”.

## Zasady

- **Sama obecność parametru wystarcza.** Wartość nie ma znaczenia (`?callback`, `?callback=1`). Wartość jest zarezerwowana na ewentualne późniejsze wstępne wypełnienie tematu rozmowy.
- **Pozostałe parametry zostają.** Można dopisać UTM-y i `gclid`, np. `https://tewu.szczecin.pl/?utm_source=google&utm_medium=cpc&callback`. Po otwarciu formularza z paska adresu znika tylko `callback`, a UTM-y i `gclid` zostają dla analityki.
- **Odświeżenie nie otwiera formularza ponownie.** Parametr jest usuwany z adresu zaraz po otwarciu, więc klient, który zamknął formularz i odświeżył stronę, nie zobaczy go znowu.
- **Wersja językowa.** Klient z ukraińską przeglądarką, który wejdzie w adres polski, zostanie przekierowany na `/uk`, z zachowaniem parametrów. Do kampanii ukraińskich używaj adresów `/uk…`.
- **Wyszukiwarki.** Strony mają adres kanoniczny bez parametrów zapytania, więc `?callback` nie tworzy osobnej podstrony w indeksie.

## Co widzi biuro

Zgłoszenie z Callback Linku ma w mailu i w pingu na Telegramie miejsce wywołania:

> Udostępniony link (klient wszedł z adresu otwierającego formularz, np. z reklamy, maila lub QR)

Zgłoszenia z przycisków na stronie mają inne etykiety, np. „Przycisk „Bezpłatna wycena” w górnym menu strony”. Pełna lista jest w `CALLBACK_SOURCE_LABELS` w `src/lib/callback/types.ts`.

W analityce (`window.dataLayer`) zdarzenia `callback_widget_open` i `callback_request_submit` mają `source: 'link'`.

## Dla programistów

- Parametr odczytuje `CallbackProvider` (`src/components/callback-widget/CallbackContext.tsx`) po stronie klienta, w efekcie po załadowaniu strony. Strony pozostają statyczne.
- Nowa wartość źródła: `link` w `CALLBACK_SOURCES`.
- Słownictwo: hasło **Callback Link** w `CONTEXT.md`.
