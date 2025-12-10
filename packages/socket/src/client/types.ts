import type { ResponseDataType } from "@ooneex/http-response";
import type { LocaleInfoType } from "@ooneex/translation";

export type RequestDataType = {
  params?: Record<string, string | number>;
  payload?: Record<string, unknown>;
  queries?: Record<string, string | number>;
  language?: LocaleInfoType;
};

export interface ISocket {
  close: (code?: number, reason?: string) => void;
  send: <Data extends RequestDataType = RequestDataType>(data: Data) => void;
  onMessage: (handler: <T extends Record<string, unknown>>(event: ResponseDataType<T>) => void) => void;
  onOpen: (handler: (event: Event) => void) => void;
  onClose: (handler: (event: CloseEvent) => void) => void;
  onError: (handler: (event: Event) => void) => void;
}
