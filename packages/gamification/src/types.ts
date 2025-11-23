import type { IBase } from "@ooneex/types";

export interface ILevel extends IBase {
  name: string;
  code: string;
  color: string;
}

export enum ESessionType {
  /** Learning-focused session with detailed explanations and guided experience */
  TRAINING = "training",
  /** Reinforcement session for solidifying already learned knowledge */
  PRACTICE = "practice",
  /** Mock test environment simulating real exam conditions */
  SIMULATION = "simulation",
  /** Quick knowledge check with immediate feedback */
  QUIZ = "quiz",
  /** Competitive or difficult questions designed to test limits */
  CHALLENGE = "challenge",
  /** Multiplayer competitive session with rankings and prizes */
  TOURNAMENT = "tournament",
  /** Session for revisiting previously answered questions and mistakes */
  REVIEW = "review",
  /** Initial assessment to identify knowledge gaps and skill levels */
  DIAGNOSTIC = "diagnostic",
  /** Time-pressured rapid-fire questions focusing on speed and accuracy */
  SPEED_TEST = "speed_test",
}

export enum EAnswerState {
  CORRECT = "correct",
  INCORRECT = "incorrect",
}
