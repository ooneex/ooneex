import type { IColor } from "@ooneex/color";
import type { IBase } from "@ooneex/types";

export interface ITag extends IBase {
  name: string;
  color?: IColor;
}
