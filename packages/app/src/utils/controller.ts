import type { EnvironmentNameType } from "@ooneex/app-env";
import { container } from "@ooneex/container";
import type { ContextType } from "@ooneex/controller";
import { Exception } from "@ooneex/exception";
import type { IResponse } from "@ooneex/http-response";
import { HttpStatus, type StatusCodeType } from "@ooneex/http-status";
import type { RouteConfigType } from "@ooneex/routing";
import { logRequest } from "./logging";
import { validateResponse, validateRouteAccess } from "./validation";

type ControllerError = { message: string; status: StatusCodeType; key?: string | null };

export type HttpRouteHandlerOptions = {
  context: ContextType;
  route: RouteConfigType;
};

export const buildExceptionResponse = (
  context: ContextType,
  message: string,
  status: StatusCodeType,
  env: EnvironmentNameType,
  key?: string | null,
): Response => {
  return context.response.exception(message, { status, ...(key ? { key } : {}) }).get(env);
};

const executeController = async (
  controller: { index: (context: ContextType) => Promise<IResponse> | IResponse },
  context: ContextType,
): Promise<[IResponse, null] | [null, ControllerError]> => {
  try {
    const response = await controller.index(context);
    return [response, null];
  } catch (error: unknown) {
    if (error instanceof Exception) {
      return [null, { message: error.message, status: error.status as StatusCodeType, key: error.key }];
    }
    if (error instanceof Error) {
      return [null, { message: error.message, status: HttpStatus.Code.InternalServerError, key: "INTERNAL_ERROR" }];
    }
    return [
      null,
      { message: "An unknown error occurred", status: HttpStatus.Code.InternalServerError, key: "UNKNOWN_ERROR" },
    ];
  }
};

export const httpRouteHandler = async ({ context, route }: HttpRouteHandlerOptions): Promise<Response> => {
  const currentEnv = context.env.APP_ENV;

  const validationError = await validateRouteAccess(context, route, currentEnv);
  if (validationError) {
    const httpResponse = buildExceptionResponse(
      context,
      validationError.message,
      validationError.status,
      currentEnv,
      validationError.key,
    );
    logRequest(context);
    return httpResponse;
  }

  const controller = container.get(route.controller);

  const [response, controllerError] = await executeController(controller, context);
  if (controllerError) {
    const httpResponse = buildExceptionResponse(
      context,
      controllerError.message,
      controllerError.status,
      currentEnv,
      controllerError.key,
    );
    logRequest(context);
    return httpResponse;
  }

  const responseValidationError = validateResponse(route, response.getData());
  if (responseValidationError) {
    const httpResponse = buildExceptionResponse(
      context,
      responseValidationError.message,
      responseValidationError.status,
      currentEnv,
      responseValidationError.key,
    );
    logRequest(context);
    return httpResponse;
  }

  const httpResponse = response.get(currentEnv);
  logRequest(context);

  return httpResponse;
};
