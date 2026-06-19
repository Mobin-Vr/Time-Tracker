/**
 * Web Audio API sound utilities for alert notifications.
 * Generates tones programmatically (no audio files needed).
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
   if (!audioCtx) {
      audioCtx = new AudioContext();
   }
   // Resume if suspended (browser autoplay policy)
   if (audioCtx.state === 'suspended') {
      audioCtx.resume();
   }
   return audioCtx;
}

/**
 * Play a work alert sound: a sharp ascending chime ~3s.
 * Two quick high-frequency beeps (880Hz, 1100Hz).
 */
export function playWorkAlert(): void {
   try {
      const ctx = getAudioContext();

      // First beep – 880Hz, 0.15s
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);

      // Second beep – 1100Hz, 0.15s, after 0.2s gap
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.2);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.2);
      osc2.stop(ctx.currentTime + 0.35);

      // Fade-out tail – a soft hum that fades over 1s
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(660, ctx.currentTime + 0.35);
      gain3.gain.setValueAtTime(0.15, ctx.currentTime + 0.35);
      gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(ctx.currentTime + 0.35);
      osc3.stop(ctx.currentTime + 1.5);
   } catch {
      // Silently fail – audio not available
   }
}

/**
 * Play a break alert sound: a soft, mellow tone ~3s.
 * Gentle sine wave at 440Hz with slow attack/release.
 */
export function playBreakAlert(): void {
   try {
      const ctx = getAudioContext();

      // Soft pulse 1 – 440Hz
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.8);

      // Soft pulse 2 – 550Hz, after gap
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(550, ctx.currentTime + 1.0);
      gain2.gain.setValueAtTime(0, ctx.currentTime + 1.0);
      gain2.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 1.0);
      osc2.stop(ctx.currentTime + 2.5);
   } catch {
      // Silently fail – audio not available
   }
}