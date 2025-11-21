import type { DISCIPLINES_EN } from "./discipline";
import type { FIELDS_EN } from "./fields";
import type { YEARS_EN } from "./years";

export type MedecineDisciplineCodeType = (typeof DISCIPLINES_EN)[number]["code"];
export type MedecineDisciplineType = {
  code: MedecineDisciplineCodeType;
  name: string;
  description: string;
};

export type MedecineFieldCodeType = (typeof FIELDS_EN)[number]["code"];
export type MedecineFieldType = {
  name: string;
  code: MedecineFieldCodeType;
  color: string;
  description: string;
};

export type MedecineYearCodeType = (typeof YEARS_EN)[number]["code"];
export type MedecineYearType = {
  code: MedecineYearCodeType;
  name: string;
  number: number;
  color: string;
};
