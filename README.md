# Santa's Metrics Sleigh

Festive VS Code sidebar that tracks your keystrokes and coding time while Santa tosses gifts across his sleds.

## Features
- Webview view in the Explorer sidebar showing Santa with three sleds for Keystrokes, Session Time, and Total IDE Time.
- Keystroke tracking via text document changes; each edit throws an animated gift.
- Session timer that updates every second.
- Total IDE time persisted in `globalState` across reloads.
- No external assets required; uses inline emoji and CSS.

## Using the extension (local)
This repo is set up to run the extension locally via the VS Code Extension Development Host.

1. Install dependencies
   ```bash
   npm install
   ```
2. Build the extension
   ```bash
   npm run compile
   ```
   (or run `npm run watch` during development)
3. Run the extension
   - Open this folder in VS Code
   - Go to **Run and Debug**
   - Select `Run Extension` and start it (or press `F5`)
4. Open the UI
   - In the **Extension Development Host** window, open the **Explorer** sidebar
   - Look for **Santa's Metrics Sleigh**
   - Type in any file to see 🎁 fall from the top while metrics update

## What you’ll see
- **Keystrokes**: increments on every `onDidChangeTextDocument` event
- **Session Time**: MM:SS since the Extension Host session started
- **IDE Time**: total seconds persisted across Extension Host restarts

## Install for end users (VSIX)
If you want others to use it without building/running the debugger, package it as a `.vsix` and install it.

1. Create the `.vsix` file
   ```bash
   npm install
   npm run package
   ```
   This generates a file like `santas-metrics-sleigh-0.0.1.vsix`.
2. Install the `.vsix` in VS Code / Cursor
   - Open Command Palette → `Extensions: Install from VSIX...`
   - Select the generated `.vsix`
   - Reload the window when prompted

## Scripts
- `npm run compile` — one-time TypeScript build to `out/`.
- `npm run watch` — watch mode build for development.
- `npm run package` — creates an installable `.vsix` (VS Code/Cursor can install it directly).

## How it works
- `src/extension.ts` registers the webview view provider, tracks keystrokes, and ticks session/total timers (persisted via `context.globalState`).
- `src/SantaProvider.ts` renders the webview UI, listens for messages, updates the sled values, and triggers the gift arc animation.

## Troubleshooting
- View not showing: make sure you’re in the **Extension Development Host** window, then run `Developer: Reload Window`.
- Build errors: run `npm run compile` and fix any TypeScript errors it prints.
- No counters updating: click inside an editor and type to trigger document change events.

## Requirements
- VS Code `^1.84.0`
- Node.js 18+ recommended
