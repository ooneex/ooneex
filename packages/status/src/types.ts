import type { IColor } from "@ooneex/color";
import type { IBase } from "@ooneex/types";

export enum EStatus {
  IN_REVIEW = "inReview",
  REVIEWED = "reviewed",
  DONE = "done",
  DELETE = "delete",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  ARCHIVED = "archived",
}

export type StatusType = `${EStatus}`;

export interface IStatus extends IBase {
  status: StatusType;
  color?: IColor;
  description?: string;
  reason?: string;
}
