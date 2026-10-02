import { CallbackSlot, CallbackTopic } from '@/lib/callback/types';

export type WidgetTriggerSource =
  | 'header'
  | 'floating'
  | 'contact'
  | 'hero'
  | 'service'
  | string;

export interface CallbackContextType {
  isOpen: boolean;
  source: WidgetTriggerSource;
  openWidget: (source?: WidgetTriggerSource) => void;
  closeWidget: () => void;
}

export interface CallbackFormData {
  phone: string;
  slot: CallbackSlot;
  topic?: CallbackTopic | '';
  honeypot?: string;
  formOpenedAt?: number;
}
