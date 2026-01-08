import { join } from "node:path";
import { HttpStatus } from "@ooneex/http-status";
import type { BunRequest } from "bun";

export const staticHandler = async (options: { req: BunRequest; cwd: string }): Promise<Response> => {
  const { req, cwd } = options;
  const path = new URL(req.url).pathname;

  const filePath = join(cwd, path);
  const file = Bun.file(filePath);
  if (await file.exists()) {
    return new Response(file);
  }

  return new Response("File not found", {
    status: HttpStatus.Code.NotFound,
  });
};
