import { kingWenSequence } from './kingWen';

export function computeBaseWave(): number[] {
  const values: number[] = [];

  for (let i = 0; i < kingWenSequence.length - 1; i++) {
    const a = kingWenSequence[i];
    const b = kingWenSequence[i + 1];

    let diff = 0;
    for (let j = 0; j < 6; j++) {
      if (a[j] !== b[j]) diff++;
    }

    values.push(diff);
  }

  return values;
}