import { CallbackSlot, CallbackSource, CallbackTopic } from '@/lib/callback/types';

export type WidgetTriggerSource = CallbackSource;

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
  elapsedMs?: number;
}
