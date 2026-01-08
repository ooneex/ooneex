import type { IFlashcard, IFlashcardDeck, IFlashcardSchedule } from "@ooneex/gamification/flashcard";
import type { IImage } from "@ooneex/image";
import type { IStatus } from "@ooneex/status";
import type { ITag } from "@ooneex/tag";
import type { IStat } from "@ooneex/types";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";
import { StatEntity } from "../../common/StatEntity";
import { StatusEntity } from "../../common/StatusEntity";
import { TagEntity } from "../../common/TagEntity";
import { ImageEntity } from "../../image/ImageEntity";
import { FlashcardDeckEntity } from "./FlashcardDeckEntity";
import { FlashcardScheduleEntity } from "./FlashcardScheduleEntity";

@Entity({
  name: "flashcards",
})
export class FlashcardEntity extends BaseEntity implements IFlashcard {
  @Column({ name: "front", type: "text" })
  front: string;

  @Column({ name: "back", type: "text" })
  back: string;

  @Column({ name: "hint", type: "text", nullable: true })
  hint?: string;

  @Column({ name: "context", type: "varchar", length: 255, nullable: true })
  context?: string;

  @Column({ name: "context_id", type: "varchar", length: 25, nullable: true })
  contextId?: string;

  @OneToOne(() => FlashcardScheduleEntity, {
    nullable: false,
    eager: false,
    cascade: ["insert", "update", "soft-remove"],
  })
  @JoinColumn({ name: "schedule_id" })
  schedule: IFlashcardSchedule;

  @ManyToOne(
    () => FlashcardDeckEntity,
    (deck) => deck.cards,
    {
      nullable: true,
      eager: false,
      cascade: ["insert", "update"],
    },
  )
  @JoinColumn({ name: "deck_id" })
  deck?: IFlashcardDeck;

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
    name: "flashcards_tags",
    joinColumn: { name: "flashcard_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" },
  })
  tags?: ITag[];
}
