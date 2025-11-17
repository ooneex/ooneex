import type { IColor } from "@ooneex/color";
import type { IBase, ScalarType } from "@ooneex/types";

export interface ICategory extends IBase {
  name: string;
  color?: IColor;
  description?: string;
  parent?: ICategory;
  children?: ICategory[];
  metadata?: Record<string, ScalarType>;
}
