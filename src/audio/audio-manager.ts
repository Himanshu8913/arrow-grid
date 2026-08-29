import { HOVER_THROTTLE_MS, SFX_DEFINITIONS } from "@/constants/audio";
import { useSettingsStore } from "@/state/settings-store";
import type { SfxId } from "@/types/audio";
import type { Settings } from "@/types/settings";

interface ActiveVoice {
  priority: number;
  stop: () => void;
}

/**
 * Central audio gateway for SFX and background music.
 * Components and hooks should call this manager instead of using Web Audio directly.
 */
class AudioManager {
  private context: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicVoices: ActiveVoice[] = [];
  private sfxVoices: ActiveVoice[] = [];
  private musicTimer: number | undefined;
  private musicStep = 0;
  private lastHoverAt = 0;
  private isMusicPlaying = false;

  unlock(): void {
    const context = this.getContext();
    if (context.state === "suspended") {
      void context.resume();
    }
  }

  updateFromSettings(settings: Settings): void {
    this.applyGain(settings);

    if (!settings.musicEnabled || settings.muted) {
      this.stopMusic();
      return;
    }

    if (this.isMusicPlaying) {
      return;
    }

    this.startMusic();
  }

  playSfx(id: SfxId): void {
    const settings = useSettingsStore.getState();

    if (settings.muted || !settings.sfxEnabled) {
      return;
    }

    if (id === "hover") {
      const now = performance.now();
      if (now - this.lastHoverAt < HOVER_THROTTLE_MS) {
        return;
      }
      this.lastHoverAt = now;
    }

    const definition = SFX_DEFINITIONS[id];
    this.stopSfxBelowPriority(definition.priority);

    const context = this.getContext();
    const destination = this.getSfxGain(context);
    const startTime = context.currentTime;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();

    oscillator.type = definition.type;
    oscillator.frequency.setValueAtTime(definition.frequency, startTime);

    if (definition.frequencyEnd) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(definition.frequencyEnd, 1),
        startTime + definition.duration,
      );
    }

    const peakGain =
      definition.gain * settings.sfxVolume * (settings.muted ? 0 : 1);
    envelope.gain.setValueAtTime(0.0001, startTime);
    envelope.gain.exponentialRampToValueAtTime(
      Math.max(peakGain, 0.0001),
      startTime + 0.01,
    );
    envelope.gain.exponentialRampToValueAtTime(
      0.0001,
      startTime + definition.duration,
    );

    oscillator.connect(envelope);
    envelope.connect(destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + definition.duration + 0.02);

    const voice: ActiveVoice = {
      priority: definition.priority,
      stop: () => {
        try {
          oscillator.stop();
        } catch {
          // Oscillator may already be stopped.
        }
        oscillator.disconnect();
        envelope.disconnect();
      },
    };

    this.sfxVoices.push(voice);
    oscillator.onended = () => {
      this.sfxVoices = this.sfxVoices.filter((entry) => entry !== voice);
    };
  }

  startMusic(): void {
    const settings = useSettingsStore.getState();
    if (settings.muted || !settings.musicEnabled || this.isMusicPlaying) {
      return;
    }

    this.unlock();
    this.isMusicPlaying = true;
    this.musicStep = 0;
    this.scheduleMusicChord();
    this.musicTimer = window.setInterval(
      () => this.scheduleMusicChord(),
      2400,
    );
  }

  stopMusic(): void {
    window.clearInterval(this.musicTimer);
    this.musicTimer = undefined;
    this.isMusicPlaying = false;
    this.musicVoices.forEach((voice) => voice.stop());
    this.musicVoices = [];
  }

  private scheduleMusicChord(): void {
    const settings = useSettingsStore.getState();
    if (settings.muted || !settings.musicEnabled) {
      this.stopMusic();
      return;
    }

    const chord = MUSIC_CHORDS[this.musicStep % MUSIC_CHORDS.length];
    this.musicStep += 1;

    const context = this.getContext();
    const destination = this.getMusicGain(context);
    const startTime = context.currentTime;
    const duration = 2.2;

    chord.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startTime);

      const peakGain =
        (0.03 - index * 0.004) *
        settings.musicVolume *
        (settings.muted ? 0 : 1);
      envelope.gain.setValueAtTime(0.0001, startTime);
      envelope.gain.exponentialRampToValueAtTime(
        Math.max(peakGain, 0.0001),
        startTime + 0.4,
      );
      envelope.gain.exponentialRampToValueAtTime(
        0.0001,
        startTime + duration,
      );

      oscillator.connect(envelope);
      envelope.connect(destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.02);

      const voice: ActiveVoice = {
        priority: 0,
        stop: () => {
          try {
            oscillator.stop();
          } catch {
            // Oscillator may already be stopped.
          }
          oscillator.disconnect();
          envelope.disconnect();
        },
      };

      this.musicVoices.push(voice);
      oscillator.onended = () => {
        this.musicVoices = this.musicVoices.filter((entry) => entry !== voice);
      };
    });
  }

  private stopSfxBelowPriority(priority: number): void {
    if (priority >= 3) {
      this.stopAllSfx();
      return;
    }

    const remaining: ActiveVoice[] = [];
    for (const voice of this.sfxVoices) {
      if (voice.priority < priority) {
        voice.stop();
      } else {
        remaining.push(voice);
      }
    }
    this.sfxVoices = remaining;
  }

  private stopAllSfx(): void {
    this.sfxVoices.forEach((voice) => voice.stop());
    this.sfxVoices = [];
  }

  private applyGain(settings: Settings): void {
    const context = this.context;
    if (!context || !this.musicGain || !this.sfxGain) {
      return;
    }

    const master = settings.muted ? 0 : 1;
    this.musicGain.gain.setValueAtTime(
      settings.musicVolume * master,
      context.currentTime,
    );
    this.sfxGain.gain.setValueAtTime(
      settings.sfxVolume * master,
      context.currentTime,
    );
  }

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
      this.musicGain = this.context.createGain();
      this.sfxGain = this.context.createGain();
      this.musicGain.connect(this.context.destination);
      this.sfxGain.connect(this.context.destination);
      this.applyGain(useSettingsStore.getState());
    }

    return this.context;
  }

  private getMusicGain(context: AudioContext): GainNode {
    if (!this.musicGain) {
      this.musicGain = context.createGain();
      this.musicGain.connect(context.destination);
    }

    return this.musicGain;
  }

  private getSfxGain(context: AudioContext): GainNode {
    if (!this.sfxGain) {
      this.sfxGain = context.createGain();
      this.sfxGain.connect(context.destination);
    }

    return this.sfxGain;
  }
}

const MUSIC_CHORDS = [
  [196, 247, 294],
  [220, 277, 330],
  [175, 220, 262],
  [185, 233, 277],
];

export const audioManager = new AudioManager();

export function playSfx(id: SfxId): void {
  audioManager.playSfx(id);
}
