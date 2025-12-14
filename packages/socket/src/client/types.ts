import type { ResponseDataType } from "@ooneex/http-response";
import type { LocaleInfoType } from "@ooneex/translation";

export type RequestDataType = {
  payload?: Record<string, unknown>;
  queries?: Record<string, string | number>;
  language?: LocaleInfoType;
};

export interface ISocket<
  SendData extends RequestDataType = RequestDataType,
  Response extends Record<string, unknown> = Record<string, unknown>,
> {
  close: (code?: number, reason?: string) => void;
  send: (data: SendData) => void;
  onMessage: (handler: (response: ResponseDataType<Response>) => void) => void;
  onOpen: (handler: (event: Event) => void) => void;
  onClose: (handler: (event: CloseEvent) => void) => void;
  onError: (handler: (event: Event) => void) => void;
}
