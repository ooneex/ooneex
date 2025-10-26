import { describe, expect, test } from "bun:test";
import { capitalizeWord } from "@/index";

describe("capitalizeWord", () => {
  describe("basic functionality", () => {
    test("should capitalize first letter of lowercase word", () => {
      expect(capitalizeWord("hello")).toBe("Hello");
    });

    test("should capitalize first letter and lowercase the rest", () => {
      expect(capitalizeWord("hELLO")).toBe("Hello");
    });

    test("should handle single character", () => {
      expect(capitalizeWord("a")).toBe("A");
    });

    test("should handle uppercase single character", () => {
      expect(capitalizeWord("A")).toBe("A");
    });

    test("should handle already capitalized word", () => {
      expect(capitalizeWord("Hello")).toBe("Hello");
    });

    test("should handle mixed case word", () => {
      expect(capitalizeWord("hElLo")).toBe("Hello");
    });
  });

  describe("edge cases", () => {
    test("should return empty string when input is empty", () => {
      expect(capitalizeWord("")).toBe("");
    });

    test("should handle words with numbers", () => {
      expect(capitalizeWord("hello123")).toBe("Hello123");
    });

    test("should handle words starting with numbers", () => {
      expect(capitalizeWord("123hello")).toBe("123hello");
    });

    test("should handle special characters", () => {
      expect(capitalizeWord("!hello")).toBe("!hello");
    });

    test("should handle words with special characters", () => {
      expect(capitalizeWord("hello-world")).toBe("Hello-world");
    });

    test("should handle accented characters", () => {
      expect(capitalizeWord("école")).toBe("École");
    });

    test("should handle non-latin characters", () => {
      expect(capitalizeWord("привет")).toBe("Привет");
    });
  });

  describe("whitespace handling", () => {
    test("should handle words with leading spaces", () => {
      expect(capitalizeWord(" hello")).toBe(" hello");
    });

    test("should handle words with trailing spaces", () => {
      expect(capitalizeWord("hello ")).toBe("Hello ");
    });

    test("should handle single space", () => {
      expect(capitalizeWord(" ")).toBe(" ");
    });

    test("should handle multiple spaces", () => {
      expect(capitalizeWord("   ")).toBe("   ");
    });

    test("should handle tab character", () => {
      expect(capitalizeWord("\t")).toBe("\t");
    });

    test("should handle newline character", () => {
      expect(capitalizeWord("\n")).toBe("\n");
    });
  });

  describe("parametrized tests", () => {
    test.each([
      ["word", "Word"],
      ["WORD", "Word"],
      ["wORD", "Word"],
      ["test", "Test"],
      ["javascript", "Javascript"],
      ["typescript", "Typescript"],
      ["react", "React"],
    ])("capitalizeWord(%s) should return %s", (input, expected) => {
      expect(capitalizeWord(input)).toBe(expected);
    });
  });

  describe("type safety", () => {
    test("should handle very long strings", () => {
      const longString = "a".repeat(1000);
      const result = capitalizeWord(longString);
      expect(result).toHaveLength(1000);
      expect(result[0]).toBe("A");
      expect(result.slice(1)).toBe("a".repeat(999));
    });

    test("should handle unicode characters", () => {
      expect(capitalizeWord("émile")).toBe("Émile");
      expect(capitalizeWord("ñoño")).toBe("Ñoño");
      expect(capitalizeWord("café")).toBe("Café");
    });

    test("should handle emoji", () => {
      expect(capitalizeWord("😀hello")).toBe("😀hello");
      expect(capitalizeWord("hello😀")).toBe("Hello😀");
    });
  });

  describe("function behavior", () => {
    test("should not mutate original string", () => {
      const original = "hello";
      const result = capitalizeWord(original);
      expect(original).toBe("hello");
      expect(result).toBe("Hello");
    });

    test("should return string type", () => {
      const result = capitalizeWord("test");
      expect(typeof result).toBe("string");
    });

    test("should handle consecutive calls consistently", () => {
      const word = "hello";
      const result1 = capitalizeWord(word);
      const result2 = capitalizeWord(word);
      expect(result1).toBe(result2);
      expect(result1).toBe("Hello");
    });
  });

  describe("real world examples", () => {
    test("should capitalize common names", () => {
      expect(capitalizeWord("john")).toBe("John");
      expect(capitalizeWord("mary")).toBe("Mary");
      expect(capitalizeWord("david")).toBe("David");
    });

    test("should handle programming terms", () => {
      expect(capitalizeWord("function")).toBe("Function");
      expect(capitalizeWord("variable")).toBe("Variable");
      expect(capitalizeWord("method")).toBe("Method");
    });

    test("should handle common words", () => {
      expect(capitalizeWord("the")).toBe("The");
      expect(capitalizeWord("and")).toBe("And");
      expect(capitalizeWord("but")).toBe("But");
    });
  });
});
