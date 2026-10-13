import type { ServicePageContent } from '../types';
import { PRICING_FACTORS, PRICING_PROCESS, SWITCH_STEP_CONTRACT } from './shared';

export const ksef: ServicePageContent = {
  slug: 'ksef',
  locale: 'pl',
  meta: {
    title: 'KSeF – e-faktury i księgowość Szczecin – Biuro TEWU',
    description: 'KSeF w ramach stałej obsługi księgowej w Szczecinie: uprawnienia, pomoc w obsłudze systemu, księgowanie faktur z KSeF. Bezpłatna wycena.',
  },
  hero: {
    title: 'KSeF – obsługa e-faktur w Szczecinie',
    lead: 'Krajowy System e-Faktur jest obowiązkowy od 2026 roku. Obsługa KSeF jest częścią naszej stałej obsługi księgowej: pomagamy Ci korzystać z systemu i księgujemy faktury pobierane bezpośrednio z niego.',
  },
  audience: {
    title: 'Dla kogo?',
    items: [
      'Firmy, którym prowadzimy księgowość albo które chcą ją u nas prowadzić',
      'Firmy, które wystawiają i odbierają faktury w KSeF',
      'Przedsiębiorcy, którzy chcą przekazywać faktury biuru bez wysyłania ich mailem',
    ],
  },
  scope: {
    title: 'Zakres obsługi',
    items: [
      'Wyjaśnienie, od kiedy i w jakim zakresie KSeF dotyczy Twojej firmy',
      'Nadanie biuru uprawnień i certyfikatu w KSeF',
      'Pomoc w bieżącej obsłudze KSeF',
      'Pomoc w wyborze sposobu wystawiania e-faktur – polecamy platformę FIRMINO',
      'Księgowanie faktur pobieranych bezpośrednio z KSeF',
      'Wyjaśnienie zasad: numer KSeF, tryb offline i awaryjny, korekty',
    ],
  },
  pricing: {
    title: 'Ile kosztuje obsługa KSeF?',
    factors: ['KSeF jest częścią stałej obsługi księgowej, więc liczy się zakres całej obsługi', ...PRICING_FACTORS],
    process: PRICING_PROCESS,
  },
  steps: {
    title: 'Przejście z innego biura w 3 krokach',
    items: [
      {
        title: 'Rozmowa i wycena',
        description: 'Poznajemy Twoją firmę i sposób fakturowania, ustalamy zakres współpracy i przedstawiamy wycenę.',
      },
      SWITCH_STEP_CONTRACT,
      {
        title: 'Uprawnienia w KSeF',
        description: 'Nadajesz nam uprawnienia w KSeF i generujesz dla nas certyfikat z hasłem. Pobieramy faktury bezpośrednio z systemu i pomagamy Ci w obsłudze KSeF.',
      },
    ],
  },
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        question: 'Od kiedy KSeF jest obowiązkowy?',
        answer: 'Od 1 lutego 2026 r. faktury w KSeF wystawiają największe firmy, a od 1 kwietnia 2026 r. pozostali podatnicy – nie tylko czynni podatnicy VAT. Od stycznia 2027 r. obowiązek obejmuje wszystkich podatników z siedzibą lub stałym miejscem prowadzenia działalności w Polsce, także tych, którzy w 2026 r. korzystają z okresu przejściowego. Sprawdzimy, które terminy dotyczą Twojej firmy.',
      },
      {
        question: 'Czy pomagacie w KSeF firmom, którym nie prowadzicie księgowości?',
        answer: 'Nie. Pomoc w KSeF jest częścią stałej obsługi księgowej i obejmuje naszych klientów księgowych.',
      },
      {
        question: 'Czy muszę kupić nowy program do faktur?',
        answer: 'Niekoniecznie. Faktury w KSeF można wystawiać w bezpłatnych narzędziach Ministerstwa Finansów albo w programie zintegrowanym z KSeF. Naszym klientom polecamy platformę FIRMINO.',
      },
      {
        question: 'Jak biuro otrzyma moje faktury z KSeF?',
        answer: 'Nadajesz biuru uprawnienia w KSeF i generujesz dla nas certyfikat z hasłem. Wtedy pobieramy faktury sprzedaży i zakupu bezpośrednio z systemu.',
      },
      {
        question: 'Co, jeśli KSeF nie działa?',
        answer: 'Przepisy przewidują tryb offline i tryb awaryjny – fakturę wystawia się poza systemem i przesyła do KSeF w określonym terminie. Wyjaśnimy, jak postępować w takiej sytuacji.',
      },
      {
        question: 'Ile kosztuje obsługa KSeF?',
        answer: 'Obsługa KSeF jest częścią stałej obsługi księgowej, a nie osobną usługą. Cenę obsługi ustalamy indywidualnie – wycena jest bezpłatna. Zostaw numer telefonu, a oddzwonimy.',
      },
    ],
  },
};
