import type { SfxDefinition, SfxId } from "@/types/audio";

export const HOVER_THROTTLE_MS = 90;

export const SFX_DEFINITIONS: Record<SfxId, SfxDefinition> = {
  hover: {
    frequency: 520,
    duration: 0.04,
    type: "sine",
    gain: 0.08,
    priority: 0,
  },
  click: {
    frequency: 640,
    frequencyEnd: 480,
    duration: 0.06,
    type: "triangle",
    gain: 0.12,
    priority: 1,
  },
  rotate: {
    frequency: 320,
    frequencyEnd: 420,
    duration: 0.1,
    type: "square",
    gain: 0.1,
    priority: 1,
  },
  goal: {
    frequency: 520,
    frequencyEnd: 880,
    duration: 0.22,
    type: "sine",
    gain: 0.18,
    priority: 2,
  },
  victory: {
    frequency: 440,
    frequencyEnd: 880,
    duration: 0.45,
    type: "triangle",
    gain: 0.2,
    priority: 3,
  },
  defeat: {
    frequency: 280,
    frequencyEnd: 140,
    duration: 0.5,
    type: "sawtooth",
    gain: 0.16,
    priority: 3,
  },
};
