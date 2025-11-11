export enum Category {
  Streaming = 'Streaming',
  Music = 'Música',
  Gaming = 'Videojuegos',
  Software = 'Software',
  Sports = 'Deporte',
  News = 'Noticias',
  Other = 'Otros',
}

export enum Currency {
  CLP = 'CLP',
  USD = 'USD',
  EUR = 'EUR',
}

export enum Period {
  Monthly = 'Mensual',
  Annual = 'Anual',
}

export enum PaymentMethod {
  Cash = 'Efectivo',
  Debit = 'Débito',
  Credit = 'Crédito',
  Other = 'Otros',
}

export enum PlanType {
  Basic = 'Básico',
  Standard = 'Estándar',
  Premium = 'Premium',
}

export interface Subscription {
  id: string;
  name: string;
  category: Category;
  amount: number;
  currency: Currency;
  period: Period;
  renewalDate: Date;
  contractDate?: Date;
  paymentMethod?: PaymentMethod;
  notes?: string;
  plan?: PlanType | string;
  enableReminder?: boolean;
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}