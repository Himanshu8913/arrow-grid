export type SeasonalEventId =
  | "halloween"
  | "winter"
  | "diwali"
  | "anniversary";

export type SeasonalMusicProfile =
  | "default"
  | "haunted"
  | "winter"
  | "diwali"
  | "anniversary";

export type SeasonalParticleVariant =
  | "default"
  | "snow"
  | "gold"
  | "ghost";

export type SeasonalVictoryVariant = "default" | "fireworks";

export interface SeasonalChallengeProgress {
  wins: number;
  rewardClaimed: boolean;
}

export interface SeasonalState {
  progressByEvent: Partial<Record<SeasonalEventId, SeasonalChallengeProgress>>;
}
