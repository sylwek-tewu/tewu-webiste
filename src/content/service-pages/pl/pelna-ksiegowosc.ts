import type { ServicePageContent } from '../types';
import { PRICING_PROCESS, SWITCH_FROM_ANOTHER_OFFICE } from './shared';

export const pelnaKsiegowosc: ServicePageContent = {
  slug: 'pelna-ksiegowosc',
  locale: 'pl',
  meta: {
    title: 'Pełna księgowość spółek Szczecin – Biuro Rachunkowe TEWU',
    description: 'Księgi rachunkowe spółek z o.o., komandytowych, fundacji i stowarzyszeń w Szczecinie. Bezpłatna wycena – oddzwonimy.',
  },
  hero: {
    title: 'Pełna księgowość spółek w Szczecinie',
    lead: 'Prowadzimy księgi rachunkowe spółek, fundacji i stowarzyszeń zgodnie z ustawą o rachunkowości – od bieżącej ewidencji po roczne sprawozdanie finansowe.',
  },
  audience: {
    title: 'Dla kogo jest pełna księgowość?',
    items: [
      'Spółki z o.o., spółki akcyjne i proste spółki akcyjne',
      'Spółki komandytowe i komandytowo-akcyjne',
      'Spółki jawne, partnerskie i przedsiębiorcy, którzy przekroczyli limit przychodów uprawniający do prowadzenia KPiR',
      'Fundacje i stowarzyszenia',
    ],
  },
  scope: {
    title: 'Zakres obsługi',
    items: [
      'Prowadzenie ksiąg rachunkowych i ewidencji VAT',
      'Deklaracje podatkowe i pliki JPK (m.in. JPK_V7, CIT-8)',
      'Roczne sprawozdanie finansowe',
      'Opracowanie polityki rachunkowości',
      'Rozliczenia z ZUS i urzędem skarbowym',
      'Bieżące doradztwo księgowe i reprezentacja przed urzędami',
    ],
  },
  pricing: {
    title: 'Ile kosztuje pełna księgowość?',
    factors: [
      'Liczba dokumentów księgowych w miesiącu',
      'Forma prawna i specyfika działalności, np. transakcje zagraniczne i walutowe',
      'Liczba pracowników i współpracowników, jeśli zlecasz też kadry i płace',
      'Stan dotychczasowej dokumentacji i ewentualne zaległości',
    ],
    process: PRICING_PROCESS,
  },
  steps: SWITCH_FROM_ANOTHER_OFFICE,
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        question: 'Czy moja firma musi prowadzić pełną księgowość?',
        answer: 'Spółki kapitałowe (z o.o., akcyjne, proste spółki akcyjne) oraz spółki komandytowe i komandytowo-akcyjne prowadzą księgi rachunkowe zawsze. Spółki jawne osób fizycznych, spółki partnerskie, spółki cywilne i przedsiębiorcy indywidualni – po przekroczeniu ustawowego limitu przychodów. Fundacje i stowarzyszenia również prowadzą księgi rachunkowe. W razie wątpliwości sprawdzimy to w Twoim przypadku.',
      },
      {
        question: 'Ile kosztuje pełna księgowość?',
        answer: 'Cena zależy głównie od liczby dokumentów, formy prawnej i zakresu usług. Wycenę przygotowujemy indywidualnie i bezpłatnie – zostaw numer telefonu, a oddzwonimy.',
      },
      {
        question: 'Czy mogę przekazywać dokumenty elektronicznie?',
        answer: 'Tak, korzystamy z elektronicznego obiegu dokumentów. Sposób przekazywania dokumentów ustalimy na początku współpracy.',
      },
      {
        question: 'Czy przejmiecie księgowość w trakcie roku obrotowego?',
        answer: 'Tak. Zaczynamy od przeglądu dotychczasowych ksiąg i dokumentów, żeby kontynuować ewidencję bez luk i dotrzymać terminów.',
      },
      {
        question: 'Czy reprezentujecie spółkę przed urzędem skarbowym i ZUS?',
        answer: 'Tak, na podstawie pełnomocnictwa reprezentujemy klientów w kontaktach z urzędami, także podczas kontroli.',
      },
    ],
  },
};
