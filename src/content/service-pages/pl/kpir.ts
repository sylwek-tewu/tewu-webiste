import type { ServicePageContent } from '../types';
import { PRICING_FACTORS, PRICING_PROCESS, SWITCH_FROM_ANOTHER_OFFICE, priceFaq } from './shared';

export const kpir: ServicePageContent = {
  slug: 'kpir',
  locale: 'pl',
  meta: {
    title: 'Księgowość KPiR Szczecin – Biuro Rachunkowe TEWU',
    description: 'Podatkowa księga przychodów i rozchodów dla firm i spółek cywilnych w Szczecinie: VAT, ZUS, PIT, ulgi. Bezpłatna wycena – oddzwonimy.',
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
      'Ulgi podatkowe i wspólne rozliczenie z małżonkiem (na skali podatkowej)',
    ],
  },
  pricing: {
    title: 'Ile kosztuje prowadzenie KPiR?',
    factors: PRICING_FACTORS,
    process: PRICING_PROCESS,
  },
  steps: SWITCH_FROM_ANOTHER_OFFICE,
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        question: 'Skala podatkowa czy podatek liniowy – co wybrać?',
        answer: 'To zależy m.in. od wysokości dochodu, ulg i składki zdrowotnej. Najlepiej omówić to w rozmowie – na podstawie Twoich przychodów, kosztów i planów pomożemy podjąć właściwą decyzję.',
      },
      {
        question: 'Czy mogę zmienić formę opodatkowania w trakcie roku?',
        answer: 'Nie – formę opodatkowania można zmienić tylko na przełomie roku, ze skutkiem od 1 stycznia. Zmianę zgłasza się do 20. dnia miesiąca po miesiącu, w którym osiągnięto pierwszy przychód w nowym roku. Przed zmianą warto porozmawiać – pomożemy ocenić, czy się opłaca.',
      },
      {
        question: 'Czy rozliczycie mnie wspólnie z małżonkiem?',
        answer: 'Tak, jeśli rozliczasz się na skali podatkowej. Przy podatku liniowym wspólne rozliczenie nie jest możliwe. W zeznaniu rocznym uwzględnimy też ulgi, z których możesz skorzystać.',
      },
      priceFaq('Ile kosztuje prowadzenie KPiR?'),
      {
        question: 'Jakie dokumenty muszę przekazywać i jak?',
        answer: 'Faktury sprzedaży i zakupu oraz inne dowody przychodów i wydatków firmy. Podstawą jest KSeF – faktury pobieramy bezpośrednio z systemu. Pozostałe dokumenty możesz przesyłać e-mailem albo przez WhatsApp.',
      },
      {
        question: 'Czy rozliczacie też moje składki ZUS?',
        answer: 'Tak, rozliczamy ZUS: przygotowujemy deklaracje rozliczeniowe ZUS przedsiębiorcy i pilnujemy terminów płatności składek.',
      },
    ],
  },
};
