import type { IBook, IBookReport } from "@ooneex/book";
import type { IStatus } from "@ooneex/status";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { StatusEntity } from "../common/StatusEntity";
import { BookEntity } from "./BookEntity";

@Entity({
  name: "books_reports",
})
export class BookReportEntity extends BaseEntity implements IBookReport {
  @ManyToOne(() => BookEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "book_id" })
  book?: IBook;

  @Column({ name: "book_id", type: "varchar", length: 25, nullable: true })
  bookId?: string;

  @Column({ name: "reason", type: "varchar", length: 255 })
  reason: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({ name: "reported_by", type: "varchar", length: 255, nullable: true })
  reportedBy?: string;

  @Column({ name: "reported_by_id", type: "varchar", length: 25, nullable: true })
  reportedById?: string;

  @ManyToOne(() => StatusEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "status_id" })
  status?: IStatus;
}
