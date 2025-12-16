# Santa's Metrics Sleigh

Festive VS Code sidebar that tracks your keystrokes and coding time while Santa tosses gifts across his sleds.

## Features
- Webview view in the Explorer sidebar showing Santa with three sleds for Keystrokes, Session Time, and Total IDE Time.
- Keystroke tracking via text document changes; each edit throws an animated gift.
- Session timer that updates every second.
- Total IDE time persisted in `globalState` across reloads.
- No external assets required; uses inline emoji and CSS.

## Getting started
1. Install dependencies
   ```bash
   npm install
   ```
2. Build (emits to `out/`)
   ```bash
   npm run compile
   ```
3. Launch in VS Code
   - Press `F5` to run the extension in a new Extension Development Host, or run `npm run watch` and start debugging.
4. Open the view
   - In the Explorer sidebar, open **Santa's Metrics Sleigh** (container: **Santa's Metrics**).

## Scripts
- `npm run compile` — one-time TypeScript build to `out/`.
- `npm run watch` — watch mode build for development.

## How it works
- `src/extension.ts` registers the webview view provider, tracks keystrokes, and ticks session/total timers (persisted via `context.globalState`).
- `src/SantaProvider.ts` renders the webview UI, listens for messages, updates the sled values, and triggers the gift arc animation.

## Requirements
- VS Code `^1.84.0`
- Node.js 18+ recommended
