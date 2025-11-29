import { HttpStatus } from "@ooneex/http-status";
import { Exception } from "./Exception";

export class BadRequestException extends Exception {
  constructor(message: string, data: Record<string, unknown> = {}) {
    super(message, {
      status: HttpStatus.Code.BadRequest,
      data,
    });
    this.name = "BadRequestException";
  }
}
