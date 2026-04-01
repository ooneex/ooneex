import type { ContextType as ControllerContextType } from "@ooneex/controller";
import type { RequestConfigType } from "@ooneex/http-request";
import type { IResponse } from "@ooneex/http-response";

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type ControllerClassType = new (...args: any[]) => IController;

export interface IController<T extends ContextConfigType = ContextConfigType> {
  index: (context: ContextType<T>) => Promise<IResponse<T["response"]>> | IResponse<T["response"]>;
}

export type ContextConfigType = {
  // biome-ignore lint/suspicious/noExplicitAny: trust me
  response: Record<string, any>;
} & RequestConfigType;

export type ContextType<T extends ContextConfigType = ContextConfigType> = ControllerContextType<T> & {
  channel: {
    send: (response: IResponse<T["response"]>) => Promise<void>;
    close(code?: number, reason?: string): void;
    subscribe: () => Promise<void>;
    isSubscribed(): boolean;
    unsubscribe: () => Promise<void>;
    publish: (response: IResponse<T["response"]>) => Promise<void>;
  };
};
