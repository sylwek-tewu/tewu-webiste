import type { ServicePageContent } from '../types';
import { DOCUMENTS_FAQ, PRICING_FACTORS, PRICING_PROCESS, SWITCH_ANY_MONTH_FAQ, SWITCH_FROM_ANOTHER_OFFICE, priceFaq } from './shared';

export const pelnaKsiegowosc: ServicePageContent = {
  slug: 'pelna-ksiegowosc',
  locale: 'pl',
  meta: {
    title: 'Pełna księgowość spółek Szczecin – Biuro Rachunkowe TEWU',
    description: 'Księgi rachunkowe spółek z o.o., akcyjnych, komandytowych i jawnych w Szczecinie. Ty zajmujesz się biznesem, my księgujemy. Bezpłatna wycena.',
  },
  hero: {
    title: 'Pełna księgowość spółek w Szczecinie',
    lead: 'Ty zajmujesz się biznesem, a my księgujemy. Prowadzimy księgi rachunkowe spółek zgodnie z ustawą o rachunkowości – od bieżącej ewidencji po roczne sprawozdanie finansowe.',
  },
  audience: {
    title: 'Dla kogo jest pełna księgowość?',
    items: [
      'Spółki z o.o., spółki akcyjne i proste spółki akcyjne',
      'Spółki komandytowe i komandytowo-akcyjne',
      'Spółki jawne, partnerskie i przedsiębiorcy, którzy przekroczyli limit przychodów uprawniający do prowadzenia KPiR',
    ],
  },
  scope: {
    title: 'Zakres obsługi',
    items: [
      'Prowadzenie ksiąg rachunkowych i ewidencji VAT',
      'Deklaracje podatkowe i pliki JPK (m.in. JPK_V7, CIT-8)',
      'Roczne sprawozdanie finansowe',
      'Pomoc w złożeniu sprawozdania przez Portal Rejestrów Sądowych i do Szefa KAS',
      'Opracowanie polityki rachunkowości',
      'Rozliczenia z ZUS i urzędem skarbowym',
      'Bieżące doradztwo księgowe i reprezentacja przed urzędami',
    ],
  },
  pricing: {
    title: 'Ile kosztuje pełna księgowość?',
    factors: PRICING_FACTORS,
    process: PRICING_PROCESS,
  },
  steps: SWITCH_FROM_ANOTHER_OFFICE,
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        question: 'Czy moja firma musi prowadzić pełną księgowość?',
        answer: 'Spółki kapitałowe (z o.o., akcyjne, proste spółki akcyjne) oraz spółki komandytowe i komandytowo-akcyjne prowadzą księgi rachunkowe zawsze. Spółki jawne osób fizycznych, spółki partnerskie, spółki cywilne i przedsiębiorcy indywidualni – po przekroczeniu ustawowego limitu przychodów. W razie wątpliwości sprawdzimy to w Twoim przypadku.',
      },
      {
        question: 'Czym różni się księgowość jednoosobowej firmy od spółki z o.o.?',
        answer: 'Jednoosobowa działalność prowadzi zwykle KPiR albo ewidencję przychodów na ryczałcie. Spółka z o.o. zawsze prowadzi pełne księgi rachunkowe i co roku sporządza sprawozdanie finansowe. Przy wyborze formy działalności omawiamy te różnice, żeby decyzja była świadoma.',
      },
      priceFaq('Ile kosztuje pełna księgowość?'),
      DOCUMENTS_FAQ,
      SWITCH_ANY_MONTH_FAQ,
      {
        question: 'Czy reprezentujecie spółkę przed urzędem skarbowym i ZUS?',
        answer: 'Tak, na podstawie pełnomocnictwa reprezentujemy klientów w kontaktach z urzędami, także podczas kontroli.',
      },
    ],
  },
};
