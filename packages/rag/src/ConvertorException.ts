import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";

export class ConvertorException extends Exception {
  constructor(message: string, data: Record<string, unknown> = {}) {
    super(message, {
      status: HttpStatus.Code.InternalServerError,
      data,
    });
    this.name = "ConvertorException";
  }
}
