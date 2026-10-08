import type { ServicePageContent } from '../types';
import { PRICING_FACTORS, PRICING_PROCESS, SWITCH_FROM_ANOTHER_OFFICE, priceFaq } from './shared';

export const kadryIPlace: ServicePageContent = {
  slug: 'kadry-i-place',
  locale: 'pl',
  meta: {
    title: 'Kadry i płace Szczecin – Biuro Rachunkowe TEWU',
    description: 'Pełna obsługa kadrowo-płacowa w Szczecinie razem z księgowością: listy płac, umowy, akta, PPK, ZUS i PIT. Bezpłatna wycena – oddzwonimy.',
  },
  hero: {
    title: 'Kadry i płace w Szczecinie',
    lead: 'Prowadzimy pełną obsługę kadrowo-płacową dla firm, którym prowadzimy księgowość: naliczamy wynagrodzenia, prowadzimy dokumentację pracowniczą i rozliczamy składki oraz podatki. Po Twojej stronie są tylko listy obecności.',
  },
  audience: {
    title: 'Dla kogo?',
    items: [
      'Firmy zatrudniające pracowników na umowę o pracę',
      'Firmy współpracujące ze zleceniobiorcami i wykonawcami umów o dzieło',
      'Przedsiębiorcy, którzy zatrudniają pierwszego pracownika',
      'Firmy zatrudniające cudzoziemców, w tym obywateli Ukrainy',
    ],
  },
  scope: {
    title: 'Zakres obsługi',
    items: [
      'Sporządzanie list płac',
      'Umowy o pracę i umowy cywilnoprawne',
      'Akta osobowe, świadectwa pracy i ewidencja czasu pracy',
      'Zgłoszenia i wyrejestrowania w ZUS',
      'Deklaracje ZUS i PIT (m.in. PIT-11, PIT-4R)',
      'Obsługa PPK',
      'Pilnowanie terminów badań lekarskich i szkoleń BHP',
      'Zatrudnianie cudzoziemców: powiadomienia do urzędu pracy i zezwolenia',
    ],
  },
  pricing: {
    title: 'Ile kosztuje obsługa kadr i płac?',
    factors: [...PRICING_FACTORS, 'Liczba osób, które rozliczamy, i rodzaje umów'],
    process: PRICING_PROCESS,
  },
  steps: SWITCH_FROM_ANOTHER_OFFICE,
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        question: 'Czy prowadzicie pełną obsługę kadrowo-płacową?',
        answer: 'Tak. Po Twojej stronie jest tylko dostarczanie list obecności potrzebnych do sporządzenia list płac – resztą zajmujemy się my.',
      },
      {
        question: 'Czy mogę zlecić same kadry i płace, bez księgowości?',
        answer: 'Nie. Kadry i płace prowadzimy dla firm, którym prowadzimy też księgowość.',
      },
      {
        question: 'Czy pomagacie zatrudnić cudzoziemca, np. obywatela Ukrainy?',
        answer: 'Tak, pomagamy przy zatrudnianiu cudzoziemców, w tym obywateli Ukrainy: przygotowujemy powiadomienia do urzędu pracy i pomagamy w sprawach zezwoleń.',
      },
      {
        question: 'Czy przygotujecie umowę dla nowego pracownika?',
        answer: 'Tak, przygotowujemy umowy o pracę i umowy cywilnoprawne oraz zgłaszamy pracowników do ZUS.',
      },
      priceFaq('Ile kosztuje obsługa kadr i płac?'),
    ],
  },
};
