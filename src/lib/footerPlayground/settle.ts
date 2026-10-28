/** Sleep detection: the loop stops once everything has been still for a while (pure). */

export interface RestSample {
  /** linear speed, px per step */
  speed: number;
  /** angular speed, rad per step */
  angular: number;
}

export interface SettleOptions {
  linear: number;
  angular: number;
  /** consecutive still steps needed */
  frames: number;
}

export const DEFAULT_SETTLE: SettleOptions = { linear: 0.45, angular: 0.008, frames: 40 };

export const isStill = (s: RestSample, o: SettleOptions = DEFAULT_SETTLE) => s.speed < o.linear && Math.abs(s.angular) < o.angular;

/** Counts consecutive still steps; `update` returns true once all samples stayed still for `frames` steps in a row */
export function createSettleDetector(options: Partial<SettleOptions> = {}) {
  const o = { ...DEFAULT_SETTLE, ...options };
  let still = 0;
  return {
    update(samples: readonly RestSample[]): boolean {
      still = samples.every((s) => isStill(s, o)) ? still + 1 : 0;
      return still >= o.frames;
    },
    reset() {
      still = 0;
    },
    get stillFrames() {
      return still;
    },
  };
}
