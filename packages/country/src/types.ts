import type { IBase } from "@ooneex/types";
import type { TimeZone } from "@vvo/tzdb";
import type { COUNTRIES } from "./en";

export type CountryType = (typeof COUNTRIES)[number]["code"];
export type CountryNameType = (typeof COUNTRIES)[number]["name"];
export type TimeZoneType = TimeZone["name"];

export interface ICountry extends IBase {
  name: string;
  code: string;
}
