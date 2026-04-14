import { container } from "@ooneex/container";
import type { ContextType } from "@ooneex/controller";
import type { IMiddleware, MiddlewareClassType } from "@ooneex/middleware";

export const runMiddlewares = async (
  context: ContextType,
  middlewares: MiddlewareClassType[],
): Promise<ContextType> => {
  let currentContext = context;

  for (const MiddlewareClass of middlewares) {
    const middleware = container.get<IMiddleware>(MiddlewareClass);
    currentContext = await middleware.handler(currentContext);
  }

  return currentContext;
};
