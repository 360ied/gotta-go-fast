import type { Character, Line, Page, Position, State } from './types';

export function isSpace(c: string): boolean {
  return c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\v' || c === '\f';
}

export function haskellLines(s: string): string[] {
  if (s === '') return [];
  const result: string[] = [];
  let current = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\n') {
      result.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  if (current.length > 0 || !s.endsWith('\n')) {
    result.push(current);
  }
  return result;
}

export function initialState(target: string): State {
  let leadingSpace = '';
  for (let i = 0; i < target.length; i++) {
    if (isSpace(target[i])) {
      leadingSpace += target[i];
    } else {
      break;
    }
  }

  return {
    target,
    input: leadingSpace,
    start: null,
    end: null,
    strokes: 0,
    hits: 0,
    loop: false,
  };
}

export function startClock(now: number, s: State): State {
  return { ...s, start: now };
}

export function stopClock(now: number, s: State): State {
  return { ...s, end: now };
}

export function hasStarted(s: State): boolean {
  return s.start !== null;
}

export function hasEnded(s: State): boolean {
  return s.end !== null;
}

export function cursorCol(s: State): number {
  let count = 0;
  for (let i = s.input.length - 1; i >= 0; i--) {
    if (s.input[i] === '\n') break;
    count++;
  }
  return count;
}

export function cursorRow(s: State): number {
  let count = 0;
  for (let i = 0; i < s.input.length; i++) {
    if (s.input[i] === '\n') count++;
  }
  return count;
}

export function cursor(s: State): [col: number, row: number] {
  return [cursorCol(s), cursorRow(s)];
}

export function atEndOfLine(s: State): boolean {
  const targetLines = haskellLines(s.target);
  const row = cursorRow(s);
  const lineLen = row < targetLines.length ? targetLines[row].length : 0;
  return cursorCol(s) === lineLen;
}

export function onLastLine(s: State): boolean {
  const targetLines = haskellLines(s.target);
  return cursorRow(s) + 1 === targetLines.length;
}

export function isComplete(s: State): boolean {
  return s.input === s.target;
}

export function isErrorFree(s: State): boolean {
  return s.target.startsWith(s.input);
}

export function applyChar(c: string, s: State): State {
  let nextInput = s.input;
  if (isSpace(c)) {
    const remainingTarget = s.target.slice(s.input.length);
    let ws = '';
    for (let i = 0; i < remainingTarget.length; i++) {
      if (isSpace(remainingTarget[i])) {
        ws += remainingTarget[i];
      } else {
        break;
      }
    }
    nextInput = s.input + (ws === '' ? ' ' : ws);
  } else {
    nextInput = s.input + c;
  }

  const isFree = s.target.startsWith(nextInput);
  const hitsDelta = isFree ? 1 : 0;

  return {
    ...s,
    input: nextInput,
    hits: s.hits + hitsDelta,
    strokes: s.strokes + 1,
  };
}

export function applyBackspace(s: State): State {
  if (s.input.length === 0) return s;

  let wsCount = 0;
  const minLen = Math.min(s.input.length, s.target.length);
  for (let i = 1; i <= minLen; i++) {
    const inChar = s.input[s.input.length - i];
    const targetChar = s.target[s.input.length - i];
    if (isSpace(inChar) && isSpace(targetChar)) {
      wsCount++;
    } else {
      break;
    }
  }

  const n = wsCount > 0 ? wsCount : 1;
  const nextInput = s.input.slice(0, Math.max(0, s.input.length - n));

  return {
    ...s,
    input: nextInput,
  };
}

export function applyBackspaceWord(s: State): State {
  if (s.input.length === 0) return s;

  const reversed = Array.from(s.input).reverse();
  function toWordBeginning(chars: string[]): number {
    if (chars.length === 0) return 0;
    if (chars.length === 1) return 1;
    const x = chars[0];
    const y = chars[1];
    if (!isSpace(x) && isSpace(y)) {
      return 1;
    }
    return 1 + toWordBeginning(chars.slice(1));
  }

  const n = toWordBeginning(reversed);
  const nextInput = s.input.slice(0, Math.max(0, s.input.length - n));

  return {
    ...s,
    input: nextInput,
  };
}

function character(p: Position, t: string | null, i: string | null): Character {
  if (t !== null && i !== null) {
    return t === i ? { kind: 'Hit', char: t } : { kind: 'Miss', char: i };
  }
  if (t === null && i !== null) {
    return { kind: 'Miss', char: i };
  }
  if (p === 'BeforeCursor' && t !== null && i === null) {
    return { kind: 'Miss', char: t };
  }
  // AfterCursor and t !== null && i === null
  return { kind: 'Empty', char: t ?? '' };
}

function line(p: Position, ts: string, isStr: string): Line {
  if (ts === '' && isStr === '') return [];
  const maxLen = Math.max(ts.length, isStr.length);
  const chars: Character[] = [];
  for (let k = 0; k < maxLen; k++) {
    const tChar = k < ts.length ? ts[k] : null;
    const iChar = k < isStr.length ? isStr[k] : null;
    chars.push(character(p, tChar, iChar));
  }
  return chars;
}

export function page(s: State): Page {
  const targetLines = haskellLines(s.target);
  const inputLines = haskellLines(s.input);
  const cRow = cursorRow(s);

  const numLines = targetLines.length;
  const result: Page = [];

  for (let r = 0; r < numLines; r++) {
    const ts = targetLines[r] ?? '';
    const isStr = r < inputLines.length ? inputLines[r] : '';
    const pos: Position = r < cRow ? 'BeforeCursor' : 'AfterCursor';
    result.push(line(pos, ts, isStr));
  }

  return result;
}

export function noOfChars(s: State): number {
  return s.input.length;
}

export function seconds(s: State): number {
  if (s.start === null || s.end === null) return 0;
  return Math.max(0.001, (s.end - s.start) / 1000);
}

export function countChars(s: State): number {
  // length . groupBy (\x y -> isSpace x && isSpace y) . target
  if (s.target.length === 0) return 0;
  let count = 0;
  let inSpaceGroup = false;

  for (let i = 0; i < s.target.length; i++) {
    const space = isSpace(s.target[i]);
    if (space) {
      if (!inSpaceGroup) {
        count++;
        inSpaceGroup = true;
      }
    } else {
      count++;
      inSpaceGroup = false;
    }
  }
  return count;
}

export function wpm(s: State): number {
  const sec = seconds(s);
  if (sec <= 0) return 0;
  return countChars(s) / ((5 * sec) / 60);
}

export function accuracy(s: State): number {
  if (s.strokes === 0) return 1.0;
  return s.hits / s.strokes;
}
