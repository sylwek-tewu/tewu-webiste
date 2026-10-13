import type { ServicePageContent } from '../types';
import { PRICING_FACTORS, PRICING_PROCESS, SWITCH_FROM_ANOTHER_OFFICE, priceFaq } from './shared';

export const ryczalt: ServicePageContent = {
  slug: 'ryczalt',
  locale: 'pl',
  meta: {
    title: 'Księgowość na ryczałcie Szczecin – Biuro Rachunkowe TEWU',
    description: 'Obsługa ryczałtu ewidencjonowanego w Szczecinie: ewidencja przychodów, stawki, PIT-28, ZUS, także najem prywatny. Bezpłatna wycena.',
  },
  hero: {
    title: 'Ryczałt ewidencjonowany – księgowość w Szczecinie',
    lead: 'Prowadzimy ewidencję przychodów i rozliczenia przedsiębiorców na ryczałcie – od właściwej stawki po zeznanie roczne. Rozliczamy też ryczałt od najmu prywatnego.',
  },
  audience: {
    title: 'Dla kogo?',
    items: [
      'Jednoosobowe działalności gospodarcze na ryczałcie ewidencjonowanym',
      'Spółki cywilne rozliczające się ryczałtem',
      'Przedsiębiorcy, którzy rozważają przejście na ryczałt',
      'Osoby wynajmujące prywatnie mieszkania lub lokale',
    ],
  },
  scope: {
    title: 'Zakres obsługi',
    items: [
      'Prowadzenie ewidencji przychodów',
      'Weryfikacja właściwej stawki ryczałtu',
      'Obliczanie miesięcznego lub kwartalnego ryczałtu',
      'Rejestry VAT i pliki JPK_V7 dla czynnych podatników VAT',
      'Rozliczenia ZUS przedsiębiorcy, w tym składki zdrowotnej',
      'Zeznanie roczne PIT-28',
      'Rozliczenie ryczałtu od najmu prywatnego',
    ],
  },
  pricing: {
    title: 'Ile kosztuje obsługa ryczałtu?',
    factors: PRICING_FACTORS,
    process: PRICING_PROCESS,
  },
  steps: SWITCH_FROM_ANOTHER_OFFICE,
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        question: 'Jaka stawka ryczałtu obowiązuje w mojej branży?',
        answer: 'Stawka zależy od rodzaju działalności i wynosi od 2% do 17% przychodu. Sprawdzimy, która stawka dotyczy Twoich usług lub towarów.',
      },
      {
        question: 'Czy na ryczałcie mogę odliczać koszty?',
        answer: 'Nie – ryczałt płaci się od przychodu, bez pomniejszania go o koszty. Przy wysokich kosztach korzystniejsza może być KPiR. W rozmowie poznamy Twoje potrzeby i oczekiwania i pomożemy podjąć właściwą decyzję.',
      },
      {
        question: 'Jak liczona jest składka zdrowotna na ryczałcie?',
        answer: 'Jej wysokość zależy od rocznego przychodu – są trzy progi. Uwzględnimy ją przy porównaniu form opodatkowania.',
      },
      {
        question: 'Czy rozliczacie najem prywatny?',
        answer: 'Tak, rozliczamy ryczałt od najmu prywatnego – obliczamy podatek i przygotowujemy zeznanie roczne PIT-28.',
      },
      priceFaq('Ile kosztuje obsługa ryczałtu?'),
    ],
  },
};
