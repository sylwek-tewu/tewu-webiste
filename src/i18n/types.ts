import type { CallbackSlot, CallbackTopic } from '@/lib/callback/types';

export type Locale = 'pl' | 'uk';

export interface NavItemTranslation {
  label: string;
  path: string;
}

export interface ServiceItemTranslation {
  id: string;
  title: string;
  description: string;
  features: string[];
}

export interface ReasonItemTranslation {
  title: string;
  description: string;
}

export interface ValueItemTranslation {
  title: string;
  desc: string;
}

export interface FeatureBoxTranslation {
  title: string;
  desc: string;
}

export interface StepItemTranslation {
  step: string;
  title: string;
  desc: string;
}

export interface CertificateItemTranslation {
  title: string;
  desc: string;
  url: string;
  pdfUrl: string;
}

export interface Translations {
  locale: Locale;
  common: {
    companyName: string;
    companyFullName: string;
    officeText: string;
  };
  nav: {
    links: NavItemTranslation[];
    freeQuote: string;
    menu: string;
  };
  footer: {
    description: string;
    navTitle: string;
    servicesTitle: string;
    contactTitle: string;
    fullAccounting: string;
    revenueBook: string;
    bpoOutsourcing: string;
    hrAndPayroll: string;
    privacyPolicy: string;
    allRightsReserved: string;
  };
  home: {
    hero: {
      badge: string;
      titleNormal: string;
      titleAccent: string;
      description: string;
      ctaContact: string;
      ctaOffer: string;
      stats: {
        companiesCount: string;
        companiesLabel: string;
        yearsCount: string;
        yearsLabel: string;
        securityCount: string;
        securityLabel: string;
        reactionCount: string;
        reactionLabel: string;
      };
    };
    services: {
      sectionLabel: string;
      title: string;
      more: string;
      viewAll: (count: number) => string;
    };
    whyUs: {
      title: string;
      description: string;
      reasons: ReasonItemTranslation[];
    };
  };
  about: {
    header: {
      title: string;
      subtitle: string;
    };
    intro: {
      title: string;
      p1Prefix: string;
      p1Bold: string;
      p1Suffix: string;
      p2: string;
      bullets: string[];
      expNumber: string;
      expTitle: string;
      expDesc: string;
    };
    values: {
      label: string;
      title: string;
      items: ValueItemTranslation[];
    };
    mission: {
      title: string;
      quote: string;
    };
  };
  servicesPage: {
    header: {
      title: string;
      subtitle: string;
    };
    items: ServiceItemTranslation[];
    cta: {
      title: string;
      description: string;
      button: string;
    };
    values: {
      securityTitle: string;
      securityDesc: string;
      timelinessTitle: string;
      timelinessDesc: string;
      modernityTitle: string;
      modernityDesc: string;
    };
  };
  outsourcing: {
    header: {
      title: string;
      subtitle: string;
    };
    intro: {
      title: string;
      description: string;
      bullets: string[];
    };
    features: FeatureBoxTranslation[];
    steps: {
      title: string;
      subtitle: string;
      items: StepItemTranslation[];
    };
  };
  certificates: {
    header: {
      title: string;
      subtitle: string;
    };
    badge: string;
    title: string;
    p1Bold: string;
    p1Prefix: string;
    p1Suffix: string;
    p2: string;
    securityTitle: string;
    securityDesc: string;
    items: CertificateItemTranslation[];
    viewPdfButton: string;
  };
  contact: {
    header: {
      title: string;
      subtitle: string;
    };
    contactDataTitle: string;
    addressLabel: string;
    emailLabel: string;
    phoneOfficeLabel: string;
    phoneMobileLabel: string;
    hoursLabel: string;
    hoursValue: string;
    regAndBankTitle: string;
    fullNameLabel: string;
    fullNameValue: string;
    nipLabel: string;
    regonLabel: string;
    krsLabel: string;
    capitalLabel: string;
    capitalValue: string;
    courtLabel: string;
    courtValue: string;
    bankAccountLabel: string;
    mapTitle: string;
    mapSubtitle: string;
  };
  privacyPolicy: {
    headerTitle: string;
    headerSubtitle: string;
    metaTitle: string;
    metaDescription: string;
    legalNoteUk?: string;
    s1Title: string;
    s1Content: string;
    s1Location: string;
    s1NoDpo: string;
    s2Title: string;
    s2Intro: string;
    s2Bullets: string[];
    s3Title: string;
    s3Intro: string;
    s3Bullets: string[];
    s3Voluntary: string;
    s3Note: string;
    s4Title: string;
    s4Intro: string;
    s4MailTitle: string;
    s4MailDesc: string;
    s4NetlifyTitle: string;
    s4NetlifyDesc: string;
    s4BlobsTitle: string;
    s4BlobsDesc: (retentionHours: number) => string;
    s4TransferTitle: string;
    s4TransferDesc: string;
    s5Title: string;
    s5Content: string;
    s5Logs: string;
    s5Retention: (retentionHours: number) => string;
    s6Title: string;
    s6Intro: string;
    s6Bullets: string[];
    /** Art. 21(4) GDPR: the right to object is shown separately from the other rights. */
    s6Objection: string;
    s6Automated: string;
    s6Contact: string;
    s6Puodo: string;
    s7Title: string;
    s7Content: string;
  };
  notFound: {
    title: string;
    description: string;
    backHome: string;
  };
  callbackWidget: {
    floatingButton: string;
    mobileCall: string;
    mobileCallHours: string;
    /** Tooltip and accessible name of the disabled "office closed" button; timeSuffix is appended. */
    officeHours: string;
    mobileRequest: string;
    titleNormal: string;
    titleSuccess: string;
    description: string;
    phoneLabel: string;
    phonePlaceholder: string;
    phoneErrorRequired: string;
    phoneErrorInvalid: string;
    slotTitle: string;
    dutyNote: string;
    slots: Record<CallbackSlot, string>;
    topicLabel: string;
    topicPlaceholder: string;
    topics: Record<CallbackTopic, string>;
    rodoPrefix: string;
    rodoLink: string;
    rodoSuffix: string;
    submitButton: string;
    successTitle: string;
    successDesc: string;
    closeButton: string;
    errorTitle: string;
    callNow: string;
    /** Shown in the error alert, above the call button that carries the number. */
    errors: {
      connection: string;
      invalidRequest: string;
      slotInvalid: string;
      unavailable: string;
      deliveryFailed: string;
      unexpected: string;
    };
    formLoading: string;
    loadErrorTitle: string;
    loadErrorText: string;
    loadErrorCall: string;
    reloadPage: string;
    timeSuffix: string; // e.g. "(za polskim czasem)" or "(за польським часом)"
  };
}
