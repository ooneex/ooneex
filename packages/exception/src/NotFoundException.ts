import { HttpStatus } from "@ooneex/http-status";
import { Exception } from "./Exception";

export class NotFoundException extends Exception {
  constructor(message: string, data: Record<string, unknown> = {}) {
    super(message, {
      status: HttpStatus.Code.NotFound,
      data,
    });
    this.name = "NotFoundException";
  }
}
