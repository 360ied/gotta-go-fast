import { haskellLines } from './GottaGoFast';
import { toAscii, trimEmptyLines, wrapText } from './TextWrap';
import type { Config } from './types';

export interface WordWeightTable {
  words: string[];
  cumulativeWeights: number[];
  totalWeight: number;
}

export function parseWordWeights(raw: string): WordWeightTable {
  const lines = raw.split('\n');
  const words: string[] = [];
  const cumulativeWeights: number[] = [];
  let total = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(/\s+/);
    if (parts.length >= 2) {
      const word = parts[0];
      const freq = parseInt(parts[1], 10);
      if (!Number.isNaN(freq) && freq > 0) {
        words.push(word);
        total += freq;
        cumulativeWeights.push(total);
      }
    }
  }

  return {
    words,
    cumulativeWeights,
    totalWeight: total,
  };
}

export function weightedRandomWord(table: WordWeightTable): string {
  if (table.words.length === 0 || table.totalWeight === 0) return 'word';
  const r = Math.floor(Math.random() * table.totalWeight);

  // Binary search on cumulativeWeights
  let low = 0;
  let high = table.cumulativeWeights.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (r < table.cumulativeWeights[mid]) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  return table.words[low];
}

export function nonsense(config: Config, table: WordWeightTable): string {
  const words: string[] = [];
  let n = config.nonsense_len;
  let lastWord: string | null = null;

  while (n > 0) {
    let word = weightedRandomWord(table);
    while (lastWord !== null && word === lastWord && table.words.length > 1) {
      word = weightedRandomWord(table);
    }
    words.push(word);
    lastWord = word;
    n -= word.length + 1; // 1 extra for space
  }

  return `${wrapText(config.width, words.join(' '))}\n`;
}

export function splitOnEmptyLines(linesList: string[]): string[][] {
  const result: string[][] = [];
  let currentGroup: string[] = [];

  for (let i = 0; i < linesList.length; i++) {
    const line = linesList[i];
    if (line.trim() === '') {
      if (currentGroup.length > 0) {
        result.push(currentGroup);
        currentGroup = [];
      }
    } else {
      currentGroup.push(line);
    }
  }
  if (currentGroup.length > 0) {
    result.push(currentGroup);
  }
  return result;
}

export function sampleLines(config: Config, fileText: string): string {
  const ascii = toAscii(config.tab, fileText);
  const rawLines = haskellLines(ascii);
  const maxStart = Math.max(0, rawLines.length - config.height);
  const r = Math.floor(Math.random() * (maxStart + 1));

  const dropped = rawLines.slice(r);
  const chop1 = dropped.slice(0, config.height);
  const wrapped = wrapText(config.width, chop1.join('\n'));
  const chop2 = haskellLines(wrapped).slice(0, config.height);
  return trimEmptyLines(chop2.join('\n'));
}

export function sampleParagraph(config: Config, fileText: string): string {
  const ascii = toAscii(config.tab, fileText);
  const rawLines = haskellLines(ascii);
  const groups = splitOnEmptyLines(rawLines);

  const paragraphs = groups
    .map((g) => g.join('\n'))
    .filter((p) => p.length >= config.min_paragraph_len && p.length <= config.max_paragraph_len);

  if (paragraphs.length === 0) {
    return sampleLines(config, fileText);
  }

  const r = Math.floor(Math.random() * paragraphs.length);
  const chosen = paragraphs[r];

  if (config.reflow) {
    const flattened = chosen.replace(/\n/g, ' ');
    return `${wrapText(config.width, flattened)}\n`;
  } else {
    return `${wrapText(config.width, chosen)}\n`;
  }
}

export function sample(config: Config, fileText: string, table?: WordWeightTable): string {
  if (!fileText && table) {
    return nonsense(config, table);
  }
  if (config.paragraph) {
    return sampleParagraph(config, fileText);
  }
  return sampleLines(config, fileText);
}
