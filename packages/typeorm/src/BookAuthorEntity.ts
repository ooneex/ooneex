import type { IAuthor } from "@ooneex/book";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity({
  name: "book_authors",
})
export class BookAuthorEntity extends BaseEntity implements IAuthor {
  @Column({ name: "first_name", type: "varchar", length: 100 })
  firstName: string;

  @Column({ name: "last_name", type: "varchar", length: 100 })
  lastName: string;

  @Column({ name: "full_name", type: "varchar", length: 200, nullable: true })
  fullName?: string;

  @Column({ name: "bio", type: "text", nullable: true })
  bio?: string;

  @Column({ name: "birth_date", type: "date", nullable: true })
  birthDate?: string;

  @Column({ name: "death_date", type: "date", nullable: true })
  deathDate?: string;

  @Column({ name: "nationality", type: "varchar", length: 100, nullable: true })
  nationality?: string;
}
