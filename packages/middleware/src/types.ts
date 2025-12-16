import type { ContextConfigType, ContextType } from "@ooneex/controller";
import type { ContextConfigType as SocketContextConfigType, ContextType as SocketContextType } from "@ooneex/socket";

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type MiddlewareClassType = new (...args: any[]) => IMiddleware;
// biome-ignore lint/suspicious/noExplicitAny: trust me
export type SocketMiddlewareClassType = new (...args: any[]) => ISocketMiddleware;

export interface IMiddleware<T extends ContextConfigType = ContextConfigType> {
  handle: (context: ContextType<T>) => Promise<ContextType<T>> | ContextType<T>;
}

export interface ISocketMiddleware<T extends SocketContextConfigType = SocketContextConfigType> {
  handle: (context: SocketContextType<T>) => Promise<SocketContextType<T>> | SocketContextType<T>;
}
