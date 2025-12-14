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

type InferredRouteDecorator = (target: new (...args: unknown[]) => unknown) => void;

type RouteDecoratorFunction = <T extends string>(
  path: RoutePathType<T>,
  config: TypedRouteConfig<T>,
) => InferredRouteDecorator;

const createRouteDecorator = (method: HttpMethodType) => {
  return <T extends string>(path: RoutePathType<T>, config: TypedRouteConfig<T>): InferredRouteDecorator => {
    return (target: new (...args: unknown[]) => unknown): void => {
      const route: RouteConfigType = {
        ...config,
        path,
        method,
        isSocket: false,
        controller: target as ControllerClassType,
      };

      router.addRoute(route);
    };
  };
};

const createSocketDecorator = () => {
  return <T extends string>(path: RoutePathType<T>, config: TypedRouteConfig<T>): InferredRouteDecorator => {
    return (target: new (...args: unknown[]) => unknown): void => {
      const route: RouteConfigType = {
        ...config,
        path,
        method: "GET",
        isSocket: true,
        controller: target as ControllerClassType,
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

// @Route.delete("/users/:id/emails/:emailId/state/:state", {
//   name: "api.users.delete",
//   description: "Delete a user by ID",
//   params: {
//     state: Assert("string"),
//     id: Assert("string"),
//     emailId: Assert("string"),
//   },
//   payload: Assert({
//     name: "string",
//   }),
//   queries: Assert({
//     limit: "number",
//   }),
//   response: Assert({
//     success: "boolean",
//     message: "string",
//   }),
//   env: [Environment.LOCAL],
// })
// export class DeleteUserController {
//   public async index(context: ContextType<TypedRouteConfigType>) {
//     const { id } = context.params;
//
//     return context.response.json({
//       success: true,
//       message: `User with ID ${id} has been deleted`,
//     });
//   }
// }
