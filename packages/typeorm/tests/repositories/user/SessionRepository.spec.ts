import { describe, expect, test } from "bun:test";
import { SessionRepository } from "@/repositories/user/SessionRepository";

describe("SessionRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(SessionRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof SessionRepository).toBe("function");
    expect(SessionRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(SessionRepository.prototype.open).toBeDefined();
      expect(typeof SessionRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(SessionRepository.prototype.close).toBeDefined();
      expect(typeof SessionRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(SessionRepository.prototype.find).toBeDefined();
      expect(typeof SessionRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(SessionRepository.prototype.findOne).toBeDefined();
      expect(typeof SessionRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(SessionRepository.prototype.findOneBy).toBeDefined();
      expect(typeof SessionRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(SessionRepository.prototype.create).toBeDefined();
      expect(typeof SessionRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(SessionRepository.prototype.createMany).toBeDefined();
      expect(typeof SessionRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(SessionRepository.prototype.update).toBeDefined();
      expect(typeof SessionRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(SessionRepository.prototype.updateMany).toBeDefined();
      expect(typeof SessionRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(SessionRepository.prototype.delete).toBeDefined();
      expect(typeof SessionRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(SessionRepository.prototype.count).toBeDefined();
      expect(typeof SessionRepository.prototype.count).toBe("function");
    });
  });

  describe("custom methods", () => {
    test("should have findByToken method", () => {
      expect(SessionRepository.prototype.findByToken).toBeDefined();
      expect(typeof SessionRepository.prototype.findByToken).toBe("function");
    });

    test("should have findByRefreshToken method", () => {
      expect(SessionRepository.prototype.findByRefreshToken).toBeDefined();
      expect(typeof SessionRepository.prototype.findByRefreshToken).toBe("function");
    });

    test("should have findActiveSessions method", () => {
      expect(SessionRepository.prototype.findActiveSessions).toBeDefined();
      expect(typeof SessionRepository.prototype.findActiveSessions).toBe("function");
    });

    test("should have findExpiredSessions method", () => {
      expect(SessionRepository.prototype.findExpiredSessions).toBeDefined();
      expect(typeof SessionRepository.prototype.findExpiredSessions).toBe("function");
    });

    test("should have revokeSession method", () => {
      expect(SessionRepository.prototype.revokeSession).toBeDefined();
      expect(typeof SessionRepository.prototype.revokeSession).toBe("function");
    });

    test("should have revokeAllUserSessions method", () => {
      expect(SessionRepository.prototype.revokeAllUserSessions).toBeDefined();
      expect(typeof SessionRepository.prototype.revokeAllUserSessions).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 17 public methods", () => {
      const methods = Object.getOwnPropertyNames(SessionRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof SessionRepository.prototype[name as keyof typeof SessionRepository.prototype] === "function",
      );
      expect(methods.length).toBe(17);
    });

    test("should have all required repository methods", () => {
      const requiredMethods = [
        "open",
        "close",
        "find",
        "findOne",
        "findOneBy",
        "create",
        "createMany",
        "update",
        "updateMany",
        "delete",
        "count",
        "findByToken",
        "findByRefreshToken",
        "findActiveSessions",
        "findExpiredSessions",
        "revokeSession",
        "revokeAllUserSessions",
      ];

      const methods = Object.getOwnPropertyNames(SessionRepository.prototype).filter((name) => name !== "constructor");

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
