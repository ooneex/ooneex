import type { IPublisher } from "@ooneex/book";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";

@Entity({
  name: "book_publishers",
})
export class BookPublisherEntity extends BaseEntity implements IPublisher {
  @Column({ name: "name", type: "varchar", length: 200 })
  name: string;

  @Column({ name: "address", type: "text", nullable: true })
  address?: string;

  @Column({ name: "website", type: "varchar", length: 255, nullable: true })
  website?: string;

  @Column({ name: "founded_year", type: "int", nullable: true })
  foundedYear?: number;
}
