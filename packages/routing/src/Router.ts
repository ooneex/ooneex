import { container, EContainerScope } from "@ooneex/container";
import { RouterException } from "./RouterException";
import type { IRouter, RouteConfigType } from "./types";

export class Router implements IRouter {
  private routes: Map<string, RouteConfigType[]> = new Map();

  public addRoute(route: RouteConfigType): this {
    const name = route.name;

    for (const item of this.routes[Symbol.iterator]()) {
      const existingRoute = item[1].find((r) => r.name === name);

      if (existingRoute) {
        throw new RouterException(`Route with name '${name}' already exists`, route);
      }
    }

    const routes = this.routes.get(route.path) ?? [];
    routes.push(route);
    this.routes.set(route.path, routes);
    container.add(route.controller, EContainerScope.Singleton);

    return this;
  }

  public findRouteByPath(path: string): RouteConfigType[] | null {
    return this.routes.get(path) ?? null;
  }

  public findRouteByName(name: string): RouteConfigType | null {
    for (const item of this.routes[Symbol.iterator]()) {
      const existingRoute = item[1].find((r) => r.name === name);

      if (existingRoute) {
        return existingRoute;
      }
    }

    return null;
  }

  public getRoutes(): Map<string, RouteConfigType[]> {
    return this.routes;
  }

  public generate<P extends Record<string, string | number> = Record<string, string | number>>(
    name: string,
    params?: P,
  ): string {
    const route = this.findRouteByName(name);

    if (!route) {
      throw new RouterException(`Route with name '${name}' not found`);
    }

    let path: string = route.path;
    const paramMatches = path.match(/:[a-zA-Z0-9_]+/g) || [];

    if (paramMatches.length > 0) {
      if (!params || typeof params !== "object" || params === null) {
        throw new RouterException(`Route '${name}' requires parameters, but none were provided`);
      }

      for (const match of paramMatches) {
        const paramName = match.substring(1); // Remove the colon
        if (!(paramName in params)) {
          throw new RouterException(`Missing required parameter '${paramName}' for route '${name}'`);
        }

        path = path.replace(match, String(params[paramName]));
      }
    }

    return path;
  }
}

export const router = new Router();
