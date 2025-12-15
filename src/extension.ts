import * as vscode from 'vscode';
import { SantaProvider, VIEW_ID } from './SantaProvider';

const TOTAL_TIME_KEY = 'santaMetrics.totalIdeSeconds';

let ticker: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext): void {
  let keystrokes = 0;
  let sessionSeconds = 0;
  let totalSeconds = context.globalState.get<number>(TOTAL_TIME_KEY, 0);

  const provider = new SantaProvider();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(VIEW_ID, provider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
  );

  provider.updateTimes(sessionSeconds, totalSeconds);

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(() => {
      keystrokes += 1;
      provider.bumpKeystrokes(keystrokes);
    }),
  );

  ticker = setInterval(() => {
    sessionSeconds += 1;
    totalSeconds += 1;
    provider.updateTimes(sessionSeconds, totalSeconds);
    context.globalState.update(TOTAL_TIME_KEY, totalSeconds);
  }, 1000);

  context.subscriptions.push({
    dispose: () => {
      if (ticker) {
        clearInterval(ticker);
      }
    },
  });
}

export function deactivate(): void {
  if (ticker) {
    clearInterval(ticker);
  }
}
