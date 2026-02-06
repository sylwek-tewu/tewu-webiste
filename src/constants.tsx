
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
    icon: <Building2 className="w-6 h-6" />
  },
  {
    id: 'kpir',
    title: 'Podatkowa księga przychodów i rozchodów',
    description: 'Ewidencja dla osób fizycznych prowadzących działalność gospodarczą oraz spółek cywilnych.',
    icon: <Calculator className="w-6 h-6" />
  },
  {
    id: 'ryczalt',
    title: 'Ryczałt ewidencjonowany',
    description: 'Obsługa uproszczonych form opodatkowania dla przedsiębiorców korzystających z ryczałtu.',
    icon: <FileDigit className="w-6 h-6" />
  },
  {
    id: 'kadry-place',
    title: 'Księgowość kadrowo-płacowa',
    description: 'Pełna obsługa procesów zatrudnienia, naliczanie wynagrodzeń oraz prowadzenie akt osobowych.',
    icon: <Users className="w-6 h-6" />
  },
  {
    id: 'zus-us',
    title: 'Rozliczenia z ZUS i US',
    description: 'Terminowe sporządzanie i przesyłanie rozliczeń do Zakładu Ubezpieczeń Społecznych i Urzędów Skarbowych.',
    icon: <ClipboardCheck className="w-6 h-6" />
  },
  {
    id: 'deklaracje',
    title: 'Sporządzanie deklaracji podatkowych',
    description: 'Przygotowanie deklaracji VAT, CIT, PIT, JPK oraz innych wymaganych prawem sprawozdań.',
    icon: <FileText className="w-6 h-6" />
  },
  {
    id: 'reprezentacja',
    title: 'Reprezentowanie przed organami',
    description: 'Zastępstwo i wsparcie podczas kontroli skarbowych oraz w bieżących kontaktach z urzędami.',
    icon: <Scale className="w-6 h-6" />
  },
  {
    id: 'doradztwo',
    title: 'Doradztwo podatkowe',
    description: 'Profesjonalne wsparcie w optymalizacji zobowościń podatkowych i interpretacji przepisów.',
    icon: <TrendingUp className="w-6 h-6" />
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
    icon: <Briefcase className="w-8 h-8" />
  },
  {
    title: "Terminowość i rzetelność",
    description: "Gwarantujemy dotrzymanie wszystkich terminów ustawowych i najwyższą precyzję prowadzonych rozliczeń.",
    icon: <Clock className="w-8 h-8" />
  },
  {
    title: "Bezpieczeństwo",
    description: "Stosujemy rygorystyczne procedury ochrony danych i standardy gwarantujące bezpieczeństwo finansów.",
    icon: <ShieldCheck className="w-8 h-8" />
  },
  {
    title: "Atrakcyjne ceny",
    description: "Oferujemy wysoką jakość usług w konkurencyjnych stawkach, dostosowanych do skali Twojej działalności.",
    icon: <Coins className="w-8 h-8" />
  },
  {
    title: "Indywidualne podejście",
    description: "Każdy klient jest dla nas partnerem. Model współpracy dopasowujemy do specyfiki Twojej branży.",
    icon: <Users className="w-8 h-8" />
  },
  {
    title: "Nowoczesne Rozwiązania",
    description: "Wykorzystujemy zaawansowane systemy IT, umożliwiając szybki i wygodny elektroniczny obieg dokumentów.",
    icon: <Cpu className="w-8 h-8" />
  },
  {
    title: "Bezpieczeństwo i Polisa OC",
    description: "Posiadamy pełne ubezpieczenie odpowiedzialności cywilnej, co stanowi realną gwarancję ochrony interesów klienta.",
    icon: <CheckSquare className="w-8 h-8" />
  }
];
