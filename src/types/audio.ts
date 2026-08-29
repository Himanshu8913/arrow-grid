export type SfxId =
  | "hover"
  | "click"
  | "rotate"
  | "goal"
  | "victory"
  | "defeat";

export interface SfxDefinition {
  frequency: number;
  frequencyEnd?: number;
  duration: number;
  type: OscillatorType;
  gain: number;
  priority: number;
}
