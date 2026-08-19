import { describe, expect, it } from 'vitest';
import {
  nonsense,
  parseWordWeights,
  sampleLines,
  sampleParagraph,
  splitOnEmptyLines,
  weightedRandomWord,
} from './Sampler';
import { defaultConfig } from './types';

describe('Sampler', () => {
  const sampleWeights = `
you\t1000
I\t500
the\t250
`;

  it('parses wordWeights text properly', () => {
    const table = parseWordWeights(sampleWeights);
    expect(table.words).toEqual(['you', 'I', 'the']);
    expect(table.totalWeight).toBe(1750);
    expect(table.cumulativeWeights).toEqual([1000, 1500, 1750]);
  });

  it('generates random words within distribution', () => {
    const table = parseWordWeights(sampleWeights);
    const word = weightedRandomWord(table);
    expect(['you', 'I', 'the']).toContain(word);
  });

  it('generates nonsense text of configured length', () => {
    const table = parseWordWeights(sampleWeights);
    const config = { ...defaultConfig, nonsense_len: 50, width: 30 };
    const text = nonsense(config, table);
    expect(text.endsWith('\n')).toBe(true);
    expect(text.length).toBeGreaterThan(30);
  });

  it('splits on empty lines', () => {
    const lines = ['line 1', 'line 2', '', 'line 3', '', '', 'line 4'];
    const groups = splitOnEmptyLines(lines);
    expect(groups.length).toBe(3);
    expect(groups[0]).toEqual(['line 1', 'line 2']);
    expect(groups[1]).toEqual(['line 3']);
    expect(groups[2]).toEqual(['line 4']);
  });

  it('samples lines in chunk mode', () => {
    const file = `
1: first line
2: second line
3: third line
4: fourth line
5: fifth line
6: sixth line
`;
    const config = { ...defaultConfig, height: 3, width: 40 };
    const sampled = sampleLines(config, file);
    expect(sampled.endsWith('\n')).toBe(true);
    const sLines = sampled.trim().split('\n');
    expect(sLines.length).toBeLessThanOrEqual(3);
  });

  it('samples paragraph mode', () => {
    const file = `
Short intro.

This is a valid paragraph with sufficient length to satisfy the minimum paragraph length filter for testing paragraph sampling mode. It contains several sentences and ideas.

Another paragraph that is also quite long and describes some additional details for testing paragraph sampling in the web application port.

End notes.
`;
    const config = {
      ...defaultConfig,
      paragraph: true,
      min_paragraph_len: 50,
      max_paragraph_len: 300,
      width: 40,
    };
    const sampled = sampleParagraph(config, file);
    expect(sampled.endsWith('\n')).toBe(true);
    expect(sampled.length).toBeGreaterThan(50);
  });
});
