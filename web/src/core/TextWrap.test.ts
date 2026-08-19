import { describe, expect, it } from 'vitest';
import { toAscii, trimEmptyLines, wrapText } from './TextWrap';

describe('TextWrap & Ascii utils', () => {
  it('translates non-ascii and punctuation in toAscii', () => {
    const raw = '“Hello” ‘world’ – test… \t tab';
    const converted = toAscii(4, raw);
    expect(converted).toBe('"Hello" \'world\' - test...      tab');
  });

  it('filters non-printable characters in toAscii', () => {
    const raw = 'valid text\x00\x07\x1b';
    const converted = toAscii(4, raw);
    expect(converted).toBe('valid text');
  });

  it('trims empty lines properly', () => {
    expect(trimEmptyLines('\n\nhello\nworld\n\n')).toBe('hello\nworld\n');
    expect(trimEmptyLines('hello\n')).toBe('hello\n');
  });

  it('wraps text at width while preserving indentation', () => {
    const text = '    the quick brown fox jumps over the lazy dog';
    const wrapped = wrapText(25, text);
    const lines = wrapped.split('\n');
    expect(lines.length).toBeGreaterThan(1);
    expect(lines[0].startsWith('    the quick brown')).toBe(true);
    expect(lines[1].startsWith('jumps over')).toBe(true);
  });

  it('breaks long words that exceed width', () => {
    const text = 'supercalifragilisticexpialidocious';
    const wrapped = wrapText(10, text);
    const lines = wrapped.split('\n');
    expect(lines[0]).toBe('supercalif');
    expect(lines[1]).toBe('ragilistic');
  });
});
