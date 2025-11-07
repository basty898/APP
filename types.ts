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

export interface Subscription {
  id: string;
  name: string;
  category: Category;
  amount: number;
  currency: Currency;
  period: Period;
  renewalDate: Date;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}