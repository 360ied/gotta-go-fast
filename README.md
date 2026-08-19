# Gotta Go Fast

A command line utility for practicing typing and measuring your WPM and
accuracy. Written with [brick](https://github.com/jtdaugherty/brick).

## Installation

From source using [Stack](https://docs.haskellstack.org):

    $ stack install gotta-go-fast

Download binary (macOS):

    $ DEST=~/.local/bin/gotta-go-fast
    $ curl https://github.com/callum-oakley/gotta-go-fast/releases/download/0.3.0.6/macos -fLo $DEST

Where `DEST` is somewhere in your `PATH`.

### Development with Nix & Direnv

Enter the Nix development shell directly:

    $ nix develop

Or enable [direnv](https://direnv.net) for automatic environment loading when entering the directory:

    $ direnv allow

The shell provides GHC, `cabal-install`, `haskell-language-server`, `ghcid`, `hlint`, `nixfmt`, and Hoogle documentation for the CLI, as well as Node.js, Bun, and Biome for the web application.

## Web Application (xterm.js + TypeScript)

A browser port of `gotta-go-fast` built with **TypeScript** and **xterm.js** is located in [`web/`](web/). It reproduces the CLI experience with fullscreen terminal rendering, responsive text centering, block cursor focus handling, file drag-and-drop, and an in-terminal settings overlay.

### Web Development Commands

Within `nix develop` (or with Bun installed):

- **Start dev server**: `nix run .#web-dev` or `cd web && bun run dev`
- **Build Nix package**: `nix build .#gotta-go-fast-web`
- **Run automated tests**: `cd web && bun test`
- **Build production bundle**: `cd web && bun run build`
- **Format code**: `cd web && bun run format` (or `biome format --write web/`)
- **Lint code**: `cd web && bun run lint`

## Usage

`gotta-go-fast` has three modes of operation. In all three modes, type through the presented text and then submit with ENTER. You **must** correct your mistakes before you can submit. Press ESC at any time to restart. Exit with CTRL-C.

### 1. Nonsense mode

Run with no file inputs, it will generate nonsense which is statistically similar to English text. Words appear in the nonsense with the same frequency that they appear in actual English. The length of the nonsense can be specified with `--nonsense-len` (`-l`) (in characters).

    $ gotta-go-fast -w 60

![screenshot](img/nonsense.png)

### 2. Chunk mode

Run with files to sample from, it will sample a random chunk from a random file as input. This works well for code or other text without a clear paragraph structure. Specify the height of the chunk in lines with `--height` (`-h`).

    $ gotta-go-fast src/*

![screenshot](img/chunk.png)

### 3. Paragraph mode

Run with files to sample from, and `--paragraph` (`-p`), it will sample a random paragraph (empty line delimited) from a random file. This works well for prose such as Project Gutenberg books. Reflow text to the target width with `--reflow` (`-r`). Specify the maximum and minimum length for a paragraph with `--max-paragraph-len` and `--min-paragraph-len` (in characters).

    $ gotta-go-fast -prw 60 README.md

![screenshot](img/paragraph.png)

In all three modes the width of the text can be set with `--width` (`-w`), the tab width can be set with `--tab` (`-t`) and the colour of empty (not yet typed) text and of errors can be set with `--fg-empty` and `--fg-error` (ANSI colour codes).

Run with `--help` for details.
