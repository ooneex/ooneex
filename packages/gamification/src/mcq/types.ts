import type { IImage } from "@ooneex/image";
import type { IStatus } from "@ooneex/status";
import type { ITag } from "@ooneex/tag";
import type { IBase, IStat } from "@ooneex/types";
import type { EAnswerState, ESessionType, ILevel } from "@/types";

export enum EMcqQuestionChoiceLetter {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
  G = "G",
  H = "H",
  I = "I",
  J = "J",
}

export enum EMcqSessionStatus {
  DRAFT = "draft",
  STARTED = "started",
  PAUSED = "paused",
  COMPLETED = "completed",
}

export interface IMcqQuestionChoice extends IBase {
  letter: EMcqQuestionChoiceLetter;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  question: IMcqQuestion;
}

export interface IMcqQuestion extends IBase {
  questionNumber: number;
  text: string;
  choices: IMcqQuestionChoice[];
  context?: string;
  contextId?: string;
  stat?: IStat;
  status?: IStatus;
  image?: IImage;
  tags?: ITag[];
}

export interface IMcqSession extends IBase {
  name: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  timing: number;
  questions: IMcqQuestion[];
  status: EMcqSessionStatus;
  score: number;
  startedAt?: Date | null;
  pausedAt?: Date | null;
  resumedAt?: Date | null;
  completedAt?: Date | null;
  type: ESessionType;
  level: ILevel;
}

export interface IMcqSessionQuestion extends IBase {
  session: IMcqSession;
  question: IMcqQuestion;
  questionNumber: number;
  selectedChoices: IMcqQuestionChoice[];
  context?: string;
  contextId?: string;
  state: EAnswerState;
  score: number;
}

export interface IMcqQuestionShared extends IBase {
  question?: IMcqQuestion;
  questionId?: string;
  sharedWith?: string;
  sharedById?: string;
  permission?: string;
  expiresAt?: string;
}

export interface IMcqQuestionLiked extends IBase {
  question?: IMcqQuestion;
  questionId?: string;
  likedBy?: string;
  likedById?: string;
}

export interface IMcqQuestionComment extends IBase {
  question?: IMcqQuestion;
  questionId?: string;
  comment: string;
  commentedBy?: string;
  commentedById?: string;
  parentCommentId?: string;
}

export interface IMcqQuestionDisliked extends IBase {
  question?: IMcqQuestion;
  questionId?: string;
  dislikedBy?: string;
  dislikedById?: string;
}

export interface IMcqQuestionSaved extends IBase {
  question?: IMcqQuestion;
  questionId?: string;
  savedBy?: string;
  savedById?: string;
}

export interface IMcqQuestionReport extends IBase {
  question?: IMcqQuestion;
  questionId?: string;
  reason: string;
  description?: string;
  reportedBy?: string;
  reportedById?: string;
  status?: IStatus;
}

export interface IMcqQuestionViewed extends IBase {
  question?: IMcqQuestion;
  questionId?: string;
  viewedBy?: string;
  viewedById?: string;
}

export interface IMcqQuestionStat extends IBase {
  question?: IMcqQuestion;
  questionId?: string;
  likesCount?: number;
  dislikesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  savesCount?: number;
  viewsCount?: number;
  reportsCount?: number;
}
