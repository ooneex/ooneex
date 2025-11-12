import type { ExceptionStackFrameType } from "@ooneex/exception";
import type { HttpMethodType, ScalarType } from "@ooneex/types";
import type { LevelType } from "./types";

export class LogsEntity {
  id: string;
  level: LevelType;
  message?: string;
  date: Date = new Date();
  userId?: string;
  email?: string;
  lastName?: string;
  firstName?: string;
  status?: number;
  exceptionName?: string;
  stackTrace?: ExceptionStackFrameType[];
  ip?: string;
  method?: HttpMethodType;
  path?: string;
  userAgent?: string;
  referer?: string;
  params?: Record<string, ScalarType>;
  payload?: Record<string, ScalarType>;
  queries?: Record<string, ScalarType>;
}
