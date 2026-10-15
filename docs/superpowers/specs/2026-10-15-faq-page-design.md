# Strona FAQ – specyfikacja

Data: 2026-10-15 · Gałąź: `feat/faq-page` (od `devel`) · Źródło: sesja grillingu z właścicielem projektu (draft treści od TEWU, rundy Q1–Q18).

## Cel

Podstrona z odpowiedziami na częste pytania przedsiębiorców (księgowość, podatki, VAT, ZUS, rachunek firmowy, KSeF), zoptymalizowana pod wyszukiwarki i systemy AI, w wersji polskiej i ukraińskiej. Link tylko w stopce. Wygląd spójny z resztą serwisu, z prawdziwymi zdjęciami biura.

## Decyzje

| # | Decyzja |
|---|---|
| Q1 | Adres `/faq` i `/uk/faq` (ten sam slug, ADR 0002). Stare serwisy TEWU nie miały strony FAQ (sprawdzone w Wayback Machine), więc nie ma Legacy URL. |
| Q2 | Odpowiedzi 2–4 zdania, pierwsze zdanie odpowiada wprost. Linki do podstron usług, certyfikatów, kontaktu i polityki prywatności. Nowe pytania tylko z faktów potwierdzonych przez TEWU albo ze źródeł urzędowych. Pytania z podstron usługowych nie są kopiowane 1:1 (Google: jedna kopia pytania w `FAQPage`). |
| Q3 | Poprawki merytoryczne draftu sprawdzone w źródłach urzędowych. **Kwoty zostają** (strona ma widoczną datę aktualizacji). README dostaje instrukcję aktualizacji kwot przy aktualizacji zależności `package.json`. Każda zmiana merytoryczna i każde nowe pytanie trafia na listę w opisie PR do weryfikacji przez TEWU. |
| Q4 | 5 kategorii z nagłówkiem H2 i ikoną, kafelki kategorii jako spis treści (kotwice), akordeon `<details>` w kategorii. Każde pytanie ma stały identyfikator: `/faq#ulga-na-start` otwiera i przewija do odpowiedzi. |
| Q5 | Pod H1: „Aktualizacja: 15 października 2026 r.” (jedna stała `FAQ_UPDATED_AT`, z niej też `dateModified`) i zastrzeżenie, że to informacje ogólne, nie porada podatkowa. „Lista będzie modyfikowana” wypada. |
| Q6 | „Nie znalazłeś odpowiedzi?” to końcowa sekcja CTA (przycisk widżetu call-back, numer komórkowy, „Odbiera Prezes biura”), a nie pytanie. `QuoteActions` wydzielone do wspólnego komponentu. Nowe źródło widżetu `faq`. |
| Q7 | Link w stopce, kolumna „Nawigacja”, przed „Polityką prywatności”: „Częste pytania (FAQ)” / „Поширені запитання (FAQ)”. Nie ma go w menu ani na stronie głównej. Strona jest w `sitemap.xml`. |
| Q8 | JSON-LD: `FAQPage` (węzeł strony z `url`, `inLanguage`, `dateModified`, `isPartOf` → `#strona`, `about` → `#firma`; odpowiedzi jako HTML z `<a>`) i `BreadcrumbList`. `/llms.txt` generowany z rejestrów. Bez `/faq.md`. `seo-check` sprawdza `/faq` i `/llms.txt`. |
| Q9 | ADR 0005, hasło **FAQ Page** w `CONTEXT.md`, poprawka nieaktualnego zapisu o `FAQPage` w ADR 0004 §2. |
| Q10, Q15 | Nagłówek dzielony: ciemne `slate.9`, po lewej znaczek FAQ, H1, lead, data i zastrzeżenie, po prawej zdjęcie budynku 78A (przycięte do witryn TEWU, bez sąsiednich firm), ładowane od razu (`fetchpriority="high"`), plus dyskretny motyw „dymka z pytajnikiem”. Kafelki z ikonami lucide. Końcowe CTA dzielone ze zdjęciem recepcji z Prezesem (`loading="lazy"`). |
| Q11 | W biurze pracują osoby mówiące po ukraińsku. To one oddzwaniają, gdy formularz wypełniono po ukraińsku. |
| Q12 | 22 pytania w 5 kategoriach (lista niżej). |
| Q13 | Przy odpowiedziach z kwotami i terminami (7 pytań) linki „Źródło / Źródła” do stron urzędowych, `target="_blank" rel="noopener noreferrer"`. |
| Q14 | Meta, H1, lead jak w tabeli niżej. Polskie skróty (JDG, ZUS, KSeF, CEIDG, VAT, Sp. z o.o.) w wersji UK zostają w oryginale. |
| Q16 | Zdjęcie recepcji pokazuje obecne biuro, więc opis może mówić „w recepcji biura”. |
| Q17 | Zdjęcie budynku dochodzi do `AccountingService.image` w JSON-LD. `/kontakt`, „O nas” i zdjęcie Prezesa na pozostałych podstronach w osobnym PR. |
| Q18 | Pytanie o rozmowę po ukraińsku: w UK pierwsze w kategorii „O Biurze TEWU”, w PL ostatnie. Ten sam zestaw identyfikatorów w obu językach, kolejność może się różnić. Hasło **Callback Lead Locale** w `CONTEXT.md` dostaje informację o pracownikach mówiących po ukraińsku. |

Założenia przyjęte bez zmian: treść w `src/content/faq/{pl,uk}.ts` (ADR 0004 §2), etykiety w słownikach; akordeon wydzielony do `FaqList` (podstrony usług wyglądają tak samo); tekst UK pisze Claude, sprawdza TEWU przed wydaniem; zgoda Prezesa na publikację wizerunku; zdjęcia przez `sharp`: bez metadanych, AVIF + JPG w `<picture>`, pliki w `public/img/biuro/`; terminologia UK z zaakceptowanych tekstów `/uk/uslugi/*`.

## Meta i nagłówek

| | PL | UK |
|---|---|---|
| `title` | FAQ – pytania o księgowość, podatki i ZUS \| TEWU Szczecin | FAQ – питання про бухгалтерію, податки та ZUS \| TEWU Щецин |
| `description` | Biuro rachunkowe TEWU ze Szczecina odpowiada na częste pytania: JDG czy spółka, forma opodatkowania, zwolnienie z VAT, ulgi w ZUS, rachunek firmowy, KSeF. | Бухгалтерське бюро TEWU у Щецині відповідає на поширені запитання: JDG чи Sp. z o.o., форма оподаткування, звільнення від VAT, пільги ZUS, рахунок, KSeF. |
| znaczek | FAQ | FAQ |
| H1 | Najczęstsze pytania o księgowość, podatki i ZUS | Поширені запитання про бухгалтерію, податки та ZUS |
| lead | Odpowiadamy na pytania, które przedsiębiorcy zadają nam najczęściej: od założenia firmy, przez podatki i ZUS, po KSeF. | Відповідаємо на запитання, які підприємці ставлять нам найчастіше: від реєстрації фірми, податків і ZUS до KSeF. |
| data | Aktualizacja: 15 października 2026 r. | Оновлено: 15 жовтня 2026 р. |
| zastrzeżenie | Informacje na tej stronie są ogólne i nie stanowią porady podatkowej. W sprawie Twojej firmy zadzwoń – chętnie porozmawiamy. | Інформація на цій сторінці має загальний характер і не є податковою порадою. Щодо вашої фірми зателефонуйте – охоче поговоримо. |
| okruszek (JSON-LD) | Częste pytania (FAQ) | Поширені запитання (FAQ) |
| CTA – tytuł | Nie znalazłeś odpowiedzi? | Не знайшли відповіді? |
| CTA – opis | Zadzwoń albo zostaw numer – oddzwonimy i odpowiemy na Twoje pytanie. Wycena obsługi jest bezpłatna. | Зателефонуйте або залиште номер – ми передзвонимо й відповімо на ваше запитання. Оцінка вартості обслуговування безкоштовна. |
| alt budynku | Wejście do Biura Rachunkowego TEWU przy Al. Powstańców Wielkopolskich 78A w Szczecinie | Вхід до бюро TEWU на Al. Powstańców Wielkopolskich 78A у Щецині |
| alt recepcji | Sylwester Wrzeszcz, Prezes Biura Rachunkowego TEWU, w recepcji biura | Голова бюро (Prezes) Sylwester Wrzeszcz у приймальні бюро TEWU |

Zakaz z Global Constraints serwisu obowiązuje także tu: żadnego „doradztwa podatkowego” ani „податкового консультування / податкових консультацій” (w UK „податкова порада”, nie „консультація”).

## Treść PL

Oznaczenia: [D] z draftu TEWU bez zmian merytorycznych, [D*] z draftu po zmianie lub rozbudowie, [N] nowe z faktów potwierdzonych przez TEWU, [L] nowe ogólne pytanie prawne. W odpowiedziach `[tekst](/ścieżka)` to link, `**tekst**` to pogrubienie. Kolejne akapity odpowiedzi rozdziela pusta linia.

### 1. O Biurze TEWU (`o-biurze`, ikona `Building2`)

**`certyfikat-ksiegowy`** – Czy Biuro Rachunkowe TEWU ma Certyfikat Księgowy? [D]
> Tak. Zarząd Biura Rachunkowego TEWU ma Certyfikat Księgowy wydany przez Ministra Finansów. Ten certyfikat uprawnia do usługowego prowadzenia ksiąg rachunkowych. Dokumenty możesz obejrzeć na stronie [Certyfikaty](/certyfikaty).

**`spolki-i-jdg`** – Czy obsługujecie spółki i jednoosobowe działalności (JDG)? [D*]
> Tak. Obsługujemy zarówno duże spółki, jak i jednoosobowe działalności gospodarcze (JDG) z wielu branż – od IT, przez magazyny, po usługi hydrauliczne.
>
> Dla JDG prowadzimy [księgę przychodów i rozchodów (KPiR)](/uslugi/kpir) albo [ewidencję przychodów na ryczałcie](/uslugi/ryczalt), a dla spółek [pełną księgowość](/uslugi/pelna-ksiegowosc).

**`ubezpieczenie-oc`** – Czy TEWU ma ubezpieczenie odpowiedzialności cywilnej (OC)? [D*]
> Tak. Działamy zgodnie z przepisami i mamy ubezpieczenie OC działalności, które ustawa o rachunkowości nakłada na biura usługowo prowadzące księgi rachunkowe. Polisa obejmuje szkody, które klient mógłby ponieść przez błąd biura przy prowadzeniu jego księgowości.

**`ochrona-danych`** – Jak chronicie dane klientów? [D*]
> Dane klientów przetwarzamy zgodnie z RODO i tylko w zakresie potrzebnym do prowadzenia księgowości, kadr i płac oraz spraw w urzędach.
>
> Jak przetwarzamy dane przekazane przez tę stronę, np. numer telefonu z formularza oddzwaniania, opisuje [polityka prywatności](/polityka-prywatnosci).

**`ksiegowosc-zdalnie`** – Czy księgowość można prowadzić zdalnie? [D]
> Tak. Współpracujemy stacjonarnie w Szczecinie i w pełni online. Dokumenty, rozliczenia i kontakt możesz załatwiać zdalnie – bez dojazdów, w dogodnym dla Ciebie trybie.
>
> Jeśli wolisz porozmawiać na miejscu, zapraszamy do biura – [adres i godziny otwarcia](/kontakt).

**`przekazywanie-dokumentow`** – Jak przekazuję dokumenty do biura? [N, A8]
> Faktury pobieramy bezpośrednio z KSeF, więc nie musisz ich nam wysyłać – wystarczy, że nadasz biuru uprawnienia w systemie. Pozostałe dokumenty możesz przesyłać e-mailem albo przez WhatsApp.

**`cena-obslugi`** – Ile kosztuje obsługa księgowa? [N, A1–A3]
> Cenę ustalamy indywidualnie – nie mamy sztywnego cennika. Zależy m.in. od rodzaju działalności, liczby dokumentów, tego, ile wsparcia potrzebujesz na co dzień, oraz Twoich potrzeb i oczekiwań.
>
> Wycena jest bezpłatna: zostaw numer telefonu, a oddzwonimy w wybranej przez Ciebie porze. Po rozmowie zapraszamy na spotkanie albo podajemy wstępną wycenę telefonicznie lub mailowo.

**`zmiana-biura`** – Czy mogę zmienić biuro rachunkowe w trakcie roku? [N, A4]
> Tak, biuro można zmienić w każdym miesiącu roku. Podpisujemy umowę, pomagamy zakończyć współpracę z dotychczasowym biurem, przejmujemy od niego dokumenty i dane księgowe i kontynuujemy rozliczenia bez przerwy w terminach.

**`reprezentacja-w-urzedach`** – Czy reprezentujecie klientów przed urzędem skarbowym i ZUS? [N, B]
> Tak. Na podstawie pełnomocnictwa reprezentujemy klientów w kontaktach z urzędem skarbowym i ZUS, także podczas kontroli.

**`kadry-i-place`** – Czy prowadzicie kadry i płace? [N, E]
> Tak, dla firm, którym prowadzimy księgowość: sporządzamy listy płac, przygotowujemy umowy, zgłaszamy pracowników do ZUS i rozliczamy deklaracje ZUS i PIT. Pomagamy też zatrudniać cudzoziemców, w tym obywateli Ukrainy.
>
> Samych kadr i płac, bez księgowości, nie prowadzimy. Więcej: [kadry i płace](/uslugi/kadry-i-place).

**`rozmowa-po-ukrainsku`** – Czy mogę rozmawiać z biurem po ukraińsku? [N, Q11] (w UK pierwsze w kategorii)
> Tak. W biurze pracują osoby mówiące po ukraińsku. Jeśli zostawisz numer w [ukraińskiej wersji strony](/uk), oddzwoni do Ciebie osoba mówiąca po ukraińsku. Możesz też zadzwonić i poprosić o rozmowę po ukraińsku.

(W UK ostatnie zdanie bez linku: „Якщо залишите номер на цьому сайті, вам передзвонить працівник, який говорить українською.”)

### 2. Zakładanie firmy (`zakladanie-firmy`, ikona `Rocket`)

**`pomoc-w-zalozeniu-firmy`** – Czy pomagacie założyć działalność lub spółkę? [D*]
> Tak. Pomagamy w formalnościach związanych z założeniem firmy, w wyborze formy opodatkowania i w pierwszych obowiązkach wobec urzędu skarbowego oraz ZUS.
>
> Osobom zakładającym spółkę z o.o. proponujemy [Inkubator spółek](/uslugi/inkubator-spolek): założenie spółki u notariusza albo przez S24, adres siedziby i wsparcie na starcie.

**`zalozenie-przez-internet`** – Czy działalność można założyć przez Internet? [D*]
> Tak. Jednoosobową działalność rejestrujesz bezpłatnie w CEIDG przez serwis biznes.gov.pl. Wniosek podpisujesz profilem zaufanym, podpisem osobistym (e-dowód) albo kwalifikowanym podpisem elektronicznym.

(Zdanie o potwierdzeniu w urzędzie gminy usunięte przy weryfikacji: biznes.gov.pl zapowiada od 1.11.2026 zmianę zasad składania wniosków papierowych, więc ta informacja szybko by się zdezaktualizowała.)
>
> Spółkę z o.o. można założyć online w systemie S24, na wzorcu umowy.

Źródło: [biznes.gov.pl – rejestracja w CEIDG](https://www.biznes.gov.pl/pl/portal/ou736)

**`jdg-czy-spolka`** – JDG czy spółka z o.o. – jaką formę działalności wybrać? [D*, tytuł zmieniony: to forma prawna, nie forma opodatkowania]
> Wybór zależy głównie od poziomu dochodów, ponoszonych kosztów, ryzyka biznesowego i planów rozwoju.
>
> Jednoosobowa działalność gospodarcza (JDG) to najprostsza forma prowadzenia biznesu – idealna na start oraz dla małych i średnich działalności. Spółka z ograniczoną odpowiedzialnością ma odrębną osobowość prawną: co do zasady wspólnicy nie odpowiadają za jej długi własnym majątkiem, a spółka zawsze prowadzi [pełną księgowość](/uslugi/pelna-ksiegowosc). Polecamy ją przy większych obrotach, wyższym ryzyku albo gdy planujesz wspólników.

### 3. Podatki, VAT i KSeF (`podatki-vat-ksef`, ikona `ReceiptText`)

**`forma-opodatkowania`** – Jaką formę opodatkowania wybrać? [D*]
> Odpowiednia forma opodatkowania zależy od profilu działalności – każdy przypadek rozpatrujemy indywidualnie.
>
> Do wyboru są: **skala podatkowa** (12% i 32% od nadwyżki dochodu ponad 120 000 zł, z kwotą wolną 30 000 zł), **podatek liniowy** (19% bez względu na wysokość dochodu) i **ryczałt od przychodów ewidencjonowanych** (od 2% do 17% przychodu, bez odliczania kosztów). Na wybór wpływa też składka zdrowotna, liczona w każdej formie inaczej. Więcej: [KPiR](/uslugi/kpir) i [ryczałt](/uslugi/ryczalt).

Źródła: [biznes.gov.pl – jak wybrać formę opodatkowania](https://www.biznes.gov.pl/pl/portal/00172), [biznes.gov.pl – skala podatkowa](https://www.biznes.gov.pl/pl/portal/00264) (kwota wolna 30 000 zł jest tylko na tej drugiej stronie)

**`zwolnienie-z-vat`** – Czy warto korzystać ze zwolnienia z VAT? [D*]
> Każdy przypadek należy indywidualnie przeanalizować – wszystko zależy od branży i potencjalnych odbiorców. Zwolnienie zwykle się opłaca, gdy sprzedajesz osobom prywatnym, które nie odliczają VAT. Gdy Twoimi klientami są firmy, a Ty masz duże zakupy z VAT, rejestracja jako podatnik VAT bywa korzystniejsza.
>
> Od 1 stycznia 2026 r. ze zwolnienia podmiotowego możesz korzystać, jeśli Twoja sprzedaż w poprzednim roku nie przekroczyła **240 000 zł** (wcześniej 200 000 zł). Gdy firma rusza w trakcie roku, limit liczy się proporcjonalnie do okresu działalności. Niektórym branżom zwolnienie nie przysługuje niezależnie od obrotów, np. usługom prawniczym czy sprzedaży nowych środków transportu.

Źródło: [podatki.gov.pl – zwolnienie podmiotowe od VAT](https://www.podatki.gov.pl/podatki-firmowe/vat/poradniki-i-informatory/zwolnienie-podmiotowe-od-podatku-vat)

**`ryczalt-a-pracownicy`** – Czy będąc na ryczałcie mogę zatrudniać pracowników? [D*]
> Tak, na ryczałcie można zatrudniać pracowników zarówno na umowę o pracę, jak i na umowę zlecenie. Pamiętaj tylko, że ryczałt płaci się od przychodu, więc wynagrodzenia pracowników nie obniżają podatku. Przy dużych kosztach zatrudnienia warto porównać ryczałt z [KPiR](/uslugi/kpir).

**`co-to-jest-ksef`** – Co to jest KSeF? [D*]
> KSeF (Krajowy System e-Faktur) to ogólnopolski system teleinformatyczny zarządzany przez Ministerstwo Finansów, służący do wystawiania, przesyłania, odbierania i archiwizowania tzw. faktur ustrukturyzowanych (w formacie XML).
>
> Od 2026 r. faktury w KSeF wystawiają kolejno największe firmy i pozostali podatnicy, a od stycznia 2027 r. obowiązek obejmuje wszystkich podatników z siedzibą w Polsce. Naszym klientom pomagamy przejść na KSeF i pobieramy ich faktury bezpośrednio z systemu – [więcej o KSeF](/uslugi/ksef).

### 4. ZUS (`zus`, ikona `HandCoins`)

**`ulga-na-start`** – Czy na start mogę płacić niższe składki ZUS? [D*]
> Co do zasady tak. Przez pierwsze 6 miesięcy możesz skorzystać z **ulgi na start** i płacić tylko składkę zdrowotną.
>
> Przez kolejne 24 miesiące płacisz **preferencyjne składki** społeczne od podstawy 30% minimalnego wynagrodzenia – w 2026 r. to 1441,80 zł podstawy i 420,86 zł składek miesięcznie (456,18 zł z dobrowolną składką chorobową). Potem, jeśli Twój przychód w poprzednim roku nie przekroczył 120 000 zł, możesz przejść na **Mały ZUS Plus**, czyli składki zależne od dochodu, przez maksymalnie 36 miesięcy w ciągu 60 miesięcy. Składkę zdrowotną płacisz przez cały czas.
>
> Z ulgi na start i preferencyjnych składek wykluczone są osoby, które wykonują dla byłego pracodawcy to, co robiły u niego na etacie w tym lub poprzednim roku kalendarzowym, oraz osoby, u których nie minęło 60 miesięcy od zamknięcia (zawieszenia) poprzedniej działalności.

Źródła: [biznes.gov.pl – ulga na start](https://www.biznes.gov.pl/pl/portal/00285), [biznes.gov.pl – obniżone składki przez 24 miesiące](https://www.biznes.gov.pl/pl/portal/00286), [biznes.gov.pl – Mały ZUS Plus](https://www.biznes.gov.pl/pl/portal/00284)

**`wakacje-skladkowe`** – Czym są wakacje składkowe? [L]
> To zwolnienie z opłacania składek społecznych za siebie przez jeden wybrany miesiąc w roku. Skorzystasz z niego, jeśli prowadzisz działalność gospodarczą, w miesiącu przed złożeniem wniosku zgłaszałeś do ubezpieczeń najwyżej 10 osób (łącznie z sobą), a Twój przychód w co najmniej jednym z dwóch poprzednich lat nie przekroczył równowartości 2 mln euro.
>
> Składkę zdrowotną za ten miesiąc trzeba zapłacić. Wniosek RWS składasz elektronicznie przez PUE/eZUS w miesiącu poprzedzającym miesiąc zwolnienia. Zwolnienie jest pomocą de minimis.

Źródło: [biznes.gov.pl – wakacje składkowe](https://www.biznes.gov.pl/pl/portal/ou710)

### 5. Rachunek firmowy (`rachunek-firmowy`, ikona `Landmark`)

**`osobny-rachunek`** – Czy muszę mieć osobny rachunek bankowy dla firmy? [D*: „zobowiązany” zmiękczone do „w praktyce”, bo obowiązek wynika z progu 15 000 zł i białej listy]
> Jeśli jesteś czynnym podatnikiem VAT – w praktyce tak. Na białej liście podatników VAT publikowane są tylko rachunki firmowe, a prywatne konta nie. Kontrahent, który zapłaci Ci ponad 15 000 zł na rachunek spoza listy, nie zaliczy tej kwoty do kosztów i ryzykuje solidarną odpowiedzialność za Twój VAT.
>
> Płatności między firmami powyżej 15 000 zł brutto – także rozłożone na raty – muszą przechodzić przez rachunek płatniczy, nie gotówką. Jeśli nie jesteś podatnikiem VAT, przepisy nie nakazują osobnego konta, ale osobny rachunek ułatwia porządek w rozliczeniach.

Źródła: [biznes.gov.pl – biała lista podatników VAT](https://www.biznes.gov.pl/pl/portal/00226), [biznes.gov.pl – płatności między przedsiębiorcami](https://www.biznes.gov.pl/pl/portal/001266)

(Przepisane przy weryfikacji: strony urzędowe mówią o obowiązku płatności przez **rachunek płatniczy** powyżej 15 000 zł brutto, a nie o obowiązku rachunku **firmowego**; ten wynika w praktyce z białej listy.)

**`zglaszanie-rachunkow`** – Czy jeśli mam kilka rachunków firmowych, muszę je wszystkie zgłaszać? [D*]
> Tak, podatnik musi zgłosić wszystkie rachunki firmowe, prowadzone zarówno w Polsce, jak i w innych krajach. Zgłoszeniem objęte są również rachunki prowadzone w walutach obcych.
>
> Przy jednoosobowej działalności rachunki zgłaszasz we wniosku o zmianę danych w CEIDG, a CEIDG przekazuje je do urzędu skarbowego i ZUS. Spółka wpisana do KRS zgłasza zmiany w wykazie rachunków na formularzu NIP-8 w ciągu 7 dni – za spóźnienie grozi grzywna jak za wykroczenie skarbowe.

(Przepisane przy weryfikacji: na stronie CEIDG rachunek bankowy nie jest na liście zmian z terminem 7 dni; termin 7 dni i grzywna dotyczą NIP-8.)

Źródła: [biznes.gov.pl – zmiana danych w CEIDG](https://www.biznes.gov.pl/pl/portal/ou737), [biznes.gov.pl – aktualizacja NIP-8](https://www.biznes.gov.pl/pl/portal/ou349)

## Do weryfikacji przez TEWU (lista do opisu PR)

1. Cała treść UK (tłumaczenie Claude).
2. Nowe pytania [N] i [L]: przekazywanie dokumentów, cena, zmiana biura, reprezentacja, kadry i płace, rozmowa po ukraińsku, wakacje składkowe.
3. Zmiany merytoryczne [D*]: tytuł „JDG czy spółka z o.o. – jaką formę działalności wybrać?”, pełna ścieżka ulg ZUS z kwotami 2026, limit VAT 240 000 zł, rachunek firmowy („w praktyce tak” zamiast „jest zobowiązany”; obowiązek płatności przez rachunek płatniczy powyżej 15 000 zł brutto; „bez VAT przepisy nie nakazują osobnego konta”), CEIDG / NIP-8 (termin 7 dni tylko dla NIP-8), opis OC (obowiązek z ustawy o rachunkowości), zdanie o RODO.
5. Fakt z draftu TEWU, którego nie znalazłem na stronach urzędowych: obowiązek zgłaszania rachunków zagranicznych i walutowych (zostawiony w brzmieniu TEWU).
4. Zdjęcia: kadr budynku i opis zdjęcia Prezesa.

## Poza zakresem

- Zdjęcie Prezesa na pozostałych podstronach, zdjęcie budynku na `/kontakt`, prawdziwe zdjęcie w „O nas” – osobny PR.
- `/faq.md`, zmiany w przełączniku języka (kotwica po zmianie języka może zniknąć; strona zostaje ta sama).
