export interface CallbackNotificationData {
  id: string; // 6 uppercase hex characters, e.g. 'C9F1A2'
  phone: string; // E.164 phone
  slot: string; // 'asap' | '8-12' | '12-16' | '17-18'
  topic?: string;
  source: string; // 'header' | 'floating' | 'contact' | 'hero'
  locale?: 'pl' | 'uk';
  createdAt: string; // ISO string
}
