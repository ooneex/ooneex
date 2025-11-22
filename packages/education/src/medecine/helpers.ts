import { DISCIPLINES_EN } from "./discipline";
import { FIELDS_EN } from "./fields";
import type {
  MedecineDisciplineCodeType,
  MedecineDisciplineType,
  MedecineFieldCodeType,
  MedecineFieldType,
  MedecineYearCodeType,
  MedecineYearType,
} from "./types";
import { YEARS_EN } from "./years";

export const getDisciplineByCode = (code: MedecineDisciplineCodeType): MedecineDisciplineType | undefined =>
  DISCIPLINES_EN.find((discipline) => discipline.code === code);

export const getYearByCode = (code: MedecineYearCodeType): MedecineYearType | undefined =>
  YEARS_EN.find((year) => year.code === code);

export const getFieldByCode = (code: MedecineFieldCodeType): MedecineFieldType | undefined =>
  FIELDS_EN.find((field) => field.code === code);
