import type { CurrencyCodeType } from "@ooneex/currencies";
import type { IImage } from "@ooneex/image";
import type { ITag } from "@ooneex/tag";
import type { IBase, ScalarType } from "@ooneex/types";

export interface IProduct extends IBase {
  name: string;
  description?: string;
  categories?: string[];
  currency: CurrencyCodeType;
  price: number;
  barcode?: string;
  images?: IImage[];
  attributes?: Record<string, ScalarType>;
  metadata?: Record<string, unknown>;
  tags?: ITag[];
}

export interface ISubscription extends IBase {
  products: IProduct[];
  startAt: Date;
  endAt?: Date;
  isTrial?: boolean;
  isActive?: () => boolean;
}
