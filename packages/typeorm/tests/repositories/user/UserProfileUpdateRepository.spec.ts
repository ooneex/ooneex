import { describe, expect, test } from "bun:test";
import { UserProfileUpdateRepository } from "@/repositories/user/UserProfileUpdateRepository";

describe("UserProfileUpdateRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(UserProfileUpdateRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof UserProfileUpdateRepository).toBe("function");
    expect(UserProfileUpdateRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(UserProfileUpdateRepository.prototype.open).toBeDefined();
      expect(typeof UserProfileUpdateRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(UserProfileUpdateRepository.prototype.close).toBeDefined();
      expect(typeof UserProfileUpdateRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(UserProfileUpdateRepository.prototype.find).toBeDefined();
      expect(typeof UserProfileUpdateRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(UserProfileUpdateRepository.prototype.findOne).toBeDefined();
      expect(typeof UserProfileUpdateRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(UserProfileUpdateRepository.prototype.findOneBy).toBeDefined();
      expect(typeof UserProfileUpdateRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(UserProfileUpdateRepository.prototype.create).toBeDefined();
      expect(typeof UserProfileUpdateRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(UserProfileUpdateRepository.prototype.createMany).toBeDefined();
      expect(typeof UserProfileUpdateRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(UserProfileUpdateRepository.prototype.update).toBeDefined();
      expect(typeof UserProfileUpdateRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(UserProfileUpdateRepository.prototype.updateMany).toBeDefined();
      expect(typeof UserProfileUpdateRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(UserProfileUpdateRepository.prototype.delete).toBeDefined();
      expect(typeof UserProfileUpdateRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(UserProfileUpdateRepository.prototype.count).toBeDefined();
      expect(typeof UserProfileUpdateRepository.prototype.count).toBe("function");
    });

    test("should have markAsCompleted method", () => {
      expect(UserProfileUpdateRepository.prototype.markAsCompleted).toBeDefined();
      expect(typeof UserProfileUpdateRepository.prototype.markAsCompleted).toBe("function");
    });

    test("should have markAsFailed method", () => {
      expect(UserProfileUpdateRepository.prototype.markAsFailed).toBeDefined();
      expect(typeof UserProfileUpdateRepository.prototype.markAsFailed).toBe("function");
    });

    test("should have markAsReverted method", () => {
      expect(UserProfileUpdateRepository.prototype.markAsReverted).toBeDefined();
      expect(typeof UserProfileUpdateRepository.prototype.markAsReverted).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 14 public methods", () => {
      const methods = Object.getOwnPropertyNames(UserProfileUpdateRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof UserProfileUpdateRepository.prototype[name as keyof typeof UserProfileUpdateRepository.prototype] ===
            "function",
      );
      expect(methods.length).toBe(14);
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
        "markAsCompleted",
        "markAsFailed",
        "markAsReverted",
      ];

      const methods = Object.getOwnPropertyNames(UserProfileUpdateRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
