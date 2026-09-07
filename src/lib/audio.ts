// Procedural Web Audio synthesizer for tactile UI, Pet companion interactions, and Alarm timers
// Zero external assets needed, ultra-lightweight and deterministic

import type { AlarmSoundTone } from "./types";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private loopTimer: number | null = null;

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx || this.ctx.state === "closed") {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === "suspended") {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Soft tactile pop when grabbing/clicking a note
  public playPop(frequency = 520) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.4, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // AudioContext might be blocked before first gesture
    }
  }

  // Tactical mechanical click / ratchet sound for rotary barrel wheel & sniper scope dial
  public playMechanicalClick(pitchFactor = 1.0) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // High-precision metallic transient click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2800 * pitchFactor, now);
      filter.Q.setValueAtTime(6, now);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1600 * pitchFactor, now);
      osc.frequency.exponentialRampToValueAtTime(240 * pitchFactor, now + 0.018);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch {
      // AudioContext might be blocked
    }
  }

  // Sniper-scope target lock / selection confirm sound
  public playScopeLock() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [0, 0.05].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(idx === 0 ? 1760 : 2637, now + offset);
        gain.gain.setValueAtTime(0.1, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.07);
      });
    } catch {
      // Ignored
    }
  }

  // Cheerful chime when Pip delivers a note
  public playChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [587.33, 739.99, 880.0]; // D5, F#5, A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.25);
      });
    } catch {
      // Ignored
    }
  }

  // Play High-Volume Customizable Alarm Tone
  public playAlarmTone(tone: AlarmSoundTone = "bell_arpeggio", volumePercent = 100) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const masterGainVal = Math.max(0.05, Math.min(1.0, (volumePercent / 100) * 0.45));

      if (tone === "digital_alarm") {
        // High-pitch Digital Beep-Beep (Classic alarm clock)
        [0, 0.12, 0.32, 0.44].forEach((timeOffset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(1046.5, ctx.currentTime + timeOffset); // C6

          gain.gain.setValueAtTime(masterGainVal * 0.8, ctx.currentTime + timeOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + 0.09);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + timeOffset);
          osc.stop(ctx.currentTime + timeOffset + 0.09);
        });
      } else if (tone === "vintage_clock") {
        // Resonant deep pendulum clock bell
        [0, 0.45].forEach((offset) => {
          const osc = ctx.createOscillator();
          const oscHarmonic = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(440, ctx.currentTime + offset);
          oscHarmonic.type = "triangle";
          oscHarmonic.frequency.setValueAtTime(880, ctx.currentTime + offset);

          gain.gain.setValueAtTime(masterGainVal * 1.1, ctx.currentTime + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.4);

          osc.connect(gain);
          oscHarmonic.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + offset);
          oscHarmonic.start(ctx.currentTime + offset);
          osc.stop(ctx.currentTime + offset + 0.4);
          oscHarmonic.stop(ctx.currentTime + offset + 0.4);
        });
      } else if (tone === "gentle_chime") {
        // Soft melodic chord
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);

          gain.gain.setValueAtTime(masterGainVal, ctx.currentTime + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + idx * 0.09);
          osc.stop(ctx.currentTime + idx * 0.09 + 0.5);
        });
      } else {
        // Default: Loud Bell Arpeggio (Ngân vang, sôi nổi)
        const notes = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6
        [0, 0.24, 0.48, 0.72].forEach((burstOffset) => {
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + burstOffset + idx * 0.04);

            gain.gain.setValueAtTime(masterGainVal, ctx.currentTime + burstOffset + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + burstOffset + idx * 0.04 + 0.24);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime + burstOffset + idx * 0.04);
            osc.stop(ctx.currentTime + burstOffset + idx * 0.04 + 0.24);
          });
        });
      }
    } catch {
      // Ignored
    }
  }

  // Looping continuous alarm (keeps playing until user clicks Dismiss)
  public startAlarmLoop(tone: AlarmSoundTone = "bell_arpeggio", volumePercent = 100) {
    this.stopAlarmLoop();
    this.playAlarmTone(tone, volumePercent);
    this.loopTimer = window.setInterval(() => {
      this.playAlarmTone(tone, volumePercent);
    }, 2200);
  }

  public stopAlarmLoop() {
    if (this.loopTimer !== null) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
  }

  public playAlarmRing() {
    this.playAlarmTone("bell_arpeggio", 100);
  }

  // Cute pet purr / affection sound
  public playPurr() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.12);
      osc.frequency.linearRampToValueAtTime(380, ctx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.24);
    } catch {
      // Ignored
    }
  }

  // Snack munch sound effect
  public playSnack() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      [0, 0.09, 0.18].forEach((timeOffset, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(600 + i * 150, ctx.currentTime + timeOffset);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + timeOffset + 0.05);

        gain.gain.setValueAtTime(0.08, ctx.currentTime + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + timeOffset);
        osc.stop(ctx.currentTime + timeOffset + 0.05);
      });
    } catch {
      // Ignored
    }
  }
}

export const sounds = new SoundEngine();
