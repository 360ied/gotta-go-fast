import { Config, State } from '../core/types';
import {
  applyBackspace,
  applyBackspaceWord,
  applyChar,
  hasEnded,
  hasStarted,
  isComplete,
  startClock,
  stopClock,
} from '../core/GottaGoFast';
import { Menu } from './Menu';
import { StatsStorage } from '../storage/StatsStorage';

export class InputHandler {
  private getState: () => State;
  private setState: (s: State) => void;
  private getConfig: () => Config;
  private menu: Menu;
  private onRestart: () => void;
  private onRender: () => void;

  constructor(
    getState: () => State,
    setState: (s: State) => void,
    getConfig: () => Config,
    menu: Menu,
    onRestart: () => void,
    onRender: () => void
  ) {
    this.getState = getState;
    this.setState = setState;
    this.getConfig = getConfig;
    this.menu = menu;
    this.onRestart = onRestart;
    this.onRender = onRender;

    this.setupKeyListeners();
    this.setupDragAndDrop();
  }

  private setupKeyListeners(): void {
    window.addEventListener(
      'keydown',
      (e: KeyboardEvent) => {
        // Prevent default browser actions for shortcuts
        if (
          e.key === 'Tab' ||
          e.key === 'F1' ||
          (e.ctrlKey && (e.key === 'w' || e.key === 'W' || e.key === 'o' || e.key === 'O' || e.key === 'c' || e.key === 'C')) ||
          (e.altKey && e.key === 'Backspace') ||
          (e.metaKey && e.key === 'Backspace') ||
          (e.ctrlKey && e.key === 'Backspace')
        ) {
          e.preventDefault();
        }

        // Toggle menu
        if (e.key === 'Tab' || e.key === 'F1' || (e.ctrlKey && (e.key === 'o' || e.key === 'O'))) {
          this.menu.isOpen = !this.menu.isOpen;
          this.onRender();
          return;
        }

        // If menu is open, handle menu navigation
        if (this.menu.isOpen) {
          if (this.menu.handleKey(e.key)) {
            e.preventDefault();
            this.onRender();
          }
          return;
        }

        let s = this.getState();

        // Ctrl+C restart
        if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
          e.preventDefault();
          this.onRestart();
          return;
        }

        // Escape restarts test
        if (e.key === 'Escape') {
          e.preventDefault();
          this.onRestart();
          return;
        }

        // If ended, Enter or Escape restarts
        if (hasEnded(s)) {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.onRestart();
          }
          return;
        }

        // Word backspace: Ctrl+W, Alt+Backspace, Meta+Backspace, Ctrl+Backspace
        if (
          (e.ctrlKey && (e.key === 'w' || e.key === 'W' || e.key === 'Backspace')) ||
          (e.altKey && e.key === 'Backspace') ||
          (e.metaKey && e.key === 'Backspace')
        ) {
          e.preventDefault();
          const next = applyBackspaceWord(s);
          this.setState(next);
          this.onRender();
          return;
        }

        // Single character backspace
        if (e.key === 'Backspace') {
          e.preventDefault();
          const next = applyBackspace(s);
          this.setState(next);
          this.onRender();
          return;
        }

        // Character entry
        let charToApply: string | null = null;
        if (e.key === 'Enter') {
          e.preventDefault();
          charToApply = '\n';
        } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          charToApply = e.key;
        }

        if (charToApply !== null) {
          let sNext = applyChar(charToApply, s);

          if (!hasStarted(s)) {
            const now = Date.now();
            sNext = startClock(now, sNext);
          }

          if (isComplete(sNext)) {
            const now = Date.now();
            sNext = stopClock(now, sNext);
            // Save to stats storage
            StatsStorage.addRecord({
              timestamp: Date.now(),
              wpm: Math.round(sNext.strokes > 0 ? (sNext.target.length / ((5 * ((now - sNext.start!) / 1000)) / 60)) : 0),
              accuracy: sNext.strokes > 0 ? sNext.hits / sNext.strokes : 1.0,
              strokes: sNext.strokes,
              mode: this.menu.loadedFileName ? (this.getConfig().paragraph ? 'Paragraph' : 'Chunk') : 'Nonsense',
            });
          }

          this.setState(sNext);
          this.onRender();
        }
      },
      { capture: true }
    );
  }

  private setupDragAndDrop(): void {
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'copy';
    });

    window.addEventListener('drop', (e) => {
      e.preventDefault();
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
            this.menu.loadedFileName = file.name;
            this.menu.loadedFileContent = content;
            this.onRestart();
          }
        };
        reader.readAsText(file);
      }
    });
  }
}
