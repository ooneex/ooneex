import type { IBase } from "@ooneex/types";

export type HexaType = `#${string}`;

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
  alpha?: number;
  red?: number;
  green?: number;
  blue?: number;
  hue?: number;
  saturation?: number;
  lightness?: number;
}
