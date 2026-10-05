import type { ServicePageContent } from '../types';
import { PRICING_PROCESS, SWITCH_FROM_ANOTHER_OFFICE } from './shared';

export const kadryIPlace: ServicePageContent = {
  slug: 'kadry-i-place',
  locale: 'pl',
  meta: {
    title: 'Kadry i płace Szczecin – Biuro Rachunkowe TEWU',
    description: 'Obsługa kadrowo-płacowa w Szczecinie: listy płac, umowy, akta osobowe, deklaracje ZUS i PIT. Bezpłatna wycena – oddzwonimy.',
  },
  hero: {
    title: 'Kadry i płace w Szczecinie',
    lead: 'Naliczamy wynagrodzenia, prowadzimy dokumentację pracowniczą i rozliczamy składki oraz podatki od wynagrodzeń.',
  },
  audience: {
    title: 'Dla kogo?',
    items: [
      'Firmy zatrudniające pracowników na umowę o pracę',
      'Firmy współpracujące ze zleceniobiorcami i wykonawcami umów o dzieło',
      'Przedsiębiorcy, którzy zatrudniają pierwszego pracownika',
    ],
  },
  scope: {
    title: 'Zakres obsługi',
    items: [
      'Sporządzanie list płac',
      'Umowy o pracę i umowy cywilnoprawne',
      'Prowadzenie akt osobowych pracowników',
      'Zgłoszenia i wyrejestrowania w ZUS',
      'Deklaracje ZUS i PIT (m.in. PIT-11, PIT-4R)',
      'Zaświadczenia dla pracowników',
    ],
  },
  pricing: {
    title: 'Ile kosztuje obsługa kadr i płac?',
    factors: [
      'Liczba osób, które rozliczamy',
      'Rodzaje umów: o pracę, zlecenia, o dzieło',
      'Zmienność wynagrodzeń, np. nadgodziny, premie, praca zmianowa',
      'Dodatkowe obowiązki pracodawcy, np. PPK',
    ],
    process: PRICING_PROCESS,
  },
  steps: SWITCH_FROM_ANOTHER_OFFICE,
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        question: 'Ile kosztuje obsługa kadr i płac?',
        answer: 'Cena zależy przede wszystkim od liczby osób, które rozliczamy, i rodzajów umów. Wycenę przygotowujemy indywidualnie i bezpłatnie – zostaw numer telefonu, a oddzwonimy.',
      },
      {
        question: 'Czy przygotujecie umowę dla nowego pracownika?',
        answer: 'Tak, przygotowujemy umowy o pracę i umowy cywilnoprawne oraz zgłaszamy pracowników do ZUS.',
      },
      {
        question: 'Czy prowadzicie akta osobowe pracowników?',
        answer: 'Tak, prowadzimy akta osobowe zgodnie z przepisami prawa pracy.',
      },
      {
        question: 'Jakie zaświadczenia wystawiacie pracownikom?',
        answer: 'Wystawiamy zaświadczenia potrzebne pracownikom, np. o zatrudnieniu i wynagrodzeniu.',
      },
    ],
  },
};
