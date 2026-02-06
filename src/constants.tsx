
import React from 'react';
import { NavItem, Service, ContactInfo } from './types';
import {
  Calculator,
  Users,
  FileText,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  Building2,
  ClipboardCheck,
  Scale,
  FileDigit,
  Clock,
  Coins,
  Cpu,
  CheckSquare
} from 'lucide-react';

export const COMPANY_NAME = "TEWU";
export const COMPANY_FULL_NAME = "Biuro Rachunkowe TEWU Sp. z o.o.";

export const NAV_LINKS: NavItem[] = [
  { label: 'Start', path: '/' },
  { label: 'O nas', path: '/o-nas' },
  { label: 'Usługi', path: '/uslugi' },
  { label: 'Outsourcing', path: '/outsourcing' },
  { label: 'Certyfikaty', path: '/certyfikaty' },
  { label: 'Kontakt', path: '/kontakt' }
];

export const SERVICES: Service[] = [
  {
    id: 'pelna-ksiegowosc',
    title: 'Prowadzenie ksiąg rachunkowych',
    description: 'Kompleksowa obsługa spółek prawa handlowego, fundacji i stowarzyszeń zgodnie z ustawą o rachunkowości.',
    icon: <Building2 size={24} />,
    features: [
      "Prowadzenie ksiąg rachunkowych (pełna księgowość)",
      "Sporządzanie rocznych sprawozdań finansowych",
      "Opracowanie Polityki Rachunkowości",
      "Bieżące doradztwo księgowe",
      "Nadzór nad księgowością"
    ]
  },
  {
    id: 'kpir',
    title: 'Podatkowa księga przychodów i rozchodów',
    description: 'Ewidencja dla osób fizycznych prowadzących działalność gospodarczą oraz spółek cywilnych.',
    icon: <Calculator size={24} />,
    features: [
      "Ewidencja przychodów i kosztów",
      "Prowadzenie rejestrów VAT zakupu i sprzedaży",
      "Ewidencja środków trwałych i wyposażenia",
      "Rozliczenia roczne PIT-36, PIT-36L",
      "Kontrola dokumentów pod względem formalnym"
    ]
  },
  {
    id: 'ryczalt',
    title: 'Ryczałt ewidencjonowany',
    description: 'Obsługa uproszczonych form opodatkowania dla przedsiębiorców korzystających z ryczałtu.',
    icon: <FileDigit size={24} />,
    features: [
      "Ewidencja przychodów",
      "Obliczanie zaliczek na podatek dochodowy",
      "Sporządzanie zeznania rocznego PIT-28",
      "Weryfikacja poprawności stawek ryczałtu",
      "Obsługa JPK_EWP"
    ]
  },
  {
    id: 'kadry-place',
    title: 'Księgowość kadrowo-płacowa',
    description: 'Pełna obsługa procesów zatrudnienia, naliczanie wynagrodzeń oraz prowadzenie akt osobowych.',
    icon: <Users size={24} />,
    features: [
      "Sporządzanie list płac",
      "Obsługa umów o pracę i cywilnoprawnych",
      "Prowadzenie akt osobowych pracowników",
      "Sporządzanie deklaracji ZUS i PIT",
      "Wystawianie zaświadczeń dla pracowników"
    ]
  },
  {
    id: 'zus-us',
    title: 'Rozliczenia z ZUS i US',
    description: 'Terminowe sporządzanie i przesyłanie rozliczeń do Zakładu Ubezpieczeń Społecznych i Urzędów Skarbowych.',
    icon: <ClipboardCheck size={24} />,
    features: [
      "Deklaracje rozliczeniowe ZUS DRA",
      "Zgłaszanie i wyrejestrowywanie z ubezpieczeń",
      "Reprezentacja przed ZUS i US",
      "Wnioski o niezaleganiu",
      "Korekty deklaracji"
    ]
  },
  {
    id: 'deklaracje',
    title: 'Sporządzanie deklaracji podatkowych',
    description: 'Przygotowanie deklaracji VAT, CIT, PIT, JPK oraz innych wymaganych prawem sprawozdań.',
    icon: <FileText size={24} />,
    features: [
      "Deklaracje VAT-7, VAT-UE",
      "Pliki JPK_V7",
      "Zeznania roczne CIT-8",
      "Deklaracje PIT-11, PIT-4R, PIT-8AR",
      "Sprawozdania GUS / NBP"
    ]
  },
  {
    id: 'reprezentacja',
    title: 'Reprezentowanie przed organami',
    description: 'Zastępstwo i wsparcie podczas kontroli skarbowych oraz w bieżących kontaktach z urzędami.',
    icon: <Scale size={24} />,
    features: [
      "Udział w kontrolach podatkowych i ZUS",
      "Sporządzanie wyjaśnień i pism procesowych",
      "Odwołania od decyzji organów",
      "Bieżący kontakt z urzędami",
      "Pełnomocnictwo ogólne i szczególne"
    ]
  },
  {
    id: 'doradztwo',
    title: 'Doradztwo podatkowe',
    description: 'Profesjonalne wsparcie w optymalizacji zobowościń podatkowych i interpretacji przepisów.',
    icon: <TrendingUp size={24} />,
    features: [
      "Wybór optymalnej formy opodatkowania",
      "Analiza umów pod kątem podatkowym",
      "Konsultacje w zakresie bieżącej działalności",
      "Audyty podatkowe",
      "Wnioski o interpretacje indywidualne"
    ]
  }
];

export const CONTACT_DETAILS: ContactInfo = {
  address: "Al. Powstańców Wielkopolskich 78A LU2, 70-110 Szczecin",
  phone: "91 48 24 190",
  email: "biuro@tewu.szczecin.pl",
  hours: "Pon - Pt: 8:00 - 16:00"
};

export const REASONS_TO_TRUST = [
  {
    title: "Wieloletnie doświadczenie i profesjonalizm",
    description: "Nasz zespół to wykwalifikowani eksperci z bogatym stażem w branży finansowej i podatkowej.",
    icon: <Briefcase size={32} />
  },
  {
    title: "Terminowość i rzetelność",
    description: "Gwarantujemy dotrzymanie wszystkich terminów ustawowych i najwyższą precyzję prowadzonych rozliczeń.",
    icon: <Clock size={32} />
  },
  {
    title: "Bezpieczeństwo",
    description: "Stosujemy rygorystyczne procedury ochrony danych i standardy gwarantujące bezpieczeństwo finansów.",
    icon: <ShieldCheck size={32} />
  },
  {
    title: "Atrakcyjne ceny",
    description: "Oferujemy wysoką jakość usług w konkurencyjnych stawkach, dostosowanych do skali Twojej działalności.",
    icon: <Coins size={32} />
  },
  {
    title: "Indywidualne podejście",
    description: "Każdy klient jest dla nas partnerem. Model współpracy dopasowujemy do specyfiki Twojej branży.",
    icon: <Users size={32} />
  },
  {
    title: "Nowoczesne Rozwiązania",
    description: "Wykorzystujemy zaawansowane systemy IT, umożliwiając szybki i wygodny elektroniczny obieg dokumentów.",
    icon: <Cpu size={32} />
  },
  {
    title: "Bezpieczeństwo i Polisa OC",
    description: "Posiadamy pełne ubezpieczenie odpowiedzialności cywilnej, co stanowi realną gwarancję ochrony interesów klienta.",
    icon: <CheckSquare size={32} />
  }
];
