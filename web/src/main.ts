import wordWeightsRaw from './assets/wordWeights.txt?raw';
import { Config, State } from './core/types';
import { initialState } from './core/GottaGoFast';
import { parseWordWeights, sample, WordWeightTable } from './core/Sampler';
import { StatsStorage } from './storage/StatsStorage';
import { TerminalRenderer } from './terminal/TerminalRenderer';
import { Menu } from './terminal/Menu';
import { InputHandler } from './terminal/InputHandler';

function initApp(): void {
  const container = document.getElementById('terminal-container');
  if (!container) return;

  const weightsTable: WordWeightTable = parseWordWeights(wordWeightsRaw);
  let config: Config = StatsStorage.getConfig();

  const renderer = new TerminalRenderer(container);

  let state: State;

  function sampleNewTarget(): string {
    return sample(config, menu.loadedFileContent ?? '', weightsTable);
  }

  function restart(): void {
    const target = sampleNewTarget();
    state = initialState(target);
    render();
  }

  function onConfigChanged(newConfig: Config): void {
    config = { ...newConfig };
    StatsStorage.saveConfig(config);
  }

  const menu = new Menu(config, onConfigChanged, restart);

  function render(): void {
    if (menu.isOpen) {
      renderer.renderMenu(menu.getFormattedLines());
    } else {
      renderer.render(state, config);
    }
  }

  // Initialize initial state
  const target = sampleNewTarget();
  state = initialState(target);

  new InputHandler(
    () => state,
    (s: State) => {
      state = s;
    },
    () => config,
    menu,
    restart,
    render
  );

  // Initial render after terminal layout calculation
  setTimeout(() => {
    renderer.fit();
    render();
  }, 50);
}

window.addEventListener('DOMContentLoaded', initApp);
