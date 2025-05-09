import { computeBaseWave } from './differenceWave';

const SHELIAK = 1.315; // Time compression constant used by McKenna

export function generateRecursiveWave(iterations: number = 10): number[] {
  const base = computeBaseWave();
  let wave: number[] = [...base];

  for (let i = 1; i < iterations; i++) {
    const scaleFactor = Math.pow(SHELIAK, -i);
    const scaled = base.map(v => v * scaleFactor);
    wave = insertScaled(wave, scaled);
  }

  return wave;
}

function insertScaled(original: number[], scaled: number[]): number[] {
  const result = [];
  const interval = original.length / scaled.length;

  let insertIndex = 0;
  for (let i = 0; i < original.length; i++) {
    result.push(original[i]);
    if (Math.floor(i / interval) === insertIndex && insertIndex < scaled.length) {
      result.push(scaled[insertIndex]);
      insertIndex++;
    }
  }

  return result;
}
