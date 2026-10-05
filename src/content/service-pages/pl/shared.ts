import type { ServicePageContent } from '../types';

export const PRICING_PROCESS: ServicePageContent['pricing']['process'] = [
  'Zostawiasz numer telefonu – oddzwaniamy w wybranej przez Ciebie porze.',
  'Rozmawiamy o Twojej firmie: skali działalności, liczbie dokumentów i potrzebach.',
  'Przygotowujemy indywidualną wycenę – bezpłatnie i bez zobowiązań.',
];

export const SWITCH_FROM_ANOTHER_OFFICE: ServicePageContent['steps'] = {
  title: 'Przejście z innego biura w 3 krokach',
  items: [
    {
      title: 'Rozmowa i wycena',
      description: 'Poznajemy Twoją firmę, ustalamy zakres współpracy i przedstawiamy wycenę.',
    },
    {
      title: 'Umowa i wypowiedzenie',
      description: 'Podpisujemy umowę, a Ty wypowiadasz umowę dotychczasowemu biuru. Ustalamy razem miesiąc, od którego przejmujemy rozliczenia.',
    },
    {
      title: 'Przekazanie dokumentacji',
      description: 'Przejmujemy dokumenty i dane księgowe od poprzedniego biura i kontynuujemy rozliczenia bez przerwy w terminach.',
    },
  ],
};
