import { describe, expect, test } from "bun:test";
import { DISCIPLINES_EN, FIELDS_EN, getDisciplineByCode, getFieldByCode, getYearByCode, YEARS_EN } from "@/medecine";

describe("Medicine Helpers", () => {
  describe("getDisciplineByCode", () => {
    test("should return discipline when valid code is provided", () => {
      // Use the first discipline from the array
      const firstDiscipline = DISCIPLINES_EN[0];
      const result = getDisciplineByCode(firstDiscipline.code);

      expect(result).toBeDefined();
      expect(result).toEqual(firstDiscipline);
      expect(result?.code).toBe(firstDiscipline.code);
      expect(result?.name).toBe(firstDiscipline.name);
      expect(result?.description).toBe(firstDiscipline.description);
    });

    test("should return discipline for anesthesiology code", () => {
      const result = getDisciplineByCode("71579f");

      expect(result).toBeDefined();
      expect(result?.code).toBe("71579f");
      expect(result?.name).toBe("Anesthesiology");
      expect(result?.description).toContain("Medical specialty focused on perioperative care");
    });

    test("should return discipline for cardiology code", () => {
      const result = getDisciplineByCode("3caf02");

      expect(result).toBeDefined();
      expect(result?.code).toBe("3caf02");
      expect(result?.name).toBe("Cardiology");
      expect(result?.description).toContain("Medical specialty dealing with disorders of the heart");
    });

    test("should return undefined for invalid code", () => {
      // @ts-expect-error Testing invalid input
      const result = getDisciplineByCode("invalid_code");

      expect(result).toBeUndefined();
    });

    test("should return undefined for empty string code", () => {
      // @ts-expect-error Testing invalid input
      const result = getDisciplineByCode("");

      expect(result).toBeUndefined();
    });

    test("should handle case-sensitive codes correctly", () => {
      // @ts-expect-error Testing invalid input
      const result = getDisciplineByCode("71579F"); // uppercase F

      expect(result).toBeUndefined();
    });

    test("should return correct discipline for all valid codes", () => {
      DISCIPLINES_EN.forEach((discipline) => {
        const result = getDisciplineByCode(discipline.code);

        expect(result).toBeDefined();
        expect(result).toEqual(discipline);
      });
    });
  });

  describe("getYearByCode", () => {
    test("should return year when valid code is provided", () => {
      const firstYear = YEARS_EN[0];
      const result = getYearByCode(firstYear.code);

      expect(result).toBeDefined();
      expect(result).toEqual(firstYear);
      expect(result?.code).toBe(firstYear.code);
      expect(result?.name).toBe(firstYear.name);
      expect(result?.number).toBe(firstYear.number);
      expect(result?.color).toBe(firstYear.color);
    });

    test("should return admission year", () => {
      const result = getYearByCode("0a1b2c");

      expect(result).toBeDefined();
      expect(result?.code).toBe("0a1b2c");
      expect(result?.name).toBe("Admission");
      expect(result?.number).toBe(0);
      expect(result?.color).toBe("#ff6347");
    });

    test("should return first year", () => {
      const result = getYearByCode("1a2b3c");

      expect(result).toBeDefined();
      expect(result?.code).toBe("1a2b3c");
      expect(result?.name).toBe("1st year");
      expect(result?.number).toBe(1);
      expect(result?.color).toBe("#4682b4");
    });

    test("should return resident year", () => {
      const result = getYearByCode("7f2a5d");

      expect(result).toBeDefined();
      expect(result?.code).toBe("7f2a5d");
      expect(result?.name).toBe("Resident");
      expect(result?.number).toBe(8);
      expect(result?.color).toBe("#228b22");
    });

    test("should return doctor year", () => {
      const result = getYearByCode("a15b8c");

      expect(result).toBeDefined();
      expect(result?.code).toBe("a15b8c");
      expect(result?.name).toBe("Doctor");
      expect(result?.number).toBe(11);
      expect(result?.color).toBe("#8b4513");
    });

    test("should return undefined for invalid code", () => {
      // @ts-expect-error Testing invalid input
      const result = getYearByCode("invalid_year_code");

      expect(result).toBeUndefined();
    });

    test("should return undefined for empty string code", () => {
      // @ts-expect-error Testing invalid input
      const result = getYearByCode("");

      expect(result).toBeUndefined();
    });

    test("should handle case-sensitive codes correctly", () => {
      // @ts-expect-error Testing invalid input
      const result = getYearByCode("0A1B2C"); // uppercase

      expect(result).toBeUndefined();
    });

    test("should return correct year for all valid codes", () => {
      YEARS_EN.forEach((year) => {
        const result = getYearByCode(year.code);

        expect(result).toBeDefined();
        expect(result).toEqual(year);
      });
    });

    test("should verify year numbers are in correct order", () => {
      const admissionYear = getYearByCode("0a1b2c");
      const firstYear = getYearByCode("1a2b3c");
      const doctorYear = getYearByCode("a15b8c");

      expect(admissionYear?.number).toBe(0);
      expect(firstYear?.number).toBe(1);
      expect(doctorYear?.number).toBe(11);
      expect(admissionYear?.number).toBeLessThan(firstYear?.number ?? 0);
      expect(firstYear?.number).toBeLessThan(doctorYear?.number ?? 0);
    });
  });

  describe("getFieldByCode", () => {
    test("should return field when valid code is provided", () => {
      const firstField = FIELDS_EN[0];
      const result = getFieldByCode(firstField.code);

      expect(result).toBeDefined();
      expect(result).toEqual(firstField);
      expect(result?.code).toBe(firstField.code);
      expect(result?.name).toBe(firstField.name);
      expect(result?.color).toBe(firstField.color);
      expect(result?.description).toBe(firstField.description);
    });

    test("should return general medicine field", () => {
      const result = getFieldByCode("GM");

      expect(result).toBeDefined();
      expect(result?.code).toBe("GM");
      expect(result?.name).toBe("General Medicine");
      expect(result?.color).toBe("#2563eb");
      expect(result?.description).toContain("General Medicine encompasses the comprehensive medical care");
    });

    test("should return dental medicine field", () => {
      const result = getFieldByCode("DM");

      expect(result).toBeDefined();
      expect(result?.code).toBe("DM");
      expect(result?.name).toBe("Dental Medicine");
      expect(result?.color).toBe("#dc2626");
      expect(result?.description).toContain("Dental Medicine is a specialized branch of healthcare");
    });

    test("should return pharmacy field", () => {
      const result = getFieldByCode("PH");

      expect(result).toBeDefined();
      expect(result?.code).toBe("PH");
      expect(result?.name).toBe("Pharmacy");
      expect(result?.color).toBe("#16a34a");
    });

    test("should return undefined for invalid code", () => {
      // @ts-expect-error Testing invalid input
      const result = getFieldByCode("INVALID");

      expect(result).toBeUndefined();
    });

    test("should return undefined for empty string code", () => {
      // @ts-expect-error Testing invalid input
      const result = getFieldByCode("");

      expect(result).toBeUndefined();
    });

    test("should handle case-sensitive codes correctly", () => {
      // @ts-expect-error Testing invalid input
      const result = getFieldByCode("gm"); // lowercase

      expect(result).toBeUndefined();
    });

    test("should return correct field for all valid codes", () => {
      FIELDS_EN.forEach((field) => {
        const result = getFieldByCode(field.code);

        expect(result).toBeDefined();
        expect(result).toEqual(field);
      });
    });

    test("should verify all fields have required properties", () => {
      FIELDS_EN.forEach((field) => {
        const result = getFieldByCode(field.code);

        expect(result).toBeDefined();
        expect(result?.code).toBeTruthy();
        expect(result?.name).toBeTruthy();
        expect(result?.color).toBeTruthy();
        expect(result?.description).toBeTruthy();
        expect(result?.color).toMatch(/^#[0-9a-fA-F]{6}$/); // hex color format
      });
    });
  });

  describe("Edge Cases and Integration", () => {
    test("all helper functions should return undefined for null input", () => {
      // @ts-expect-error Testing invalid input
      expect(getDisciplineByCode(null)).toBeUndefined();
      // @ts-expect-error Testing invalid input
      expect(getYearByCode(null)).toBeUndefined();
      // @ts-expect-error Testing invalid input
      expect(getFieldByCode(null)).toBeUndefined();
    });

    test("all helper functions should return undefined for undefined input", () => {
      // @ts-expect-error Testing invalid input
      expect(getDisciplineByCode(undefined)).toBeUndefined();
      // @ts-expect-error Testing invalid input
      expect(getYearByCode(undefined)).toBeUndefined();
      // @ts-expect-error Testing invalid input
      expect(getFieldByCode(undefined)).toBeUndefined();
    });

    test("should verify data integrity - no duplicate codes in disciplines", () => {
      const codes = DISCIPLINES_EN.map((d) => d.code);
      const uniqueCodes = new Set(codes);

      expect(codes.length).toBe(uniqueCodes.size);
    });

    test("should verify data integrity - no duplicate codes in years", () => {
      const codes = YEARS_EN.map((y) => y.code);
      const uniqueCodes = new Set(codes);

      expect(codes.length).toBe(uniqueCodes.size);
    });

    test("should verify data integrity - no duplicate codes in fields", () => {
      const codes = FIELDS_EN.map((f) => f.code);
      const uniqueCodes = new Set(codes);

      expect(codes.length).toBe(uniqueCodes.size);
    });

    test("should verify all arrays have data", () => {
      expect(DISCIPLINES_EN.length).toBeGreaterThan(0);
      expect(YEARS_EN.length).toBeGreaterThan(0);
      expect(FIELDS_EN.length).toBeGreaterThan(0);
    });

    test("performance - should handle multiple lookups efficiently", () => {
      const startTime = performance.now();

      // Perform 1000 lookups
      for (let i = 0; i < 1000; i++) {
        const disciplineIndex = i % DISCIPLINES_EN.length;
        const yearIndex = i % YEARS_EN.length;
        const fieldIndex = i % FIELDS_EN.length;

        getDisciplineByCode(DISCIPLINES_EN[disciplineIndex]?.code ?? DISCIPLINES_EN[0].code);
        getYearByCode(YEARS_EN[yearIndex]?.code ?? YEARS_EN[0].code);
        getFieldByCode(FIELDS_EN[fieldIndex]?.code ?? FIELDS_EN[0].code);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within reasonable time (less than 100ms for 1000 operations)
      expect(executionTime).toBeLessThan(100);
    });

    test("should handle whitespace-only codes gracefully", () => {
      // @ts-expect-error Testing invalid input
      expect(getDisciplineByCode("   ")).toBeUndefined();
      // @ts-expect-error Testing invalid input
      expect(getYearByCode("   ")).toBeUndefined();
      // @ts-expect-error Testing invalid input
      expect(getFieldByCode("   ")).toBeUndefined();
    });

    test("should handle numeric codes as strings", () => {
      // @ts-expect-error Testing invalid input
      expect(getDisciplineByCode("123")).toBeUndefined();
      // @ts-expect-error Testing invalid input
      expect(getYearByCode("123")).toBeUndefined();
      // @ts-expect-error Testing invalid input
      expect(getFieldByCode("123")).toBeUndefined();
    });

    test("should verify return type consistency", () => {
      const disciplineResult = getDisciplineByCode(DISCIPLINES_EN[0].code);
      const yearResult = getYearByCode(YEARS_EN[0].code);
      const fieldResult = getFieldByCode(FIELDS_EN[0].code);

      // Check that returned objects have correct structure
      if (disciplineResult) {
        expect(typeof disciplineResult.code).toBe("string");
        expect(typeof disciplineResult.name).toBe("string");
        expect(typeof disciplineResult.description).toBe("string");
      }

      if (yearResult) {
        expect(typeof yearResult.code).toBe("string");
        expect(typeof yearResult.name).toBe("string");
        expect(typeof yearResult.number).toBe("number");
        expect(typeof yearResult.color).toBe("string");
      }

      if (fieldResult) {
        expect(typeof fieldResult.code).toBe("string");
        expect(typeof fieldResult.name).toBe("string");
        expect(typeof fieldResult.color).toBe("string");
        expect(typeof fieldResult.description).toBe("string");
      }
    });

    test("should return reference to original objects", () => {
      const originalDiscipline = DISCIPLINES_EN[0];
      const returnedDiscipline = getDisciplineByCode(originalDiscipline.code);

      expect(returnedDiscipline).toBe(originalDiscipline); // Same object reference
      expect(returnedDiscipline).toEqual(originalDiscipline); // And same content
    });

    test("should handle boundary conditions for year numbers", () => {
      const admissionYear = getYearByCode("0a1b2c");
      const maxYear = YEARS_EN.reduce((max, year) => (year.number > max.number ? year : max));
      const foundMaxYear = getYearByCode(maxYear.code);

      expect(admissionYear?.number).toBe(0);
      expect(foundMaxYear?.number).toBe(maxYear.number);
      expect(foundMaxYear?.number).toBeGreaterThan(0);
    });
  });
});
