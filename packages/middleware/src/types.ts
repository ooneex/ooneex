// biome-ignore lint/suspicious/noExplicitAny: trust me
export type MiddlewareClassType = new (...args: any[]) => IMiddleware;

export interface IMiddleware {
  next: () => Promise<void>;
}
