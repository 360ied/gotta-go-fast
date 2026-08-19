# Gotta Go Fast (Web)

A faithful web port of [gotta-go-fast](https://github.com/callum-oakley/gotta-go-fast), a command-line typing practice utility, ported to **TypeScript** and **xterm.js**.

## 🚀 Running with Nix Flakes

### Development Server
Enter the nix development shell:
```bash
nix develop
cd web
bun install
bun run dev
```

Or run directly via nix flake app:
```bash
nix run .#web-dev
```

### Running Tests
```bash
nix develop --command bash -c "cd web && bun test"
```

### Production Build
```bash
nix develop --command bash -c "cd web && bun run build"
```

---

## 🎮 How to Use

1. **Nonsense Mode (Default)**:
   - As soon as the page loads, natural English-weighted nonsense is generated from `wordWeights.txt`.
   - Start typing to begin the timer.
   - Mistakes are highlighted in bold red.
   - Spaces automatically skip matching whitespace blocks.
   - Hit **ENTER** upon reaching 100% completion to view your **WPM** and **Accuracy**.

2. **Keyboard Shortcuts**:
   - `ESC`: Restart with a fresh text sample.
   - `Ctrl+W` / `Alt+Backspace` / `Ctrl+Backspace`: Delete backward to the start of the previous word.
   - `Backspace`: Delete character or whitespace block.
   - `Ctrl+C`: Restart / reset test.
   - `TAB` or `F1` or `Ctrl+O`: Toggle the in-terminal Settings menu.

3. **Drag & Drop Custom Files**:
   - Drag and drop any `.txt`, code, or markdown file anywhere onto the browser window.
   - The app will automatically sample chunks or paragraphs from your file.

4. **In-Terminal Settings (`TAB` / `F1`)**:
   - Change text wrap width (40, 50, 60, 70, 80, 100, 120).
   - Change tab indentation width (2, 4, 8 spaces).
   - Adjust nonsense passage length.
   - Toggle paragraph mode and reflow.
   - View your personal best WPM and accuracy history.
