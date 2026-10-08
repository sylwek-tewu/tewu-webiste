# HANDOFF – widżet call-back „Bezpłatna wycena – oddzwonimy” (TEWU)

Źródło: `strategia_marketingu_tewu_v3.html` (rozdz. 5.1, 7.1, 10) • repo: `sylwek-tewu/tewu-webiste` • strona: https://tewu.szczecin.pl/
Data: 2026-10-02 • Wykonawca: Antigravity CLI / Gemini 3.8 Flash • Termin wg harmonogramu: prace na stronie 12–23 X 2026

## 1. Cel i dlaczego
Dziś przyciski „Bezpłatna wycena” (menu, hero) prowadzą na `/kontakt`, a tam nie ma formularza – tylko telefony i e-mail, biuro pracuje pn–pt 8:00–16:00. Poza godzinami nie da się zostawić prośby o kontakt. To pierwszy priorytet przed kampanią Google Ads (miękki start ok. 16 XI, sezon od 1 XII). Widżet jest główną konwersją kampanii („prośba o oddzwonienie”).
Wycena zostaje indywidualna i powstaje w rozmowie – strona nie liczy ceny i nie zbiera szczegółów firmy.

## 2. Stan obecny (zweryfikowany)
- Stack wg `package.json`: Next ^16.1.6 (App Router), React 19.2, Mantine 8.3.x, TypeScript ~5.8, pnpm, lucide-react, pdfjs-dist. README jest nieaktualne (Next 15 / Mantine 7) – ufać `package.json`.
- Struktura: `src/app`, `src/components`, `src/constants.tsx`, `src/theme.ts`; w repo także folder `biuro-rachunkowe-tewu-2026-prototype/`.
- Motyw: brandBlue (#eff6ff–#1e3a8a), slate, Inter, nagłówki waga 900, przyciski slate-900, kontener 1280 px.
- Kontakt: al. Powstańców Wielkopolskich 78A LU2, 70-110 Szczecin; tel. 91 48 24 190 (`tel:914824190` – bez prefiksu), `tel:+48501482555`; e-mail biuro@tewu.szczecin.pl. Strategia mówi o 4 numerach i 2 adresach e-mail – do zinwentaryzowania w kodzie.
- Nie wykryto baneru cookies ani analityki (wg strategii; do potwierdzenia w kodzie).
- Nie czytano całego kodu komponentów (dostęp do repo tylko przez publiczne pliki) – pierwszym krokiem implementacji jest rekonesans.

## 3. Zakres
W zakresie: powiadomienia (e-mail z pełnymi danymi + ping Telegram Bot API bez numeru telefonu + bufor awaryjny w Netlify Blobs z ponawianiem i retencją), widżet UI, nowa podstrona `/polityka-prywatnosci` (szkic do weryfikacji prawnej, link w stopce i w klauzuli), wspólny punkt otwierania, endpoint `POST /api/callback` + powiadomienie e-mail, logika godzin pracy, zdarzenia `dataLayer`, ujednolicenie linków `tel:`/`mailto:`.
Poza zakresem (osobne zadania): GTM, Cookiebot/Consent Mode v2, GA4, tagi Google Ads, podstrony usługowe, dane strukturalne `AccountingService`, FAQ, sekcja o cookies w polityce prywatności (po wdrożeniu CMP).

## 4. Decyzje projektowe (z dokumentu strategii)
- Własny, lekki widżet zamiast płatnych narzędzi (150–400 zł/mies.). Brak opłat stałych i zewnętrznych skryptów śledzących.
- Pływający przycisk w dolnym rogu → krótki panel; jeden komponent otwierany ze wszystkich przycisków „Bezpłatna wycena”.
- Pola: telefon (wymagany), pora kontaktu („Jak najszybciej” / 8–12 / 12–16 / 17–18 – zmiana 2026-10-02: dodano 17–18), „Czego dotyczy?” (opcjonalnie: spółka / fundacja lub stowarzyszenie / działalność gospodarcza / kadry i płace / inne).
- Copy potwierdzenia (zmiana 2026-10-02): zamiast stałego „następnego dnia roboczego do 10:00” komunikat zależy od WYBRANEJ pory – „Oddzwonimy dziś / w najbliższym dniu roboczym w godzinach X–Y”; dla „Jak najszybciej” w godzinach pracy „jak najszybciej, w godzinach pracy biura”, poza nimi „od 8:00 w najbliższym dniu roboczym”. Powód: stały komunikat był sprzeczny z wyborem np. 12–16 lub 17–18.
- Mobile: dwa przyciski – „Zadzwoń” (w godzinach pracy) i „Oddzwońcie”. Numer pod „Zadzwoń” z ENV `NEXT_PUBLIC_CALLBACK_CALL_NUMBER` (E.164), domyślnie stacjonarny +48 91 48 24 190; nieprawidłowa lub pusta wartość → domyślny; zmiana wymaga redeployu na Netlify (zmienna wstawiana przy buildzie).
- RODO: klauzula informacyjna; antyspam: honeypot, bez zewnętrznych skryptów; zdarzenie `dataLayer.push` dopiero po poprawnym wysłaniu; przycisk nie może zasłaniać baneru cookies.
- Pomiar po zdarzeniach `dataLayer`, nie po klasach CSS (stabilność przy zmianach wyglądu).
- Powiadomienia (2026-10-02, zmienione): e-mail (SMTP) niesie pełne dane zgłoszenia; Telegram Bot API dostaje tylko ping BEZ numeru telefonu (id zgłoszenia, pora, temat, źródło, czas) – żeby dane osobowe nie trafiały do Telegrama (RODO). Sukces zgłoszenia = e-mail wysłany; awaria pingu nie psuje zgłoszenia. Awaria e-maila → zgłoszenie trafia do bufora awaryjnego (Netlify Blobs), klient widzi normalne potwierdzenie, a zaplanowana funkcja ponawia wysyłkę i usuwa wpis po sukcesie lub po TTL (domyślnie 72 h); Telegram dostaje alarmy bez danych osobowych. Dopiero gdy zawiodą e-mail i bufor – błąd z numerem telefonu dla klienta.
- Obsługa po stronie biura: powiadomienie mailowe/komunikator, wyznaczona osoba, reakcja ≤ 2 godziny robocze (proces, nie kod).

## 5. Proponowane rozwiązanie (propozycje wykonawcze – nie z dokumentu)
Nazwy zdarzeń i struktura plików poniżej to moja propozycja; do zatwierdzenia.
- `src/components/callback-widget/` – `CallbackWidget.tsx` (panel + przycisk), `CallbackProvider.tsx` + `useCallbackWidget()` (kontekst), `business-hours.ts` (czysta funkcja, `Europe/Warsaw`), `phone.ts` (walidacja/normalizacja), `analytics.ts` (push do dataLayer).
- `src/app/api/callback/route.ts` – walidacja serwerowa, honeypot (zwraca 200 bez wysyłki), time trap, limity długości pól, wysyłka e-mail (nodemailer/SMTP). Rate limit w pamięci odpada (Netlify = serverless); twardy limit per IP tylko przez Netlify Blobs, w razie potrzeby. ENV (`.env.local` lokalnie, panel Netlify na produkcji): `CALLBACK_SMTP_HOST/PORT/USER/PASS`, `CALLBACK_FROM`, `CALLBACK_TO`, `NEXT_PUBLIC_CALLBACK_CALL_NUMBER`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (tylko serwer, bez `NEXT_PUBLIC_`), `CALLBACK_OUTBOX_TTL_HOURS` (domyślnie 72), opcjonalnie `OUTBOX_ENCRYPTION_KEY`; `.env.example`. Wysyłka: `Promise.allSettled`, timeout na kanał, jedna ponowna próba Telegrama przy 429/5xx, logi bez PII i bez tokenu; test, że ping nie zawiera numeru.
- Zdarzenia: `callback_widget_open` {source: header|hero|floating|contact|service}, `callback_request_submit` {source, topic, time_slot: asap|8-12|12-16|17-18} – bez numeru telefonu.
- Bufor awaryjny: `OutboxStore` (Blobs + in-memory do testów), `processOutbox`, zaplanowana funkcja `netlify/functions/process-outbox.mts`, nowa zależność `@netlify/blobs` (jedyna dozwolona).
- Moduł powiadomień (np. `src/lib/notify/{email,telegram,index}.ts`) z wspólnym interfejsem kanału i `notifyAll()`.
- `src/app/polityka-prywatnosci/page.tsx` – szkic polityki (patrz zakres), link w stopce.
- Provider montowany w `layout.tsx`; podmiana `href="/kontakt"` w przyciskach „Bezpłatna wycena” na `onClick` z fallbackiem do `/kontakt`.

## 6. Kryteria akceptacji
1. Każdy przycisk „Bezpłatna wycena” (menu, hero, Kontakt) otwiera widżet; przycisk pływający widoczny na wszystkich podstronach.
2. Komunikat zgodny z wybraną porą w każdym z przypadków (przedział trwający / minięty / weekend / `asap` w godzinach i poza nimi); nigdy nie obiecuje terminu, który wyklucza wybrany przedział.
2a. Poprawny numer → sukces, mail dociera do biura, pojawia się `callback_request_submit`; błędny numer → komunikat przy polu, brak zdarzenia.
3. Zgłoszenie dociera e-mailem (z numerem), a na Telegram idzie ping bez numeru; awaria pingu → użytkownik nadal widzi sukces, awaria e-maila → zapis do bufora, normalne potwierdzenie dla klienta, `callback_request_submit` z `delivery: buffered` i alarm na Telegram; gdy zawiodą e-mail i bufor → błąd z numerem telefonu, brak `callback_request_submit`. Test potwierdza, że ping i alarmy nie zawierają numeru. Zaplanowana funkcja ponawia wysyłkę, po sukcesie usuwa wpis, a wpisy starsze niż TTL usuwa z alarmem. Honeypot i time trap działają; brak zewnętrznych skryptów.
4. Komunikaty godzinowe poprawne dla pn–pt 8–16, wieczoru, weekendu i przy zmianie czasu (testy jednostkowe).
5. W dni wolne widżet nie obiecuje oddzwonienia „dziś”; kolejny dzień roboczy omija weekendy i święta (np. Wielkanoc 2027, długi weekend majowy).
5a. Mobile ~375 px: dwa przyciski, brak zasłaniania stopki/nawigacji; desktop bez regresji.
6. Dostępność: dialog z focus trap i `Esc`, etykiety, komunikaty błędów, obsługa klawiaturą.
7. Wszystkie numery jako `tel:+48…`, adresy jako `mailto:`; brak numerów jako zwykłego tekstu.
8. `pnpm lint` i `pnpm build` przechodzą; zmiany na gałęzi `feat/callback-widget`.

## 7. Decyzje podjęte i pytania otwarte
Rozstrzygnięte (2026-10-02):
- Telegram dostaje tylko ping bez numeru telefonu (nie dwa pełne tory). Powód: RODO / brak przekazywania danych osobowych do Telegrama.
- Numer pod „Zadzwoń”: ENV `NEXT_PUBLIC_CALLBACK_CALL_NUMBER`, default stacjonarny.
- Hosting: **Netlify** → funkcje serverless, bez rate limitu w pamięci.
- Konfiguracja poczty: **wyłącznie zmienne środowiskowe / plik `.env`**.
- Polityki prywatności nie ma → **tworzymy podstronę `/polityka-prywatnosci`**.

Nadal otwarte:
1. Konfiguracja po stronie właściciela w Netlify: konto SMTP i adres(y) odbiorcy oraz bot Telegram (@BotFather → token, dodanie bota do chatu/grupy biura, `chat_id`). Kto odbiera zgłoszenia (osoba wyznaczona, reakcja ≤ 2 godz. roboczych).
2. Polityka prywatności musi opisywać bufor (cel, podstawa, retencja zgodna z `CALLBACK_OUTBOX_TTL_HOURS`, Netlify jako procesor, DPA, region Blobs i ewentualne przekazanie poza EOG) – szkic ma w tych miejscach `TODO`. Treść polityki prywatności i klauzuli informacyjnej – szkic wymaga weryfikacji przez TEWU/prawnika przed publikacją. Telegram dostaje tylko ping bez danych osobowych (id zgłoszenia, pora, temat, źródło, czas), więc nie jest odbiorcą numeru; warto to potwierdzić w ocenie prawnej.
3. ~~Numer pod „Zadzwoń”~~ – rozstrzygnięte: wybierany zmienną ENV `NEXT_PUBLIC_CALLBACK_CALL_NUMBER`, domyślnie stacjonarny.
4. Czy folder `biuro-rachunkowe-tewu-2026-prototype/` jest martwy, czy aktywny? Nie ruszać bez potwierdzenia.
5. Czy domyślna retencja 72 h odpowiada TEWU (wcześniej w rozmowie padło 7 dni jako przykład; 72 h wybrano, bo stara prośba o oddzwonienie traci sens). Wartość ENV i tekst polityki muszą być spójne. Czy akceptowana jest nowa zależność `@netlify/blobs` oraz opcjonalne szyfrowanie pola `phone` po stronie aplikacji.
6. Czy wersja Next z `package.json` działa na Netlify bez zmian (sprawdzić adapter; ewentualnie `netlify.toml`).

Do potwierdzenia przez TEWU (nowe, 2026-10-02):
7. Przedział 17–18 jest poza godzinami pracy biura (8–16) – czy ktoś faktycznie będzie wtedy oddzwaniał? Jeśli nie, opcja obiecuje coś, czego proces nie dowiezie. Przycisk „Zadzwoń” zostaje tylko na 8–16.
8. Strategia (rozdz. 5.1) opisuje jeszcze 3 pory i stały komunikat „do 10:00” – warto zsynchronizować dokument z tą zmianą.

## 7a. Dni wolne od pracy (dodane 2026-10-02, zaktualizowane)
Dzień roboczy = pn–pt poza dniami ustawowo wolnymi w Polsce oraz poza `EXTRA_CLOSED_DATES`.

**Decyzja: zamiast zależności npm lub zewnętrznego API kopiujemy logikę biblioteki `poland-public-holidays` (gałąź `feature/add-christmas-eve`) do repo.** Źródło: https://github.com/mtk3d/poland-public-holidays/tree/feature/add-christmas-eve (pliki `src/index.ts`, `src/holidays.ts`, `src/helpers.ts`, `src/types.ts`, testy). Licencja MIT, Copyright Kamil Szydlowski 2021 – wymagane dołączenie tekstu licencji i atrybucji obok skopiowanego kodu (np. `src/lib/holidays/LICENSE.poland-public-holidays.txt`) oraz zapis URL, gałęzi i SHA commita w nagłówku. Uwaga: `package.json` tej gałęzi wskazuje jako repozytorium `szydlovski/poland-public-holidays` (autor oryginału); URL, który podał właściciel, to fork `mtk3d`. Agent ma zapisać SHA z forka.

Zawartość listy w tej gałęzi (sprawdzona na kodzie): stałe 1 I, 6 I, 1 V, 3 V, 15 VIII, 1 XI, 11 XI, 24 XII, 25 XII, 26 XII; ruchome od Wielkanocy +0, +1, +49 (Zielone Świątki), +60 (Boże Ciało). Pokrywa się z wymaganiami (Wigilia obowiązuje od 2025 r.).

Co trzeba poprawić przy porcie:
- Oryginał używa `new Date('YYYY-MM-DD')` (UTC) i lokalnych `getDay()`/`getFullYear()`. Funkcje Netlify chodzą w UTC, więc blisko północy czasu polskiego można dostać zły dzień. Logika ma operować na dacie kalendarzowej w `Europe/Warsaw`.
- Ścisły TypeScript bez `any`, uproszczona walidacja, funkcje czyste: `isPolishHoliday`, `isBusinessDay`, `nextBusinessDay`.
- Testy: port testów oryginału (Mocha → Vitest) plus testy z sekcji kryteriów akceptacji (2026–2028, strefy czasowe, długi weekend, `EXTRA_CLOSED_DATES`).
- Biblioteka nie wie o mostkach i urlopie biura – stąd `EXTRA_CLOSED_DATES` edytowane przez właściciela.
- Brak dostępu do repo/sieci → agent się zatrzymuje i zgłasza, nie odtwarza kodu z pamięci.

Wpływa na: komunikat potwierdzenia („dziś” vs „najbliższy dzień roboczy”, z nazwą dnia i datą), widoczność przycisku „Zadzwoń”, testy. Do potwierdzenia przez TEWU: czy biuro nie pracuje w inne dni (31 XII, mostki) – wpisać do `EXTRA_CLOSED_DATES`. Raz w roku, w grudniu, warto sprawdzić zmiany w ustawie o dniach wolnych na rok następny.

## 8. Ryzyka
- Telegram: ping nie zawiera numeru telefonu, więc wyciek lub dostęp osób trzecich do grupy nie ujawnia danych klientów, ale ujawnia fakt, że wpłynęło zgłoszenie, oraz pora/temat. Token bota tylko w ENV, nigdy w repo; po wycieku unieważnić w @BotFather.
- Numer telefonu idzie e-mailem, a przy awarii poczty trafia do bufora w Blobs (retencja ≤ TTL, domyślnie 72 h). Gdy awaria poczty trwa dłużej niż TTL, zgłoszenia wygasają (alarm na Telegram, bez numeru) – klient zostaje bez oddzwonienia. Bufor to dodatkowe miejsce przechowywania danych osobowych: wymaga wpisu w polityce prywatności, DPA z Netlify i potwierdzenia regionu przechowywania.
- Limity Telegrama (ok. 1 wiadomość/s na czat, ok. 20/min do grupy) przy fali spamu: chroni honeypot i time trap, ale twardego limitu per IP nie ma.
- Brak wglądu w pełny kod przed startem – możliwe niespodzianki w strukturze nagłówka/hero.
- Szczyt sezonu: bez osoby wyznaczonej do oddzwaniania i reakcji ≤ 2 h widżet nie przełoży się na klientów.
- Cookies/CMP: przycisk musi mieć regulowany dolny offset, bo Cookiebot dojdzie później.
- Model Flash może uprościć walidację/dostępność – wymagać testów i ręcznego przeglądu przed merge.

## 9. Następne kroki po wdrożeniu widżeta
GTM + Cookiebot + Consent Mode v2 → tagi konwersji (widżet jako konwersja główna, `click_tel`, `click_email`) → test Tag Assistant → arkusz leadów → start kampanii.
