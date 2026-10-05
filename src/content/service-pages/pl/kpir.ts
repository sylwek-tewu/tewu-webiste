import type { ServicePageContent } from '../types';
import { PRICING_PROCESS, SWITCH_FROM_ANOTHER_OFFICE } from './shared';

export const kpir: ServicePageContent = {
  slug: 'kpir',
  locale: 'pl',
  meta: {
    title: 'Księgowość KPiR Szczecin – Biuro Rachunkowe TEWU',
    description: 'Podatkowa księga przychodów i rozchodów dla firm i spółek cywilnych w Szczecinie: VAT, ZUS, PIT. Bezpłatna wycena – oddzwonimy.',
  },
  hero: {
    title: 'Księga przychodów i rozchodów (KPiR) w Szczecinie',
    lead: 'Prowadzimy podatkową księgę przychodów i rozchodów dla jednoosobowych firm i spółek cywilnych – razem z rozliczeniami VAT, ZUS i podatku dochodowego.',
  },
  audience: {
    title: 'Dla kogo jest KPiR?',
    items: [
      'Jednoosobowe działalności gospodarcze na skali podatkowej lub podatku liniowym',
      'Spółki cywilne i ich wspólnicy',
      'Spółki jawne osób fizycznych i spółki partnerskie poniżej limitu przychodów dla ksiąg rachunkowych',
      'Osoby, które dopiero zakładają firmę i wybierają formę opodatkowania',
    ],
  },
  scope: {
    title: 'Zakres obsługi',
    items: [
      'Prowadzenie podatkowej księgi przychodów i rozchodów',
      'Rejestry VAT zakupu i sprzedaży oraz pliki JPK_V7',
      'Ewidencja środków trwałych i wyposażenia',
      'Obliczanie zaliczek na podatek dochodowy',
      'Rozliczenia ZUS przedsiębiorcy',
      'Zeznania roczne PIT-36 i PIT-36L',
    ],
  },
  pricing: {
    title: 'Ile kosztuje prowadzenie KPiR?',
    factors: [
      'Liczba dokumentów w miesiącu',
      'Czy firma jest czynnym podatnikiem VAT',
      'Forma opodatkowania',
      'Liczba pracowników, jeśli zlecasz też kadry i płace',
    ],
    process: PRICING_PROCESS,
  },
  steps: SWITCH_FROM_ANOTHER_OFFICE,
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        question: 'Skala podatkowa czy podatek liniowy – co wybrać?',
        answer: 'To zależy od wysokości dochodu, ulg, z których korzystasz, oraz składki zdrowotnej. Pomożemy porównać obie formy na Twoich liczbach.',
      },
      {
        question: 'Czy mogę zmienić formę opodatkowania w trakcie roku?',
        answer: 'Co do zasady formę opodatkowania wybiera się na cały rok podatkowy, a zmianę zgłasza do 20. dnia miesiąca po miesiącu, w którym osiągnięto pierwszy przychód w roku. Pomożemy sprawdzić, czy zmiana się opłaca.',
      },
      {
        question: 'Ile kosztuje prowadzenie KPiR?',
        answer: 'Cena zależy od liczby dokumentów, rozliczeń VAT i zakresu usług. Wycenę przygotowujemy indywidualnie i bezpłatnie – zostaw numer telefonu, a oddzwonimy.',
      },
      {
        question: 'Jakie dokumenty muszę przekazywać?',
        answer: 'Przede wszystkim faktury sprzedaży i zakupu oraz inne dowody przychodów i wydatków firmy. Dokładną listę i terminy przekazywania ustalimy na początku współpracy.',
      },
      {
        question: 'Czy rozliczacie też moje składki ZUS?',
        answer: 'Tak, przygotowujemy deklaracje rozliczeniowe ZUS przedsiębiorcy i pilnujemy terminów płatności składek.',
      },
    ],
  },
};
