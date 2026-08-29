/**
 * Deterministic pseudo-random number generator (Mulberry32).
 * Same seed always produces the same sequence.
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** Returns a float in `[0, 1)`. */
  next(): number {
    let value = (this.state += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns an integer in `[min, max]`. */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Returns a random element from `items`. */
  pick<T>(items: readonly T[]): T {
    return items[this.nextInt(0, items.length - 1)];
  }

  /** Shuffles a copy of `items` in place using Fisher–Yates. */
  shuffle<T>(items: T[]): T[] {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const swapIndex = this.nextInt(0, index);
      [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
    }

    return items;
  }
}

/**
 * Creates a numeric seed from the current time when none is provided.
 */
export function createRandomSeed(): number {
  return Date.now() >>> 0;
}
