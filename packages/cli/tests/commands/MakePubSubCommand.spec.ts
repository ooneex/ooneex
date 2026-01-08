import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakePubSubCommand } = await import("@/commands/MakePubSubCommand");

describe("MakePubSubCommand", () => {
  let command: InstanceType<typeof MakePubSubCommand>;
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    command = new MakePubSubCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `pubsub-${Date.now()}`);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:pubsub");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new PubSub event class");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, "src", "events", ".gitkeep"), "");
      await Bun.write(join(testDir, "tests", "events", ".gitkeep"), "");
      process.chdir(testDir);
    });

    test("should generate event file with correct name", async () => {
      await command.run({ name: "UserCreated" });

      const filePath = join(testDir, "src", "events", "UserCreatedEvent.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("UserCreatedEvent");
    });

    test("should generate test file for event", async () => {
      await command.run({ name: "UserCreated" });

      const testFilePath = join(testDir, "tests", "events", "UserCreatedEvent.spec.ts");
      expect(existsSync(testFilePath)).toBe(true);

      const content = await Bun.file(testFilePath).text();
      expect(content).toContain("UserCreated");
    });

    test("should normalize name with toPascalCase", async () => {
      await command.run({ name: "order-placed" });

      const filePath = join(testDir, "src", "events", "OrderPlacedEvent.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should remove PubSub suffix if provided", async () => {
      await command.run({ name: "UserCreatedPubSub" });

      const filePath = join(testDir, "src", "events", "UserCreatedEvent.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("UserCreatedPubSubEvent");
    });

    test("should use default kebab-case channel name", async () => {
      await command.run({ name: "UserCreated" });

      const filePath = join(testDir, "src", "events", "UserCreatedEvent.ts");
      const content = await Bun.file(filePath).text();

      expect(content).toContain("user-created");
    });

    test("should use custom channel name when provided", async () => {
      await command.run({ name: "UserCreated", channel: "users.created" });

      const filePath = join(testDir, "src", "events", "UserCreatedEvent.ts");
      const content = await Bun.file(filePath).text();

      expect(content).toContain("users.created");
    });

    test("should handle lowercase input", async () => {
      await command.run({ name: "notification" });

      const filePath = join(testDir, "src", "events", "NotificationEvent.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should handle snake_case input", async () => {
      await command.run({ name: "payment_received" });

      const filePath = join(testDir, "src", "events", "PaymentReceivedEvent.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should replace template placeholders correctly", async () => {
      await command.run({ name: "EmailSent" });

      const filePath = join(testDir, "src", "events", "EmailSentEvent.ts");
      const content = await Bun.file(filePath).text();

      expect(content).not.toContain("{{NAME}}");
      expect(content).not.toContain("{{CHANNEL}}");
      expect(content).toContain("EmailSent");
    });

    test("should derive channel from multi-word name", async () => {
      await command.run({ name: "OrderPaymentProcessed" });

      const filePath = join(testDir, "src", "events", "OrderPaymentProcessedEvent.ts");
      const content = await Bun.file(filePath).text();

      expect(content).toContain("order-payment-processed");
    });
  });
});
