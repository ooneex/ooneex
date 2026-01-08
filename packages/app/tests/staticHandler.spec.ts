import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { HttpStatus } from "@ooneex/http-status";
import { staticHandler } from "@/staticHandler";

describe("staticHandler", () => {
  const testDir = join(process.cwd(), "packages/app/tests/.static-test");

  beforeAll(async () => {
    await Bun.spawn(["mkdir", "-p", testDir]).exited;
    await Bun.write(join(testDir, "index.html"), "<html><body>Hello</body></html>");
    await Bun.write(join(testDir, "style.css"), "body { color: red; }");
    await Bun.write(join(testDir, "script.js"), "console.log('hello');");
    await Bun.spawn(["mkdir", "-p", join(testDir, "assets")]).exited;
    await Bun.write(join(testDir, "assets/image.txt"), "fake image content");
  });

  afterAll(async () => {
    await Bun.spawn(["rm", "-rf", testDir]).exited;
  });

  test("returns file content when file exists", async () => {
    const req = new Request("http://localhost/index.html");

    const response = await staticHandler({
      req: req as unknown as import("bun").BunRequest,
      cwd: testDir,
    });

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe("<html><body>Hello</body></html>");
  });

  test("returns CSS file with correct content", async () => {
    const req = new Request("http://localhost/style.css");

    const response = await staticHandler({
      req: req as unknown as import("bun").BunRequest,
      cwd: testDir,
    });

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe("body { color: red; }");
  });

  test("returns JavaScript file with correct content", async () => {
    const req = new Request("http://localhost/script.js");

    const response = await staticHandler({
      req: req as unknown as import("bun").BunRequest,
      cwd: testDir,
    });

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe("console.log('hello');");
  });

  test("returns file from nested directory", async () => {
    const req = new Request("http://localhost/assets/image.txt");

    const response = await staticHandler({
      req: req as unknown as import("bun").BunRequest,
      cwd: testDir,
    });

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe("fake image content");
  });

  test("returns 404 when file does not exist", async () => {
    const req = new Request("http://localhost/nonexistent.html");

    const response = await staticHandler({
      req: req as unknown as import("bun").BunRequest,
      cwd: testDir,
    });

    expect(response.status).toBe(HttpStatus.Code.NotFound);
    const text = await response.text();
    expect(text).toBe("File not found");
  });

  test("returns 404 for nested path that does not exist", async () => {
    const req = new Request("http://localhost/assets/missing/file.txt");

    const response = await staticHandler({
      req: req as unknown as import("bun").BunRequest,
      cwd: testDir,
    });

    expect(response.status).toBe(HttpStatus.Code.NotFound);
    const text = await response.text();
    expect(text).toBe("File not found");
  });

  test("handles root path request", async () => {
    const req = new Request("http://localhost/");

    const response = await staticHandler({
      req: req as unknown as import("bun").BunRequest,
      cwd: testDir,
    });

    expect(response.status).toBe(HttpStatus.Code.NotFound);
  });

  test("handles URL with query parameters", async () => {
    const req = new Request("http://localhost/index.html?v=1.0.0");

    const response = await staticHandler({
      req: req as unknown as import("bun").BunRequest,
      cwd: testDir,
    });

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe("<html><body>Hello</body></html>");
  });

  test("handles URL with hash fragment", async () => {
    const req = new Request("http://localhost/index.html#section");

    const response = await staticHandler({
      req: req as unknown as import("bun").BunRequest,
      cwd: testDir,
    });

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe("<html><body>Hello</body></html>");
  });

  test("returns 404 for directory request", async () => {
    const req = new Request("http://localhost/assets");

    const response = await staticHandler({
      req: req as unknown as import("bun").BunRequest,
      cwd: testDir,
    });

    expect(response.status).toBe(HttpStatus.Code.NotFound);
  });
});
