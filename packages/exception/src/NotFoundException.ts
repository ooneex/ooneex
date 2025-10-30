import { Status } from "@ooneex/http-status";
import { Exception } from "./Exception";

export class NotFoundException<T = unknown> extends Exception<T> {
  constructor(message: string, data?: Readonly<Record<string, T>>) {
    super(message, {
      status: Status.Code.NotFound,
      data,
    });
  }
}
