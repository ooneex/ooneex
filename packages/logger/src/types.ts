import type { IException } from "@ooneex/exception";
import type { ScalarType } from "@ooneex/types";

export interface ILogger {
  error: (message: string | IException<ScalarType>, data?: Record<string, ScalarType>) => void;
  warn: (message: string, data?: Record<string, ScalarType>) => void;
  info: (message: string, data?: Record<string, ScalarType>) => void;
  debug: (message: string, data?: Record<string, ScalarType>) => void;
}
