import type { ControllerClassType } from "@ooneex/controller";
import type { HttpMethodType } from "@ooneex/types";
import type { AssertType } from "@ooneex/validation";
import { router } from "./Router";
import type { ExtractParameters, RouteConfigType, RoutePathType } from "./types";

type TypedRouteConfig<T extends string> = Omit<
  RouteConfigType,
  "method" | "path" | "isSocket" | "controller" | "params"
> & {
  params?: ExtractParameters<T> extends never ? never : Record<ExtractParameters<T>, AssertType>;
};

type InferredRouteDecorator = (target: ControllerClassType) => void;

type RouteDecoratorFunction = <T extends string>(
  path: RoutePathType<T>,
  config: TypedRouteConfig<T>,
) => InferredRouteDecorator;

const createRouteDecorator = (method: HttpMethodType) => {
  return <T extends string>(path: RoutePathType<T>, config: TypedRouteConfig<T>): InferredRouteDecorator => {
    return (target: ControllerClassType): void => {
      const route: RouteConfigType = {
        ...config,
        path,
        method,
        isSocket: false,
        controller: target,
      };

      router.addRoute(route);
    };
  };
};

const createSocketDecorator = () => {
  return <T extends string>(path: RoutePathType<T>, config: TypedRouteConfig<T>): InferredRouteDecorator => {
    return (target: ControllerClassType): void => {
      const route: RouteConfigType = {
        ...config,
        path,
        method: "GET",
        isSocket: true,
        controller: target,
      };

      router.addRoute(route);
    };
  };
};

export const Route = {
  get: createRouteDecorator("GET") as RouteDecoratorFunction,
  post: createRouteDecorator("POST") as RouteDecoratorFunction,
  put: createRouteDecorator("PUT") as RouteDecoratorFunction,
  delete: createRouteDecorator("DELETE") as RouteDecoratorFunction,
  patch: createRouteDecorator("PATCH") as RouteDecoratorFunction,
  options: createRouteDecorator("OPTIONS") as RouteDecoratorFunction,
  head: createRouteDecorator("HEAD") as RouteDecoratorFunction,
  socket: createSocketDecorator() as RouteDecoratorFunction,
};
