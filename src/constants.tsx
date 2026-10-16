
import React from 'react';
import {
  Users,
  Briefcase,
  ShieldCheck,
  Clock,
  Coins,
  Cpu,
  CheckSquare
} from 'lucide-react';

export const COMPANY_NAME = "TEWU";
export const COMPANY_FULL_NAME = "Biuro Rachunkowe TEWU Sp. z o.o.";

/** Production origin; makes canonical and hreflang URLs absolute (metadataBase). */
export const SITE_URL = "https://tewu.szczecin.pl";

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
