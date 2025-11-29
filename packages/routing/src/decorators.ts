import type { ContextType, ControllerClassType } from "@ooneex/controller";
import type { HttpMethodType } from "@ooneex/types";
import { Assert, type AssertType } from "@ooneex/validation";
import { AssertAppEnv } from "@ooneex/validation/constraints";
import { router } from "./Router";
import type { ExtractParameters, RouteConfigType, RoutePathType } from "./types";

type TypedRouteConfig<T extends string> = Omit<
  RouteConfigType,
  "method" | "path" | "isSocket" | "controller" | "params"
> & {
  params?: ExtractParameters<T> extends never ? never : Record<ExtractParameters<T>, AssertType>;
};

type InferredRouteDecorator = (target: new (...args: unknown[]) => unknown) => void;

const createRouteDecorator = (method: HttpMethodType) => {
  return <T extends string>(path: RoutePathType<T>, config: TypedRouteConfig<T>): InferredRouteDecorator => {
    return (target: new (...args: unknown[]) => unknown): void => {
      const route: RouteConfigType = {
        ...config,
        path,
        method,
        controller: target as ControllerClassType,
      };

      router.addRoute(route);
    };
  };
};

export const Route = {
  get: createRouteDecorator("GET"),
  post: createRouteDecorator("POST"),
  put: createRouteDecorator("PUT"),
  delete: createRouteDecorator("DELETE"),
  patch: createRouteDecorator("PATCH"),
  options: createRouteDecorator("OPTIONS"),
  head: createRouteDecorator("HEAD"),
};

type TypedRouteConfigType = {
  response: { success: boolean; message: string };
  request: {
    params: { id: string; emailId: string };
    payload: never;
    queries: never;
  };
};

@Route.delete("/users/:id/emails/:emailId/state/:state", {
  name: "api.users.delete",
  description: "Delete a user by ID",
  params: {
    state: Assert("string"),
    id: Assert("string"),
    emailId: Assert("string"),
  },
  payload: Assert({
    name: "string.url",
  }),
  env: AssertAppEnv,
})
export class DeleteUserController {
  public async index(context: ContextType<TypedRouteConfigType>) {
    const { id } = context.params;

    return context.response.json({
      success: true,
      message: `User with ID ${id} has been deleted`,
    });
  }
}
