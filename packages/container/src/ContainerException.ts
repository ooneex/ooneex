import { Exception } from "@ooneex/exception";
import { Status } from "@ooneex/http-status";

export class ContainerException<T = unknown> extends Exception<T> {
  constructor(message: string, data?: T) {
    super(message, {
      status: Status.Code.InternalServerError,
      data: data,
    });

    // Set the correct name for the exception
    this.name = "ContainerException";

    // Freeze the data if it exists to make it readonly
    if (this.data) {
      Object.freeze(this.data);
    }
  }
}
