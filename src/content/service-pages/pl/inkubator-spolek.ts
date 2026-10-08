import type { ServicePageContent } from '../types';
import { PRICING_FACTORS, PRICING_PROCESS, priceFaq } from './shared';

export const inkubatorSpolek: ServicePageContent = {
  slug: 'inkubator-spolek',
  locale: 'pl',
  meta: {
    title: 'Inkubator spółek z o.o. Szczecin – Biuro Rachunkowe TEWU',
    description: 'Zakładasz spółkę z o.o. w Szczecinie? Doradzimy, założymy spółkę z notariuszem, zapewnimy adres siedziby i poprowadzimy księgowość.',
  },
  hero: {
    title: 'Inkubator spółek z o.o. w Szczecinie',
    lead: 'Pomagamy zdecydować, czy spółka z o.o. to dobra forma dla Twojej działalności, zakładamy ją i wspieramy na starcie – doradztwem, a w razie potrzeby także lokalem. Inkubacja trwa zwykle do trzech miesięcy, potem prowadzimy stałą obsługę księgową spółki.',
  },
  audience: {
    title: 'Dla kogo?',
    items: [
      'Osoby, które zakładają nową spółkę z o.o.',
      'Przedsiębiorcy, którzy przekształcają jednoosobową działalność w spółkę z o.o.',
      'Polacy i cudzoziemcy – niezależnie od obywatelstwa',
    ],
  },
  scope: {
    title: 'Zakres obsługi',
    items: [
      'Informacje o spółce z o.o., które pomagają zdecydować, czy to właściwa forma działalności',
      'Założenie spółki: umowa spółki i rejestracja w KRS albo przez S24 – współpracujemy z notariuszem',
      'Adres siedziby spółki',
      'Doradztwo na starcie, a w razie potrzeby także lokal',
      'Pomoc w formalnościach po rejestracji w KRS',
      'Po inkubacji – stała obsługa księgowa spółki',
    ],
  },
  pricing: {
    title: 'Ile kosztuje inkubator?',
    factors: [...PRICING_FACTORS, 'Zakres pomocy przy zakładaniu spółki, adres siedziby lub lokal'],
    process: PRICING_PROCESS,
  },
  steps: {
    title: 'Jak zacząć w 3 krokach',
    items: [
      {
        title: 'Rozmowa o planach',
        description: 'Poznajemy Twoje plany i wyjaśniamy, czym jest spółka z o.o., żeby łatwiej było zdecydować, czy to dla Ciebie właściwa forma.',
      },
      {
        title: 'Formalności związane z założeniem spółki',
        description: 'Zakładamy spółkę – umowa spółki i rejestracja w KRS albo przez S24 – we współpracy z notariuszem. Możemy też zapewnić adres siedziby.',
      },
      {
        title: 'Obsługa księgowa',
        description: 'Prowadzimy księgowość spółki. Po inkubacji, która trwa zwykle do trzech miesięcy, spółka przechodzi na stałą obsługę księgową.',
      },
    ],
  },
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        question: 'Na czym polega inkubacja spółki?',
        answer: 'Wspieramy nową spółkę na starcie doradztwem, a w razie potrzeby także lokalem. Inkubacja trwa zwykle do trzech miesięcy, a potem prowadzimy stałą obsługę księgową spółki.',
      },
      {
        question: 'Jaki kapitał zakładowy jest potrzebny?',
        answer: 'Minimalny kapitał zakładowy spółki z o.o. wynosi 5000 zł.',
      },
      {
        question: 'Czy spółka z o.o. musi prowadzić pełną księgowość?',
        answer: 'Tak, spółka z o.o. prowadzi księgi rachunkowe od pierwszego dnia, niezależnie od wysokości przychodów.',
      },
      {
        question: 'Co trzeba zrobić po rejestracji spółki w KRS?',
        answer: 'Po rejestracji jest jeszcze trochę formalności, m.in. zgłoszenie beneficjentów rzeczywistych do CRBR, w razie potrzeby rejestracja jako podatnika VAT i uzupełnienie danych w urzędzie skarbowym. Pomożemy przejść przez te kroki.',
      },
      {
        question: 'Czy cudzoziemiec może założyć spółkę z o.o. w Polsce?',
        answer: 'Tak, cudzoziemcy – niezależnie od obywatelstwa – mogą zakładać w Polsce spółkę z o.o.',
      },
      priceFaq('Ile kosztuje inkubator?'),
    ],
  },
};
