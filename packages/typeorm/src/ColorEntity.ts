import type { HexaType, HSLAType, HSLType, IColor, RGBAType, RGBType } from "@ooneex/color";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity({
  name: "colors",
})
export class ColorEntity extends BaseEntity implements IColor {
  @Column({ name: "hex", type: "varchar", length: 7, nullable: true })
  hex?: HexaType;

  @Column({ name: "rgb", type: "varchar", length: 50, nullable: true })
  rgb?: RGBType;

  @Column({ name: "rgba", type: "varchar", length: 60, nullable: true })
  rgba?: RGBAType;

  @Column({ name: "hsl", type: "varchar", length: 50, nullable: true })
  hsl?: HSLType;

  @Column({ name: "hsla", type: "varchar", length: 60, nullable: true })
  hsla?: HSLAType;

  @Column({ name: "alpha", type: "decimal", precision: 3, scale: 2, nullable: true })
  alpha?: number;

  @Column({ name: "red", type: "int", nullable: true })
  red?: number;

  @Column({ name: "green", type: "int", nullable: true })
  green?: number;

  @Column({ name: "blue", type: "int", nullable: true })
  blue?: number;

  @Column({ name: "hue", type: "int", nullable: true })
  hue?: number;

  @Column({ name: "saturation", type: "int", nullable: true })
  saturation?: number;

  @Column({ name: "lightness", type: "int", nullable: true })
  lightness?: number;
}
