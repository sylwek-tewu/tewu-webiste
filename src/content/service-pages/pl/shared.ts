import type { ServicePageContent, ServicePageFaqItem } from '../types';

// TEWU's own list of what the price depends on (answer A2), so the page says what the client hears on the phone.
export const PRICING_FACTORS: ServicePageContent['pricing']['factors'] = [
  'Rodzaj działalności',
  'Twoja znajomość zagadnień księgowych – ile wsparcia potrzebujesz na co dzień',
  'Liczba dokumentów',
  'Twoje potrzeby i oczekiwania',
];

// Answer A3: a conversation, then a meeting at the office or a preliminary quote by phone or e-mail.
export const PRICING_PROCESS: ServicePageContent['pricing']['process'] = [
  'Zostawiasz numer telefonu – oddzwaniamy w wybranej przez Ciebie porze.',
  'Rozmawiamy o Twojej firmie i potrzebach, o tym, jak prowadzisz dokumentację, i o przewidywanej liczbie dokumentów.',
  'Zapraszamy na spotkanie w biurze albo podajemy wstępną wycenę telefonicznie lub mailowo. Wycena jest bezpłatna.',
];

// Answer A1: no price list, every price is set individually.
export function priceFaq(question: string): ServicePageFaqItem {
  return {
    question,
    answer: 'Stosujemy indywidualne podejście, dlatego nie mamy sztywnego cennika. Cenę ustalamy po rozmowie – zależy m.in. od rodzaju działalności, liczby dokumentów i Twoich potrzeb. Wycena jest bezpłatna – zostaw numer telefonu, a oddzwonimy.',
  };
}

// Answer A4: TEWU helps with the whole switch, which is possible in any month.
export const SWITCH_STEP_CONTRACT = {
  title: 'Umowa i zmiana biura',
  description: 'Podpisujemy umowę i pomagamy zakończyć współpracę z dotychczasowym biurem, tak żeby zmiana była dla Ciebie bezproblemowa. Biuro można zmienić w każdym miesiącu roku.',
};

export const SWITCH_FROM_ANOTHER_OFFICE: ServicePageContent['steps'] = {
  title: 'Przejście z innego biura w 3 krokach',
  items: [
    {
      title: 'Rozmowa i wycena',
      description: 'Poznajemy Twoją firmę, ustalamy zakres współpracy i przedstawiamy wycenę.',
    },
    SWITCH_STEP_CONTRACT,
    {
      title: 'Przekazanie dokumentacji',
      description: 'Przejmujemy dokumenty i dane księgowe od poprzedniego biura i kontynuujemy rozliczenia bez przerwy w terminach.',
    },
  ],
};

export const SWITCH_ANY_MONTH_FAQ: ServicePageFaqItem = {
  question: 'Czy mogę zmienić biuro w trakcie roku?',
  answer: 'Tak, zmiana biura jest możliwa w każdym miesiącu roku. Pomagamy w całym procesie, żeby przejście było dla Ciebie bezproblemowe.',
};

// Answer A8: KSeF first, other documents by e-mail or WhatsApp.
export const DOCUMENTS_FAQ: ServicePageFaqItem = {
  question: 'Jak przekazuję dokumenty?',
  answer: 'Podstawą jest KSeF – faktury pobieramy bezpośrednio z systemu. Pozostałe dokumenty możesz przesyłać e-mailem albo przez WhatsApp.',
};
