// types.ts
export enum TransactionType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  DEBT_PAYMENT = 'DEBT_PAYMENT', // تحصيل دين
  CREDIT_PAYMENT = 'CREDIT_PAYMENT', // سداد مستحقات
  DEPOSIT = 'DEPOSIT', // إيداع
  EXPENSE = 'EXPENSE', // مصروف
}

export enum PaymentMethod {
  CASH = 'CASH',
  E_WALLET = 'E_WALLET',
  INSTAPAY = 'INSTAPAY',
  FAWRY = 'FAWRY',
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  amount: number;
  date: string; // ISO string
}

export type PurchaseCategory = 'GOLD' | 'SILVER';

export type TraderCategory = 'GOLD' | 'SILVER';

export interface Trader {
    id: string;
    name: string;
    phone: string;
    category: TraderCategory;
}

// New type for detailed trader accounting
export interface TraderTransaction {
  id: string;
  traderId: string;
  date: string; // ISO String
  description: string;
  
  // Gold accounting
  workWeight: number; // وزن الشغل المستلم (For Silver, this is just weight)
  scrapWeight: number; // وزن الكسر المسلم
  workmanshipFee: number; // الأجرة المستحقة
  
  // Silver accounting
  silverPricePerGram?: number; // سعر جرام الفضة

  // Common
  cashPayment: number; // نقدية مسددة
}

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string; // ISO String
  description: string;
  amount: number;
  paymentMethod?: PaymentMethod; // For DEPOSIT and EXPENSE, defaults to CASH
  // Optional fields for new Purchase type
  category?: PurchaseCategory;
  trader?: {
    name: string;
    phone: string;
  };
}

export type Page = 'home' | 'sales' | 'purchases' | 'treasury';

// Enhanced types for the Sales Page Invoicing System
export type ProductCategory = 'GOLD' | 'SILVER';
export type Karat = 18 | 21 | 24;
export type WorkmanshipType = 'PER_PIECE' | 'PER_GRAM';
export type SaleType = 'SELL' | 'BUY_BACK'; // بيع او شراء الذهب
export type SaleChannel = 'STORE' | 'ONLINE';

export interface InvoiceItem {
  id: string;
  saleType: SaleType;
  category: ProductCategory;
  karat: Karat | null;
  weight: number;
  pricePerGram: number;
  description?: string; // AI-generated description
  workmanshipType?: WorkmanshipType;
  workmanshipValue?: number;
  discountPercentage?: number;
  cashBackPerGram?: number;
  total: number;
}

export interface Customer {
    name: string;
    phone: string;
    address: string;
}

export interface Invoice extends Transaction {
    items: InvoiceItem[];
    payments: Payment[]; // Replaces amountPaid as source of truth
    customer: Customer;
    channel: SaleChannel;
    shipping: number;
    notes: string;
    amountPaid: number; // This will be a calculated field: sum of payments
    netTotal: number;
    remainingBalance: number;
}

// Type for the new Sales Summary
export interface SalesSummaryItem {
    weight: number;
    cash: number;
}

export interface SalesSummary {
    store: {
        gold24: SalesSummaryItem;
        gold21: SalesSummaryItem;
        gold18: SalesSummaryItem;
    };
    online: {
        gold24: SalesSummaryItem;
        gold21: SalesSummaryItem;
        gold18: SalesSummaryItem;
    };
    buyBack: {
        gold24: SalesSummaryItem;
        gold21: SalesSummaryItem;
        gold18: SalesSummaryItem;
        silver: SalesSummaryItem;
    };
    silver: SalesSummaryItem;
}

// Type for the new Purchases Summary
export interface PurchasesSummary {
  gold: {
    totalWorkWeight: number;
    totalWorkmanshipFee: number;
    totalScrapWeight: number;
    netGoldBalance: number;
  };
  silver: {
    totalWorkWeight: number;
    totalRequiredCash: number;
    totalCashPaid: number;
    netCashBalance: number;
  };
}

// Types for Unified Transaction Log
export type RecordType = 'invoice' | 'traderTransaction' | 'general';

export type TraderTransactionWithDetails = TraderTransaction & {
    traderName: string;
    traderCategory: TraderCategory;
};

export type LogEntry = (Invoice & { recordType: 'invoice' })
    | (Transaction & { recordType: 'general' })
    | (TraderTransactionWithDetails & { recordType: 'traderTransaction' });
