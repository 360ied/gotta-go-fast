import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Config, State } from '../core/types';
import { accuracy, cursor, hasEnded, haskellLines, page, wpm } from '../core/GottaGoFast';

export class TerminalRenderer {
  public term: Terminal;
  public fitAddon: FitAddon;

  constructor(container: HTMLElement) {
    this.term = new Terminal({
      cursorBlink: false,
      cursorStyle: 'block',
      cursorInactiveStyle: 'block',
      fontFamily: "'Fira Code', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace",
      fontSize: 16,
      lineHeight: 1.2,
      theme: {
        background: '#000000',
        foreground: '#e5e5e5',
        cursor: '#ffffff',
        cursorAccent: '#000000',
        selectionBackground: 'rgba(255, 255, 255, 0.3)',
        black: '#000000',
        red: '#cd0000',
        green: '#00cd00',
        yellow: '#cdcd00',
        blue: '#0000ee',
        magenta: '#cd00cd',
        cyan: '#00cdcd',
        white: '#e5e5e5',
        brightBlack: '#7f7f7f',
        brightRed: '#ff0000',
        brightGreen: '#00ff00',
        brightYellow: '#ffff00',
        brightBlue: '#5c5cff',
        brightMagenta: '#ff00ff',
        brightCyan: '#00ffff',
        brightWhite: '#ffffff',
      },
      convertEol: true,
      allowTransparency: false,
    });

    this.fitAddon = new FitAddon();
    this.term.loadAddon(this.fitAddon);
    this.term.open(container);
    this.fit();
    this.term.focus();

    window.addEventListener('resize', () => {
      this.fit();
    });
    window.addEventListener('click', () => {
      this.term.focus();
    });
    window.addEventListener('focus', () => {
      this.term.focus();
    });
  }

  public fit(): void {
    try {
      this.fitAddon.fit();
    } catch {
      // Ignore fit errors on initial load
    }
  }

  public render(state: State, config: Config): void {
    const cols = this.term.cols;
    const rows = this.term.rows;

    const pg = page(state);
    const targetLines = haskellLines(state.target);
    const maxLineLen = targetLines.reduce((max, l) => Math.max(max, l.length), config.width);
    const textWidth = Math.min(cols - 2, maxLineLen);

    const ended = hasEnded(state);
    // Vertical height: text lines + 2 lines padding + (1 line result if ended)
    const totalContentHeight = pg.length + 2 + (ended ? 1 : 0);

    const topPad = Math.max(1, Math.floor((rows - totalContentHeight) / 2));
    const leftPad = Math.max(1, Math.floor((cols - textWidth) / 2));

    let buf = '\x1b[?25l\x1b[2J'; // hide cursor, clear screen

    // Render lines of text
    for (let r = 0; r < pg.length; r++) {
      const lineY = topPad + r + 1;
      buf += `\x1b[${lineY};${leftPad + 1}H`;

      const lineChars = pg[r];
      if (lineChars.length === 0) {
        buf += ' ';
      } else {
        for (let i = 0; i < lineChars.length; i++) {
          const ch = lineChars[i];
          if (ch.kind === 'Hit') {
            buf += `\x1b[0m${ch.char}`;
          } else if (ch.kind === 'Miss') {
            const display = ch.char === ' ' ? '_' : ch.char;
            buf += `\x1b[1;38;5;${config.fg_error}m${display}\x1b[0m`;
          } else {
            // Empty
            buf += `\x1b[38;5;${config.fg_empty}m${ch.char}\x1b[0m`;
          }
        }
      }
    }

    if (ended) {
      // Results line
      const wpmVal = Math.round(wpm(state));
      const accVal = Math.round(accuracy(state) * 100);
      const resText = `${wpmVal} words per minute • ${accVal}% accuracy`;
      const resY = topPad + pg.length + 3;
      const resLeftPad = Math.max(1, Math.floor((cols - resText.length) / 2));

      buf += `\x1b[${resY};${resLeftPad + 1}H\x1b[38;5;${config.fg_error}m${resText}\x1b[0m`;

      const helpText = '[Press ESC to restart  •  Press TAB / F1 for options]';
      const helpLeftPad = Math.max(1, Math.floor((cols - helpText.length) / 2));
      buf += `\x1b[${resY + 2};${helpLeftPad + 1}H\x1b[90m${helpText}\x1b[0m`;
    } else {
      // Position hardware cursor
      const [cCol, cRow] = cursor(state);
      const cursorY = topPad + cRow + 1;
      const cursorX = leftPad + cCol + 1;
      buf += `\x1b[${cursorY};${cursorX}H\x1b[?25h`;
    }

    this.term.write(buf);
  }

  public renderMenu(menuLines: string[]): void {
    const cols = this.term.cols;
    const rows = this.term.rows;

    const boxWidth = Math.min(cols - 4, 60);
    const boxHeight = menuLines.length + 4;

    const startY = Math.max(1, Math.floor((rows - boxHeight) / 2));
    const startX = Math.max(1, Math.floor((cols - boxWidth) / 2));

    let buf = '\x1b[?25l\x1b[2J'; // hide cursor, clear screen

    const horizBorder = '─'.repeat(boxWidth - 2);
    buf += `\x1b[${startY};${startX}H\x1b[1;36m┌${horizBorder}┐\x1b[0m`;

    const title = ' GOTTA GO FAST - SETTINGS ';
    const titleX = startX + Math.floor((boxWidth - title.length) / 2);
    buf += `\x1b[${startY};${titleX}H\x1b[1;33m${title}\x1b[0m`;

    for (let i = 0; i < menuLines.length; i++) {
      const y = startY + i + 2;
      const line = menuLines[i];
      buf += `\x1b[${y};${startX}H\x1b[1;36m│\x1b[0m ${line.padEnd(boxWidth - 4, ' ')} \x1b[1;36m│\x1b[0m`;
    }

    buf += `\x1b[${startY + boxHeight - 1};${startX}H\x1b[1;36m└${horizBorder}┘\x1b[0m`;
    this.term.write(buf);
  }
}
