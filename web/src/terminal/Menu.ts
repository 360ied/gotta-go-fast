import { Config } from '../core/types';
import { StatsStorage } from '../storage/StatsStorage';

export interface MenuOption {
  id: string;
  label: string;
  getValue: () => string;
  next: () => void;
  prev: () => void;
}

export class Menu {
  public isOpen = false;
  public selectedIndex = 0;
  public loadedFileName: string | null = null;
  public loadedFileContent: string | null = null;

  private config: Config;
  private onConfigChanged: (newConfig: Config) => void;
  private onRestart: () => void;

  constructor(config: Config, onConfigChanged: (newConfig: Config) => void, onRestart: () => void) {
    this.config = config;
    this.onConfigChanged = onConfigChanged;
    this.onRestart = onRestart;
  }

  public getOptions(): MenuOption[] {
    const stats = StatsStorage.getStats();

    return [
      {
        id: 'mode',
        label: 'Mode',
        getValue: () => {
          if (!this.loadedFileContent) return 'Nonsense';
          return this.config.paragraph ? 'Paragraph' : 'Chunk';
        },
        next: () => {
          if (!this.loadedFileContent) return;
          this.config.paragraph = !this.config.paragraph;
          this.onConfigChanged(this.config);
        },
        prev: () => {
          if (!this.loadedFileContent) return;
          this.config.paragraph = !this.config.paragraph;
          this.onConfigChanged(this.config);
        },
      },
      {
        id: 'width',
        label: 'Width',
        getValue: () => `${this.config.width} chars`,
        next: () => {
          const widths = [40, 50, 60, 70, 80, 100, 120];
          const currIdx = widths.indexOf(this.config.width);
          this.config.width = widths[(currIdx + 1) % widths.length];
          this.onConfigChanged(this.config);
        },
        prev: () => {
          const widths = [40, 50, 60, 70, 80, 100, 120];
          const currIdx = widths.indexOf(this.config.width);
          this.config.width = widths[(currIdx - 1 + widths.length) % widths.length];
          this.onConfigChanged(this.config);
        },
      },
      {
        id: 'tab',
        label: 'Tab Width',
        getValue: () => `${this.config.tab} spaces`,
        next: () => {
          const tabs = [2, 4, 8];
          const currIdx = tabs.indexOf(this.config.tab);
          this.config.tab = tabs[(currIdx + 1) % tabs.length];
          this.onConfigChanged(this.config);
        },
        prev: () => {
          const tabs = [2, 4, 8];
          const currIdx = tabs.indexOf(this.config.tab);
          this.config.tab = tabs[(currIdx - 1 + tabs.length) % tabs.length];
          this.onConfigChanged(this.config);
        },
      },
      {
        id: 'nonsense_len',
        label: 'Nonsense Length',
        getValue: () => `${this.config.nonsense_len} chars`,
        next: () => {
          const lens = [100, 250, 500, 750, 1000];
          const currIdx = lens.indexOf(this.config.nonsense_len);
          this.config.nonsense_len = lens[(currIdx + 1) % lens.length];
          this.onConfigChanged(this.config);
        },
        prev: () => {
          const lens = [100, 250, 500, 750, 1000];
          const currIdx = lens.indexOf(this.config.nonsense_len);
          this.config.nonsense_len = lens[(currIdx - 1 + lens.length) % lens.length];
          this.onConfigChanged(this.config);
        },
      },
      {
        id: 'reflow',
        label: 'Paragraph Reflow',
        getValue: () => (this.config.reflow ? 'ON' : 'OFF'),
        next: () => {
          this.config.reflow = !this.config.reflow;
          this.onConfigChanged(this.config);
        },
        prev: () => {
          this.config.reflow = !this.config.reflow;
          this.onConfigChanged(this.config);
        },
      },
      {
        id: 'file',
        label: 'Loaded File',
        getValue: () => (this.loadedFileName ? this.loadedFileName : '(Drag & Drop file to load)'),
        next: () => {
          // Clear loaded file if pressed
          if (this.loadedFileContent) {
            this.loadedFileName = null;
            this.loadedFileContent = null;
          }
        },
        prev: () => {
          if (this.loadedFileContent) {
            this.loadedFileName = null;
            this.loadedFileContent = null;
          }
        },
      },
      {
        id: 'stats',
        label: 'Personal Best',
        getValue: () =>
          stats.bestWpm > 0
            ? `${Math.round(stats.bestWpm)} WPM • ${Math.round(stats.bestAccuracy * 100)}% Acc (${stats.totalTests} tests)`
            : 'No records yet',
        next: () => {},
        prev: () => {},
      },
    ];
  }

  public getFormattedLines(): string[] {
    const options = this.getOptions();
    const lines: string[] = [];

    lines.push('Use ↑/↓ to navigate, ←/→ to modify');
    lines.push('Press ENTER/ESC/TAB to resume');
    lines.push('────────────────────────────────────────');

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const isSelected = i === this.selectedIndex;
      const prefix = isSelected ? '▶ ' : '  ';
      const label = opt.label.padEnd(18, ' ');
      const val = opt.getValue();
      lines.push(`${prefix}${label}: ${val}`);
    }

    lines.push('────────────────────────────────────────');
    lines.push('Tip: Drop any .txt / code file to practice');

    return lines;
  }

  public handleKey(key: string): boolean {
    const options = this.getOptions();

    if (key === 'ArrowUp' || key === 'k') {
      this.selectedIndex = (this.selectedIndex - 1 + options.length) % options.length;
      return true;
    }
    if (key === 'ArrowDown' || key === 'j') {
      this.selectedIndex = (this.selectedIndex + 1) % options.length;
      return true;
    }
    if (key === 'ArrowLeft' || key === 'h') {
      options[this.selectedIndex].prev();
      return true;
    }
    if (key === 'ArrowRight' || key === 'l' || key === 'Enter') {
      options[this.selectedIndex].next();
      return true;
    }
    if (key === 'Escape' || key === 'Tab' || key === 'F1') {
      this.isOpen = false;
      this.onRestart();
      return true;
    }
    return false;
  }
}
