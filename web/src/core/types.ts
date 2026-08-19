export type Position = 'BeforeCursor' | 'AfterCursor';

export type Character =
  | { kind: 'Hit'; char: string }
  | { kind: 'Miss'; char: string }
  | { kind: 'Empty'; char: string };

export type Line = Character[];
export type Page = Line[];

export interface Config {
  fg_empty: number;
  fg_error: number;
  height: number;
  max_paragraph_len: number;
  min_paragraph_len: number;
  nonsense_len: number;
  paragraph: boolean;
  reflow: boolean;
  tab: number;
  width: number;
}

export interface State {
  target: string;
  input: string;
  start: number | null;
  end: number | null;
  strokes: number;
  hits: number;
  loop: boolean;
}

export const defaultConfig: Config = {
  fg_empty: 8,
  fg_error: 1,
  height: 20,
  max_paragraph_len: 750,
  min_paragraph_len: 250,
  nonsense_len: 500,
  paragraph: false,
  reflow: false,
  tab: 4,
  width: 80,
};
