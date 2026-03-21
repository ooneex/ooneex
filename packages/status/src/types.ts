import type { IBase } from "@ooneex/types";

export enum EStatus {
  // Initial states
  NOT_STARTED = "notStarted",
  DRAFT = "draft",
  PENDING = "pending",
  SUBMITTED = "submitted",

  // Review states
  IN_REVIEW = "inReview",
  REVIEWED = "reviewed",

  // Processing states
  IN_PROGRESS = "inProgress",
  PROCESSING = "processing",
  PROCESSED = "processed",
  QUEUED = "queued",

  // Ready states
  READY = "ready",
  SCHEDULED = "scheduled",

  // Decision states
  APPROVED = "approved",
  REJECTED = "rejected",

  // Completion states
  DONE = "done",
  COMPLETED = "completed",
  SUCCESS = "success",

  // Error states
  FAILED = "failed",
  ERROR = "error",
  CANCELLED = "cancelled",
  TIMEOUT = "timeout",

  // Storage states
  ARCHIVED = "archived",
  DELETE = "delete",
  DELETED = "deleted",

  // Active states
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISABLED = "disabled",
  ENABLED = "enabled",

  // Temporary states
  SUSPENDED = "suspended",
  PAUSED = "paused",
  ON_HOLD = "onHold",

  // Communication states
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",

  // Validation states
  VALID = "valid",
  INVALID = "invalid",
  EXPIRED = "expired",
}

export type StatusType = `${EStatus}`;

export interface IStatus extends IBase {
  status: StatusType;
  color?: string;
  description?: string;
  reason?: string;
}
