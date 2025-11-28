import type { ICategory } from "@ooneex/category";
import type { CurrencyCodeType } from "@ooneex/currencies";
import type { IImage } from "@ooneex/image";
import type { ITag } from "@ooneex/tag";
import type { IBase, ScalarType } from "@ooneex/types";

export enum EDiscountType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}

export enum ESubscriptionPeriod {
  MONTHLY = "monthly",
  YEARLY = "yearly",
  WEEKLY = "weekly",
  DAILY = "daily",
}

export type DiscountType = `${EDiscountType}`;
export type SubscriptionPeriodType = `${ESubscriptionPeriod}`;

export interface IProduct extends IBase {
  name: string;
  description?: string;
  categories?: ICategory[];
  currency: CurrencyCodeType;
  price: number;
  barcode?: string;
  images?: IImage[];
  attributes?: Record<string, ScalarType>;
  tags?: ITag[];
}

export interface IFeature extends IBase {
  name: string;
  description?: string;
  isEnabled?: boolean;
  limit?: number;
}

export interface ICoupon extends IBase {
  code: string;
  name?: string;
  description?: string;
  discountType: EDiscountType;
  discountValue: number;
  currency?: CurrencyCodeType;
  maxUses?: number;
  usedCount?: number;
  startAt?: Date;
  endAt?: Date;
  isActive?: boolean;
  minimumAmount?: number;
  applicableProducts?: IProduct[];
  applicablePlans?: IPlan[];
}

export interface IPlan extends IBase {
  name: string;
  description?: string;
  currency: CurrencyCodeType;
  price: number;
  period: ESubscriptionPeriod;
  periodCount?: number;
  features?: IFeature[];
  isActive?: boolean;
  trialDays?: number;
}

export interface ICredit extends IBase {
  balance: number;
  currency?: CurrencyCodeType;
  expiresAt?: Date;
  description?: string;
}

export interface ISubscription extends IBase {
  coupons?: ICoupon[];
  plans?: IPlan[];
  credits?: ICredit[];
  startAt: Date;
  endAt?: Date;
  isTrial?: boolean;
  isActive?: boolean;
}
