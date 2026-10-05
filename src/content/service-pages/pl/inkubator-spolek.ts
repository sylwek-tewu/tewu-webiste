import type { ServicePageContent } from '../types';
import { PRICING_PROCESS } from './shared';

export const inkubatorSpolek: ServicePageContent = {
  slug: 'inkubator-spolek',
  locale: 'pl',
  meta: {
    title: 'Inkubator spółek z o.o. Szczecin – Biuro Rachunkowe TEWU',
    description: 'Zakładasz spółkę z o.o. w Szczecinie? Pomożemy z formalnościami po rejestracji i poprowadzimy księgowość od pierwszego dnia.',
  },
  hero: {
    title: 'Inkubator spółek z o.o. w Szczecinie',
    lead: 'Pomagamy założyć spółkę z o.o. i przeprowadzamy ją przez pierwsze miesiące działalności – od formalności po pierwsze rozliczenia.',
  },
  audience: {
    title: 'Dla kogo?',
    items: [
      'Osoby zakładające pierwszą spółkę z o.o.',
      'Przedsiębiorcy, którzy przenoszą działalność z JDG do spółki',
      'Cudzoziemcy, w tym obywatele Ukrainy, zakładający spółkę w Polsce',
    ],
  },
  scope: {
    title: 'Zakres obsługi',
    items: [
      'Rozmowa o planach i wyborze formy działalności',
      'Formalności po rejestracji spółki, m.in. zgłoszenie do CRBR i rejestracja VAT',
      'Wybór formy opodatkowania spółki',
      'Polityka rachunkowości i otwarcie ksiąg',
      'Pełna księgowość od pierwszego dnia działalności',
    ],
  },
  pricing: {
    title: 'Ile kosztuje inkubator?',
    factors: [
      'Zakres formalności, w których pomagamy',
      'Przewidywana liczba dokumentów w miesiącu',
      'Planowane zatrudnienie',
    ],
    process: PRICING_PROCESS,
  },
  steps: {
    title: 'Jak zacząć w 3 krokach',
    items: [
      {
        title: 'Rozmowa o planach',
        description: 'Poznajemy Twój pomysł na biznes i ustalamy, w czym możemy pomóc.',
      },
      {
        title: 'Formalności',
        description: 'Przeprowadzamy Cię przez formalności związane ze startem spółki.',
      },
      {
        title: 'Start księgowości',
        description: 'Otwieramy księgi i prowadzimy rozliczenia spółki od pierwszego dnia.',
      },
    ],
  },
  faq: {
    title: 'Najczęstsze pytania',
    items: [
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
        answer: 'Między innymi zgłosić beneficjentów rzeczywistych do CRBR, w razie potrzeby zarejestrować spółkę jako podatnika VAT i uzupełnić dane w urzędzie skarbowym. Pomożemy przejść przez te kroki.',
      },
      {
        question: 'Czy cudzoziemiec może założyć spółkę z o.o. w Polsce?',
        answer: 'Tak, wspólnikami i członkami zarządu spółki z o.o. mogą być także cudzoziemcy, w tym obywatele Ukrainy.',
      },
      {
        question: 'Ile kosztuje inkubator?',
        answer: 'Cena zależy od zakresu wsparcia i skali działalności spółki. Wycenę przygotowujemy indywidualnie i bezpłatnie – zostaw numer telefonu, a oddzwonimy.',
      },
    ],
  },
};
