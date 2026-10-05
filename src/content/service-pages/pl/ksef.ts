import type { ServicePageContent } from '../types';
import { PRICING_PROCESS } from './shared';

export const ksef: ServicePageContent = {
  slug: 'ksef',
  locale: 'pl',
  meta: {
    title: 'KSeF – e-faktury i księgowość Szczecin – Biuro TEWU',
    description: 'Pomoc w przejściu na Krajowy System e-Faktur w Szczecinie: uprawnienia, wybór narzędzia, księgowanie faktur z KSeF. Bezpłatna wycena.',
  },
  hero: {
    title: 'KSeF – obsługa e-faktur w Szczecinie',
    lead: 'Krajowy System e-Faktur jest obowiązkowy dla większości firm od 2026 roku. Pomagamy przejść na KSeF i prowadzimy księgowość na podstawie faktur pobieranych bezpośrednio z systemu.',
  },
  audience: {
    title: 'Dla kogo?',
    items: [
      'Firmy, które wystawiają faktury VAT i muszą robić to w KSeF',
      'Firmy, które odbierają faktury od kontrahentów przez KSeF',
      'Przedsiębiorcy, którzy chcą przekazywać faktury biuru bez wysyłania ich mailem',
    ],
  },
  scope: {
    title: 'Zakres obsługi',
    items: [
      'Wyjaśnienie, od kiedy i w jakim zakresie KSeF dotyczy Twojej firmy',
      'Nadanie biuru uprawnień w KSeF',
      'Pomoc w wyborze sposobu wystawiania e-faktur',
      'Księgowanie faktur pobieranych bezpośrednio z KSeF',
      'Wyjaśnienie zasad: numer KSeF, tryb offline i awaryjny, korekty',
    ],
  },
  pricing: {
    title: 'Ile kosztuje obsługa KSeF?',
    factors: [
      'Czy KSeF jest częścią stałej obsługi księgowej w naszym biurze',
      'Liczba wystawianych i otrzymywanych faktur',
      'Zakres potrzebnego wsparcia przy wdrożeniu',
    ],
    process: PRICING_PROCESS,
  },
  steps: {
    title: 'Przejście z innego biura w 3 krokach',
    items: [
      {
        title: 'Rozmowa i wycena',
        description: 'Poznajemy Twoją firmę i sposób fakturowania, ustalamy zakres współpracy i przedstawiamy wycenę.',
      },
      {
        title: 'Umowa i wypowiedzenie',
        description: 'Podpisujemy umowę, a Ty wypowiadasz umowę dotychczasowemu biuru. Ustalamy razem miesiąc, od którego przejmujemy rozliczenia.',
      },
      {
        title: 'Uprawnienia w KSeF',
        description: 'Nadajesz nam uprawnienia w KSeF, a my pobieramy faktury bezpośrednio z systemu – bez przesyłania ich mailem.',
      },
    ],
  },
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        question: 'Od kiedy KSeF jest obowiązkowy?',
        answer: 'Od 1 lutego 2026 r. wystawianie faktur w KSeF objęło największe firmy, a od 1 kwietnia 2026 r. pozostałych podatników VAT. Najmniejsze firmy i faktury z kas fiskalnych mają okres przejściowy do końca 2026 r. Sprawdzimy, które terminy dotyczą Twojej firmy.',
      },
      {
        question: 'Czy muszę kupić nowy program do faktur?',
        answer: 'Niekoniecznie. Faktury w KSeF można wystawiać w bezpłatnych narzędziach Ministerstwa Finansów albo w programie do fakturowania zintegrowanym z KSeF. Pomożemy dobrać rozwiązanie.',
      },
      {
        question: 'Jak biuro otrzyma moje faktury z KSeF?',
        answer: 'Nadajesz biuru uprawnienia w KSeF. Wtedy pobieramy faktury sprzedaży i zakupu bezpośrednio z systemu.',
      },
      {
        question: 'Co, jeśli KSeF nie działa?',
        answer: 'Przepisy przewidują tryb offline i tryb awaryjny – fakturę wystawia się poza systemem i przesyła do KSeF w określonym terminie. Wyjaśnimy, jak postępować w takiej sytuacji.',
      },
      {
        question: 'Ile kosztuje obsługa KSeF?',
        answer: 'Cena zależy od liczby faktur i zakresu wsparcia. Wycenę przygotowujemy indywidualnie i bezpłatnie – zostaw numer telefonu, a oddzwonimy.',
      },
    ],
  },
};
