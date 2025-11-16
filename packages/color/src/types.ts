import type { IBase } from "@ooneex/types";

type HexDigitType =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F";

export type HexaType =
  | `#${HexDigitType}${HexDigitType}${HexDigitType}`
  // @ts-expect-error: trust me
  | `#${HexDigitType}${HexDigitType}${HexDigitType}${HexDigitType}${HexDigitType}${HexDigitType}`;

export type RGBType = `rgb(${number}, ${number}, ${number})`;

export type RGBAType = `rgba(${number}, ${number}, ${number}, ${number})`;

export type HSLType = `hsl(${number}, ${number}%, ${number}%)`;

export type HSLAType = `hsla(${number}, ${number}%, ${number}%, ${number})`;

export type ColorType = HexaType | RGBType | RGBAType | HSLType | HSLAType;

export interface IColor extends IBase {
  hex?: HexaType;
  rgb?: RGBType;
  rgba?: RGBAType;
  hsl?: HSLType;
  hsla?: HSLAType;
  value: ColorType;
  alpha?: number;
  red?: number;
  green?: number;
  blue?: number;
  hue?: number;
  saturation?: number;
  lightness?: number;
}
