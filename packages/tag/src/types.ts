import type { IColor } from "@ooneex/color";
import type { IBase, ScalarType } from "@ooneex/types";

export interface ITag extends IBase {
  name: string;
  color?: IColor;
  metadata?: Record<string, ScalarType>;
}
