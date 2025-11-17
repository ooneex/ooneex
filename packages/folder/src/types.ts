import type { IColor } from "@ooneex/color";
import type { IBase, ScalarType } from "@ooneex/types";

export interface IFolder extends IBase {
  name: string;
  color?: IColor;
  description?: string;
  parent?: IFolder;
  children?: IFolder[];
  metadata?: Record<string, ScalarType>;
}
