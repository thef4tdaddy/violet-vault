/**
 * Event and activity logging types
 */

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  entityType: EntityType;
  entityId: string;
  userId?: string;
  timestamp: number;
  data?: Record<string, unknown>;
  description: string;
}

export type ActivityType = 
  | 'created'
  | 'updated' 
  | 'deleted'
  | 'funded'
  | 'paid'
  | 'reconciled'
  | 'imported'
  | 'exported'
  | 'synced';

export type EntityType = 
  | 'envelope'
  | 'transaction'
  | 'bill' 
  | 'paycheck'
  | 'debt'
  | 'savings_goal'
  | 'user'
  | 'budget';

export interface EventHandler<T = unknown> {
  (event: T): void | Promise<void>;
}

export interface CustomEvent<T = unknown> extends Event {
  detail: T;
}

export interface ElementEvent<T extends Element = Element> extends Event {
  target: T;
  currentTarget: T;
}

export interface FormEvent<T extends HTMLFormElement = HTMLFormElement> extends Event {
  target: T;
  currentTarget: T;
}

export interface ChangeEvent<T extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement = HTMLInputElement> extends Event {
  target: T;
  currentTarget: T;
}