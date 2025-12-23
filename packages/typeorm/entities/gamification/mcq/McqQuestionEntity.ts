import type { IMcqQuestion, IMcqQuestionChoice } from "@ooneex/gamification/mcq";
import type { IImage } from "@ooneex/image";
import type { IStatus } from "@ooneex/status";
import type { ITag } from "@ooneex/tag";
import type { IStat } from "@ooneex/types";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";
import { StatEntity } from "../../common/StatEntity";
import { StatusEntity } from "../../common/StatusEntity";
import { TagEntity } from "../../common/TagEntity";
import { ImageEntity } from "../../image/ImageEntity";
import { McqQuestionChoiceEntity } from "./McqQuestionChoiceEntity";

@Entity({
  name: "mcq_questions",
})
export class McqQuestionEntity extends BaseEntity implements IMcqQuestion {
  @Column({ name: "question_number", type: "int" })
  questionNumber: number;

  @Column({ name: "text", type: "text" })
  text: string;

  @OneToMany(
    () => McqQuestionChoiceEntity,
    (choice) => choice.question,
    {
      eager: false,
      cascade: ["insert", "update", "remove"],
    },
  )
  choices: IMcqQuestionChoice[];

  @Column({ name: "context", type: "varchar", length: 255, nullable: true })
  context?: string;

  @Column({ name: "context_id", type: "varchar", length: 25, nullable: true })
  contextId?: string;

  @ManyToOne(() => StatEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "stat_id" })
  stat?: IStat;

  @ManyToOne(() => StatusEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "status_id" })
  status?: IStatus;

  @ManyToOne(() => ImageEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "image_id" })
  image?: IImage;

  @ManyToMany(() => TagEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "mcq_questions_tags",
    joinColumn: { name: "question_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" },
  })
  tags?: ITag[];
}
