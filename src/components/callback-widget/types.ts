import { CallbackSlot, CallbackSource, CallbackTopic } from '@/lib/callback/types';
import type { ServicePageSlug } from '@/lib/service-pages';

export type WidgetTriggerSource = CallbackSource;

export interface CallbackContextType {
  isOpen: boolean;
  source: WidgetTriggerSource;
  /** The service page being viewed, so every opening there is attributed to it. */
  landingPage: ServicePageSlug | null;
  openWidget: (source?: WidgetTriggerSource) => void;
  closeWidget: () => void;
}

export interface CallbackFormData {
  phone: string;
  slot: CallbackSlot;
  topic?: CallbackTopic | '';
  honeypot?: string;
  elapsedMs?: number;
}
