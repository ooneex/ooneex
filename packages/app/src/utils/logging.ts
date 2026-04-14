import type { ContextType } from "@ooneex/controller";
import type { StatusCodeType } from "@ooneex/http-status";
import { LogsEntity } from "@ooneex/logger";
import type { ScalarType } from "@ooneex/types";

export const logRequest = (context: ContextType, statusOverride?: StatusCodeType): void => {
  const path = context.route?.path || "";
  const logger = context.logger as {
    success: (message: string, data?: LogsEntity) => void;
    info: (message: string, data?: LogsEntity) => void;
    warn: (message: string, data?: LogsEntity) => void;
    error: (message: string, data?: LogsEntity) => void;
  };

  if (!logger) {
    return;
  }

  const status = statusOverride ?? context.response.getStatus();
  const logData = new LogsEntity();
  logData.date = new Date();
  logData.status = status;
  logData.method = context.method;
  logData.path = path;
  if (context.route?.version) logData.version = context.route.version;
  logData.params = context.params as Record<string, ScalarType>;
  logData.payload = context.payload as Record<string, unknown>;
  logData.queries = context.queries as Record<string, ScalarType>;

  if (context.ip) logData.ip = context.ip;

  const userAgent = context.header.get("User-Agent");
  if (userAgent) logData.userAgent = userAgent;

  const referer = context.header.getReferer();
  if (referer) logData.referer = referer;

  if (context.user?.id) logData.userId = context.user.id;
  if (context.user?.email) logData.email = context.user.email;
  if (context.user?.lastName) logData.lastName = context.user.lastName;
  if (context.user?.firstName) logData.firstName = context.user.firstName;

  const message = `${context.method} ${path}`;

  if (status >= 500) {
    logger.error(message, logData);
  } else if (status >= 400) {
    logger.warn(message, logData);
  } else if (status >= 300) {
    logger.info(message, logData);
  } else {
    logger.success(message, logData);
  }
};
