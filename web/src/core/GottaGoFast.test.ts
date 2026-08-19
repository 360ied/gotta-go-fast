import { describe, expect, it } from 'vitest';
import {
  accuracy,
  applyBackspace,
  applyBackspaceWord,
  applyChar,
  countChars,
  cursor,
  haskellLines,
  initialState,
  isComplete,
  isErrorFree,
  page,
  startClock,
  stopClock,
  wpm,
} from './GottaGoFast';

describe('GottaGoFast core logic', () => {
  it('handles haskellLines correctly', () => {
    expect(haskellLines('')).toEqual([]);
    expect(haskellLines('hello\n')).toEqual(['hello']);
    expect(haskellLines('hello\nworld\n')).toEqual(['hello', 'world']);
    expect(haskellLines('hello\n\nworld')).toEqual(['hello', '', 'world']);
  });

  it('initializes state and handles leading whitespace', () => {
    const s1 = initialState('hello world');
    expect(s1.input).toBe('');
    expect(s1.target).toBe('hello world');
    expect(s1.hits).toBe(0);
    expect(s1.strokes).toBe(0);

    const s2 = initialState('   hello world');
    expect(s2.input).toBe('   ');
  });

  it('handles character input and hits', () => {
    let s = initialState('abc');
    s = applyChar('a', s);
    expect(s.input).toBe('a');
    expect(s.hits).toBe(1);
    expect(s.strokes).toBe(1);
    expect(isErrorFree(s)).toBe(true);

    s = applyChar('x', s); // error
    expect(s.input).toBe('ax');
    expect(s.hits).toBe(1);
    expect(s.strokes).toBe(2);
    expect(isErrorFree(s)).toBe(false);
  });

  it('auto-expands whitespace when typing space', () => {
    let s = initialState('foo   bar');
    s = applyChar('f', s);
    s = applyChar('o', s);
    s = applyChar('o', s);
    expect(s.input).toBe('foo');

    s = applyChar(' ', s);
    expect(s.input).toBe('foo   '); // auto-expanded 3 spaces
    expect(isErrorFree(s)).toBe(true);
  });

  it('applies single backspace and multi-whitespace backspace', () => {
    let s = initialState('foo   bar');
    s = applyChar('f', s);
    s = applyChar('o', s);
    s = applyChar('o', s);
    s = applyChar(' ', s);
    expect(s.input).toBe('foo   ');

    s = applyBackspace(s);
    expect(s.input).toBe('foo'); // backspaces all matching contiguous spaces
  });

  it('applies word backspace (applyBackspaceWord)', () => {
    let s = initialState('the quick brown fox');
    for (const c of 'the quick') {
      s = applyChar(c, s);
    }
    expect(s.input).toBe('the quick');

    s = applyBackspaceWord(s);
    expect(s.input).toBe('the ');

    s = applyBackspaceWord(s);
    expect(s.input).toBe('');
  });

  it('computes cursor position correctly', () => {
    let s = initialState('line1\nline2\nline3');
    for (const c of 'line1\nl') {
      s = applyChar(c, s);
    }
    const [col, row] = cursor(s);
    expect(row).toBe(1);
    expect(col).toBe(1);
  });

  it('calculates page rendering characters properly', () => {
    let s = initialState('cat\ndog');
    s = applyChar('c', s);
    s = applyChar('x', s); // miss 'a'

    const pg = page(s);
    expect(pg.length).toBe(2);
    // Row 0: 'c' is Hit, 'x' is Miss (at pos 1), 't' is Empty
    expect(pg[0][0]).toEqual({ kind: 'Hit', char: 'c' });
    expect(pg[0][1]).toEqual({ kind: 'Miss', char: 'x' });
    expect(pg[0][2]).toEqual({ kind: 'Empty', char: 't' });
  });

  it('calculates WPM and Accuracy correctly', () => {
    let s = initialState('hello world'); // countChars: 'hello' (5) + ' ' (1) + 'world' (5) = 11 groups
    expect(countChars(s)).toBe(11);

    s = startClock(1000, s);
    for (const c of 'hello world') {
      s = applyChar(c, s);
    }
    s = stopClock(13000, s); // 12 seconds elapsed

    expect(isComplete(s)).toBe(true);
    expect(accuracy(s)).toBe(1.0);

    // WPM = 11 / (5 * 12 / 60) = 11 / 1 = 11 WPM
    expect(wpm(s)).toBeCloseTo(11.0, 1);
  });
});
