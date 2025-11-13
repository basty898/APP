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

export enum SubscriptionStatus {
    Active = 'Activa',
    Paused = 'Pausada',
    Canceled = 'Cancelada',
}

export interface Subscription {
  id: string;
  platform: string;
  category: Category;
  amount: number;
  currency: Currency;
  period: Period;
  renewalDate: Date;
  createdAt?: Date;
  paymentMethod?: PaymentMethod;
  notes?: string;
  plan?: PlanType | string;
  enableReminder?: boolean;
  status: SubscriptionStatus;
  canceledAt?: Date;
  userEmail: string;
}

export enum UserRole {
    Admin = 'ADMIN',
    User = 'USER',
}

export enum UserStatus {
    Active = 'active',
    Blocked = 'blocked',
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface SignupRecord {
  signup_date: Date;
  users: {
    firstName: string;
    lastName: string;
    email: string;
  };
}
