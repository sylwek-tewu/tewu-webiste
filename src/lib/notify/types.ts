export interface CallbackNotificationData {
  id: string; // e.g. 'A7K2'
  phone: string; // E.164 phone
  slot: string; // 'asap' | '8-12' | '12-16' | '17-18'
  topic?: string;
  source: string; // 'header' | 'floating' | 'contact' | 'hero'
  createdAt: string; // ISO string
}
