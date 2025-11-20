import type { COUNTRIES } from "./en";

export type CountryType = (typeof COUNTRIES)[number]["code"];
export type CountryNameType = (typeof COUNTRIES)[number]["name"];
