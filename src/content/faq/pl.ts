import type { FaqPageContent } from './types';

// Source: TEWU's draft (15.10.2026), extended in the grilling session; legal facts checked against
// biznes.gov.pl, podatki.gov.pl and zus.pl on 15.10.2026. Amounts: update yearly (README).
export const PL_FAQ: FaqPageContent = {
  locale: 'pl',
  meta: {
    title: 'FAQ – pytania o księgowość, podatki i ZUS | TEWU Szczecin',
    description: 'Biuro rachunkowe TEWU ze Szczecina odpowiada na częste pytania: JDG czy spółka, forma opodatkowania, zwolnienie z VAT, ulgi w ZUS, rachunek firmowy, KSeF.',
  },
  hero: {
    badge: 'FAQ',
    title: 'Najczęstsze pytania o księgowość, podatki i ZUS',
    lead: 'Odpowiadamy na pytania, które przedsiębiorcy zadają nam najczęściej: od założenia firmy, przez podatki i ZUS, po KSeF.',
    updatedPrefix: 'Aktualizacja:',
    disclaimer: 'Informacje na tej stronie są ogólne i nie stanowią porady podatkowej. W sprawie Twojej firmy',
    disclaimerLink: 'zadzwoń – chętnie porozmawiamy.',
    imageAlt: 'Wejście do Biura Rachunkowego TEWU przy Al. Powstańców Wielkopolskich 78A w Szczecinie',
  },
  breadcrumb: 'Częste pytania (FAQ)',
  categoriesLabel: 'Kategorie pytań',
  questionCount: { one: 'pytanie', few: 'pytania', many: 'pytań' },
  sourcesLabel: { one: 'Źródło', other: 'Źródła' },
  categories: [
    {
      id: 'o-biurze',
      title: 'O Biurze TEWU',
      questions: [
        {
          id: 'certyfikat-ksiegowy',
          question: 'Czy Biuro Rachunkowe TEWU ma Certyfikat Księgowy?',
          answer: [
            'Tak. Zarząd Biura Rachunkowego TEWU ma Certyfikat Księgowy wydany przez Ministra Finansów. Ten certyfikat uprawnia do usługowego prowadzenia ksiąg rachunkowych. Dokumenty możesz obejrzeć na stronie [Certyfikaty](/certyfikaty).',
          ],
        },
        {
          id: 'spolki-i-jdg',
          question: 'Czy obsługujecie spółki i jednoosobowe działalności (JDG)?',
          answer: [
            'Tak. Obsługujemy zarówno duże spółki, jak i jednoosobowe działalności gospodarcze (JDG) z wielu branż – od IT, przez magazyny, po usługi hydrauliczne.',
            'Dla JDG prowadzimy [księgę przychodów i rozchodów (KPiR)](/uslugi/kpir) albo [ewidencję przychodów na ryczałcie](/uslugi/ryczalt), a dla spółek [pełną księgowość](/uslugi/pelna-ksiegowosc).',
          ],
        },
        {
          id: 'ubezpieczenie-oc',
          question: 'Czy TEWU ma ubezpieczenie odpowiedzialności cywilnej (OC)?',
          answer: [
            'Tak. Działamy zgodnie z przepisami i mamy ubezpieczenie OC działalności, które ustawa o rachunkowości nakłada na biura usługowo prowadzące księgi rachunkowe. Polisa obejmuje szkody, które klient mógłby ponieść przez błąd biura przy prowadzeniu jego księgowości.',
          ],
        },
        {
          id: 'ochrona-danych',
          question: 'Jak chronicie dane klientów?',
          answer: [
            'Dane klientów przetwarzamy zgodnie z RODO i tylko w zakresie potrzebnym do prowadzenia księgowości, kadr i płac oraz spraw w urzędach.',
            'Jak przetwarzamy dane przekazane przez tę stronę, np. numer telefonu z formularza oddzwaniania, opisuje [polityka prywatności](/polityka-prywatnosci).',
          ],
        },
        {
          id: 'ksiegowosc-zdalnie',
          question: 'Czy księgowość można prowadzić zdalnie?',
          answer: [
            'Tak. Współpracujemy stacjonarnie w Szczecinie i w pełni online. Dokumenty, rozliczenia i kontakt możesz załatwiać zdalnie – bez dojazdów, w dogodnym dla Ciebie trybie.',
            'Jeśli wolisz porozmawiać na miejscu, zapraszamy do biura – [adres i godziny otwarcia](/kontakt).',
          ],
        },
        {
          id: 'przekazywanie-dokumentow',
          question: 'Jak przekazuję dokumenty do biura?',
          answer: [
            'W dobie KSeF oryginały faktur pobierane są do systemu księgowego bezpośrednio z KSeF.',
            'Dodatkowo dostarczenie faktur do biura (papier, pdf) daje nam pewność, że są one zweryfikowane, opisane i zaakceptowane przez przedsiębiorcę. Unikniemy wówczas zaksięgowania dokumentu wystawionego na błędne dane odbiorcy faktury.',
            'Pozostałe dokumenty możesz przesyłać e-mailem albo przez WhatsApp.',
          ],
        },
        {
          id: 'cena-obslugi',
          question: 'Ile kosztuje obsługa księgowa?',
          answer: [
            'Cenę ustalamy indywidualnie – nie mamy sztywnego cennika. Zależy m.in. od rodzaju działalności, liczby dokumentów, tego, ile wsparcia potrzebujesz na co dzień, oraz Twoich potrzeb i oczekiwań.',
            'Wycena jest bezpłatna: zostaw numer telefonu, a oddzwonimy w wybranej przez Ciebie porze. Po rozmowie zapraszamy na spotkanie albo podajemy wstępną wycenę telefonicznie lub mailowo.',
          ],
        },
        {
          id: 'zmiana-biura',
          question: 'Czy mogę zmienić biuro rachunkowe w trakcie roku?',
          answer: [
            'Tak, biuro można zmienić w każdym miesiącu roku. Podpisujemy umowę, pomagamy zakończyć współpracę z dotychczasowym biurem, przejmujemy od niego dokumenty i dane księgowe i kontynuujemy rozliczenia bez przerwy w terminach.',
          ],
        },
        {
          id: 'reprezentacja-w-urzedach',
          question: 'Czy reprezentujecie klientów przed urzędem skarbowym i ZUS?',
          answer: [
            'Tak. Na podstawie pełnomocnictwa reprezentujemy klientów w kontaktach z urzędem skarbowym i ZUS, także podczas kontroli.',
          ],
        },
        {
          id: 'kadry-i-place',
          question: 'Czy prowadzicie kadry i płace?',
          answer: [
            'Tak, dla firm, którym prowadzimy księgowość: sporządzamy listy płac, przygotowujemy umowy, zgłaszamy pracowników do ZUS i rozliczamy deklaracje ZUS i PIT. Pomagamy też zatrudniać cudzoziemców, w tym obywateli Ukrainy.',
            'Samych kadr i płac, bez księgowości, nie prowadzimy. Więcej: [kadry i płace](/uslugi/kadry-i-place).',
          ],
        },
        {
          id: 'rozmowa-po-ukrainsku',
          question: 'Czy mogę rozmawiać z biurem po ukraińsku?',
          answer: [
            'Tak. W biurze pracują osoby mówiące po ukraińsku. Jeśli zostawisz numer w [ukraińskiej wersji strony](/uk), oddzwoni do Ciebie osoba mówiąca po ukraińsku. Możesz też zadzwonić i poprosić o rozmowę po ukraińsku.',
          ],
        },
      ],
    },
    {
      id: 'zakladanie-firmy',
      title: 'Zakładanie firmy',
      questions: [
        {
          id: 'pomoc-w-zalozeniu-firmy',
          question: 'Czy pomagacie założyć działalność lub spółkę?',
          answer: [
            'Tak. Pomagamy w formalnościach związanych z założeniem firmy, w wyborze formy opodatkowania i w pierwszych obowiązkach wobec urzędu skarbowego oraz ZUS.',
            'Osobom zakładającym spółkę z o.o. proponujemy [Inkubator spółek](/uslugi/inkubator-spolek): założenie spółki u notariusza albo przez S24, adres siedziby i wsparcie na starcie.',
          ],
        },
        {
          id: 'zalozenie-przez-internet',
          question: 'Czy działalność można założyć przez Internet?',
          answer: [
            'Tak. Jednoosobową działalność rejestrujesz bezpłatnie w CEIDG przez serwis biznes.gov.pl. Wniosek podpisujesz profilem zaufanym, podpisem osobistym (e-dowód) albo kwalifikowanym podpisem elektronicznym.',
            'Spółkę z o.o. można założyć online w systemie S24, na wzorcu umowy.',
          ],
          sources: [{ label: 'biznes.gov.pl – rejestracja w CEIDG', href: 'https://www.biznes.gov.pl/pl/portal/ou736' }],
        },
        {
          id: 'jdg-czy-spolka',
          question: 'JDG czy spółka z o.o. – jaką formę działalności wybrać?',
          answer: [
            'Wybór zależy głównie od poziomu dochodów, ponoszonych kosztów, ryzyka biznesowego i planów rozwoju.',
            'Jednoosobowa działalność gospodarcza (JDG) to najprostsza forma prowadzenia biznesu – idealna na start oraz dla małych i średnich działalności. Spółka z ograniczoną odpowiedzialnością ma odrębną osobowość prawną: co do zasady wspólnicy nie odpowiadają za jej długi własnym majątkiem, a spółka zawsze prowadzi [pełną księgowość](/uslugi/pelna-ksiegowosc). Polecamy ją przy większych obrotach, wyższym ryzyku albo gdy planujesz wspólników.',
          ],
        },
      ],
    },
    {
      id: 'podatki-vat-ksef',
      title: 'Podatki, VAT i KSeF',
      questions: [
        {
          id: 'forma-opodatkowania',
          question: 'Jaką formę opodatkowania wybrać?',
          answer: [
            'Odpowiednia forma opodatkowania zależy od profilu działalności – każdy przypadek rozpatrujemy indywidualnie.',
            'Do wyboru są: **skala podatkowa** (12% i 32% od nadwyżki dochodu ponad 120 000 zł, z kwotą wolną 30 000 zł), **podatek liniowy** (19% bez względu na wysokość dochodu) i **ryczałt od przychodów ewidencjonowanych** (od 2% do 17% przychodu, bez odliczania kosztów). Na wybór wpływa też składka zdrowotna, liczona w każdej formie inaczej. Więcej: [KPiR](/uslugi/kpir) i [ryczałt](/uslugi/ryczalt).',
          ],
          sources: [
            { label: 'biznes.gov.pl – jak wybrać formę opodatkowania', href: 'https://www.biznes.gov.pl/pl/portal/00172' },
            { label: 'biznes.gov.pl – skala podatkowa', href: 'https://www.biznes.gov.pl/pl/portal/00264' },
          ],
        },
        {
          id: 'zwolnienie-z-vat',
          question: 'Czy warto korzystać ze zwolnienia z VAT?',
          answer: [
            'Każdy przypadek należy indywidualnie przeanalizować – wszystko zależy od branży i potencjalnych odbiorców. Zwolnienie zwykle się opłaca, gdy sprzedajesz osobom prywatnym, które nie odliczają VAT. Gdy Twoimi klientami są firmy, a Ty masz duże zakupy z VAT, rejestracja jako podatnik VAT bywa korzystniejsza.',
            'Od 1 stycznia 2026 r. ze zwolnienia podmiotowego możesz korzystać, jeśli Twoja sprzedaż w poprzednim roku nie przekroczyła **240 000 zł** (wcześniej 200 000 zł). Gdy firma rusza w trakcie roku, limit liczy się proporcjonalnie do okresu działalności. Niektórym branżom zwolnienie nie przysługuje niezależnie od obrotów, np. usługom prawniczym czy sprzedaży nowych środków transportu.',
          ],
          sources: [
            {
              label: 'podatki.gov.pl – zwolnienie podmiotowe od VAT',
              href: 'https://www.podatki.gov.pl/podatki-firmowe/vat/poradniki-i-informatory/zwolnienie-podmiotowe-od-podatku-vat',
            },
          ],
        },
        {
          id: 'ryczalt-a-pracownicy',
          question: 'Czy będąc na ryczałcie mogę zatrudniać pracowników?',
          answer: [
            'Tak, na ryczałcie można zatrudniać pracowników zarówno na umowę o pracę, jak i na umowę zlecenie. Pamiętaj tylko, że ryczałt płaci się od przychodu, więc wynagrodzenia pracowników nie obniżają podatku. Przy dużych kosztach zatrudnienia warto porównać ryczałt z [KPiR](/uslugi/kpir).',
          ],
        },
        {
          id: 'co-to-jest-ksef',
          question: 'Co to jest KSeF?',
          answer: [
            'KSeF (Krajowy System e-Faktur) to ogólnopolski system teleinformatyczny zarządzany przez Ministerstwo Finansów, służący do wystawiania, przesyłania, odbierania i archiwizowania tzw. faktur ustrukturyzowanych (w formacie XML).',
            'Od 1 lutego 2026 r. faktury w KSeF wystawiają największe firmy, a od 1 kwietnia 2026 r. pozostali podatnicy. Wyjątki przejściowe obowiązują do końca 2026 r. Naszym klientom pomagamy przejść na KSeF i pobieramy ich faktury bezpośrednio z systemu – [więcej o KSeF](/uslugi/ksef).',
          ],
          sources: [
            {
              label: 'ksef.podatki.gov.pl – kluczowe terminy KSeF',
              href: 'https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/podstawy-prawne-oraz-kluczowe-terminy/',
            },
          ],
        },
      ],
    },
    {
      id: 'zus',
      title: 'ZUS',
      questions: [
        {
          id: 'ulga-na-start',
          question: 'Czy na start mogę płacić niższe składki ZUS?',
          answer: [
            'Co do zasady tak. Przez pierwsze 6 miesięcy możesz skorzystać z **ulgi na start** i płacić tylko składkę zdrowotną.',
            'Przez kolejne 24 miesiące płacisz **preferencyjne składki** społeczne od podstawy 30% minimalnego wynagrodzenia – w 2026 r. to 1441,80 zł podstawy i 420,86 zł składek miesięcznie (456,18 zł z dobrowolną składką chorobową). Potem, jeśli Twój przychód w poprzednim roku nie przekroczył 120 000 zł, możesz przejść na **Mały ZUS Plus**, czyli składki zależne od dochodu, przez maksymalnie 36 miesięcy w ciągu 60 miesięcy. Składkę zdrowotną płacisz przez cały czas.',
            'Z ulgi na start i preferencyjnych składek wykluczone są osoby, które wykonują dla byłego pracodawcy to, co robiły u niego na etacie w tym lub poprzednim roku kalendarzowym, oraz osoby, u których nie minęło 60 miesięcy od zamknięcia (zawieszenia) poprzedniej działalności.',
          ],
          sources: [
            { label: 'biznes.gov.pl – ulga na start', href: 'https://www.biznes.gov.pl/pl/portal/00285' },
            { label: 'biznes.gov.pl – obniżone składki przez 24 miesiące', href: 'https://www.biznes.gov.pl/pl/portal/00286' },
            { label: 'biznes.gov.pl – Mały ZUS Plus', href: 'https://www.biznes.gov.pl/pl/portal/00284' },
          ],
        },
        {
          id: 'wakacje-skladkowe',
          question: 'Czym są wakacje składkowe?',
          answer: [
            'To zwolnienie z opłacania składek społecznych za siebie przez jeden wybrany miesiąc w roku. Skorzystasz z niego, jeśli prowadzisz działalność gospodarczą, w miesiącu przed złożeniem wniosku zgłaszałeś do ubezpieczeń najwyżej 10 osób (łącznie z sobą), a Twój przychód w co najmniej jednym z dwóch poprzednich lat nie przekroczył równowartości 2 mln euro.',
            'Składkę zdrowotną za ten miesiąc trzeba zapłacić. Wniosek RWS składasz elektronicznie przez PUE/eZUS w miesiącu poprzedzającym miesiąc zwolnienia. Zwolnienie jest pomocą de minimis.',
          ],
          sources: [{ label: 'biznes.gov.pl – wakacje składkowe', href: 'https://www.biznes.gov.pl/pl/portal/ou710' }],
        },
      ],
    },
    {
      id: 'rachunek-firmowy',
      title: 'Rachunek firmowy',
      questions: [
        {
          id: 'osobny-rachunek',
          question: 'Czy muszę mieć osobny rachunek bankowy dla firmy?',
          answer: [
            'Jeśli jesteś czynnym podatnikiem VAT – w praktyce tak. Na białej liście podatników VAT publikowane są tylko rachunki firmowe, a prywatne konta nie. Kontrahent, który zapłaci Ci ponad 15 000 zł na rachunek spoza listy, nie zaliczy tej kwoty do kosztów i ryzykuje solidarną odpowiedzialność za Twój VAT.',
            'Płatności między firmami powyżej 15 000 zł brutto – także rozłożone na raty – muszą przechodzić przez rachunek płatniczy, nie gotówką. Jeśli nie jesteś czynnym podatnikiem VAT (np. korzystasz ze zwolnienia), przepisy nie nakazują osobnego konta, ale osobny rachunek ułatwia porządek w rozliczeniach.',
          ],
          sources: [
            { label: 'biznes.gov.pl – biała lista podatników VAT', href: 'https://www.biznes.gov.pl/pl/portal/00226' },
            { label: 'biznes.gov.pl – płatności między przedsiębiorcami', href: 'https://www.biznes.gov.pl/pl/portal/001266' },
          ],
        },
        {
          id: 'zglaszanie-rachunkow',
          question: 'Czy jeśli mam kilka rachunków firmowych, muszę je wszystkie zgłaszać?',
          answer: [
            'Tak, podatnik musi zgłosić wszystkie rachunki firmowe, prowadzone zarówno w Polsce, jak i w innych krajach. Zgłoszeniem objęte są również rachunki prowadzone w walutach obcych.',
            'Nowy lub zmieniony rachunek zgłaszasz w ciągu 7 dni: przy jednoosobowej działalności we wniosku o zmianę danych w CEIDG (CEIDG przekaże je do urzędu skarbowego i ZUS), a spółka wpisana do KRS – w urzędzie skarbowym na formularzu NIP-8. Za spóźnienie grozi grzywna jak za wykroczenie skarbowe.',
          ],
          sources: [
            { label: 'biznes.gov.pl – zmiana danych w CEIDG', href: 'https://www.biznes.gov.pl/pl/portal/ou737' },
            { label: 'biznes.gov.pl – aktualizacja NIP-8', href: 'https://www.biznes.gov.pl/pl/portal/ou349' },
          ],
        },
      ],
    },
  ],
  cta: {
    title: 'Nie znalazłeś odpowiedzi?',
    description: 'Zadzwoń albo zostaw numer – oddzwonimy i odpowiemy na Twoje pytanie. Wycena obsługi jest bezpłatna.',
    imageAlt: 'Sylwester Wrzeszcz, Prezes Biura Rachunkowego TEWU, w recepcji biura',
  },
};
