import * as vscode from 'vscode';

export const VIEW_ID = 'santaMetricsView';

type Metrics = {
  keystrokes: number;
  sessionSeconds: number;
  totalSeconds: number;
};

export class SantaProvider implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView;
  private metrics: Metrics = {
    keystrokes: 0,
    sessionSeconds: 0,
    totalSeconds: 0,
  };

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.onDidDispose(() => {
      this.view = undefined;
    });

    webviewView.webview.html = this.getHtml(webviewView.webview);
    this.pushMetrics();
  }

  bumpKeystrokes(count: number): void {
    this.metrics.keystrokes = count;
    this.pushMetrics();
    this.postMessage({ type: 'gift' });
  }

  updateTimes(sessionSeconds: number, totalSeconds: number): void {
    this.metrics = {
      ...this.metrics,
      sessionSeconds,
      totalSeconds,
    };
    this.pushMetrics();
  }

  setTotalSeconds(totalSeconds: number): void {
    this.metrics.totalSeconds = totalSeconds;
    this.pushMetrics();
  }

  private pushMetrics(): void {
    this.postMessage({ type: 'metrics', metrics: this.metrics });
  }

  private postMessage(message: unknown): void {
    if (!this.view) {
      return;
    }
    this.view.webview.postMessage(message);
  }

  private getHtml(webview: vscode.Webview): string {
    const nonce = getNonce();
    const csp = [
      "default-src 'none';",
      `img-src ${webview.cspSource} data:;`,
      `script-src 'nonce-${nonce}';`,
      `style-src ${webview.cspSource} 'unsafe-inline';`,
      `font-src ${webview.cspSource};`,
    ].join(' ');

    return /* html */ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="Content-Security-Policy" content="${csp}">
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Santa's Metrics Sleigh</title>
          <style>
            :root {
              --sled-bg: linear-gradient(135deg, #ffe8d6, #fff5ec);
              --sled-border: #d33c3c;
              --text-primary: #1e1e1e;
              --accent: #c70039;
              --frost: rgba(255, 255, 255, 0.55);
            }
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 16px;
              font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
              color: var(--text-primary);
              background: radial-gradient(circle at 10% 20%, #fff8f1 0%, #ffe8d6 25%, #fffdf8 60%);
            }
            .scene {
              display: grid;
              grid-template-columns: auto 1fr;
              gap: 14px;
              align-items: center;
              position: relative;
              min-height: 140px;
            }
            .santa {
              position: relative;
              width: 90px;
              height: 120px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(180deg, #fdf3ec 0%, #ffe2d1 100%);
              border: 2px dashed var(--sled-border);
              border-radius: 18px;
              box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
            }
            .santa-emoji {
              font-size: 48px;
              filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
            }
            .gift-zone {
              position: absolute;
              left: 10px;
              top: 10px;
              width: 120px;
              height: 120px;
              overflow: visible;
              pointer-events: none;
            }
            .gift {
              position: absolute;
              left: 0;
              top: 60px;
              font-size: 20px;
              opacity: 0;
            }
            .throw-gift {
              animation: gift-arc 1s ease-out forwards;
            }
            @keyframes gift-arc {
              0% { transform: translate(0, 0) scale(0.8) rotate(-5deg); opacity: 1; }
              50% { transform: translate(70px, -50px) scale(1) rotate(8deg); opacity: 1; }
              100% { transform: translate(130px, -10px) scale(0.9) rotate(2deg); opacity: 0; }
            }
            .sleds {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
              gap: 12px;
              width: 100%;
            }
            .sled {
              background: var(--sled-bg);
              border: 2px solid var(--sled-border);
              border-radius: 16px;
              padding: 12px 14px;
              box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
              position: relative;
              overflow: hidden;
            }
            .sled::after {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.35), transparent 55%);
              pointer-events: none;
            }
            .sled h3 {
              margin: 0 0 8px;
              font-size: 14px;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              color: var(--accent);
            }
            .sled .value {
              font-size: 28px;
              font-weight: 700;
            }
            .sled .hint {
              font-size: 12px;
              color: #4a4a4a;
              opacity: 0.8;
            }
            .rope {
              position: absolute;
              left: 90px;
              right: -10px;
              top: 50%;
              height: 2px;
              background: repeating-linear-gradient(90deg, #d33c3c 0 12px, #f7d4a9 12px 24px);
              z-index: -1;
              transform: translateY(-50%);
              border-radius: 4px;
              opacity: 0.7;
            }
            @media (max-width: 640px) {
              .scene {
                grid-template-columns: 1fr;
                justify-items: center;
              }
              .rope {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="scene">
            <div class="santa">
              <div class="gift-zone" id="gift-zone"></div>
              <span class="santa-emoji" aria-label="Santa">🎅</span>
            </div>
            <div class="rope" aria-hidden="true"></div>
            <div class="sleds">
              <div class="sled">
                <h3>Sled 1 · Keystrokes</h3>
                <div class="value" id="keystrokes">0</div>
                <div class="hint">Every edit makes Santa toss a gift.</div>
              </div>
              <div class="sled">
                <h3>Sled 2 · Session Time</h3>
                <div class="value" id="session">00:00</div>
                <div class="hint">Current session ticking live.</div>
              </div>
              <div class="sled">
                <h3>Sled 3 · Total IDE Time</h3>
                <div class="value" id="total">00:00</div>
                <div class="hint">Persisted across reloads.</div>
              </div>
            </div>
          </div>
          <script nonce="${nonce}">
            const $ = (id) => document.getElementById(id);
            const keystrokesEl = $('keystrokes');
            const sessionEl = $('session');
            const totalEl = $('total');
            const giftZone = $('gift-zone');

            const metrics = {
              keystrokes: 0,
              sessionSeconds: 0,
              totalSeconds: 0,
            };

            function formatTime(seconds) {
              const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
              const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
              return \`\${mins}:\${secs}\`;
            }

            function render() {
              keystrokesEl.textContent = metrics.keystrokes.toString();
              sessionEl.textContent = formatTime(metrics.sessionSeconds);
              totalEl.textContent = formatTime(metrics.totalSeconds);
            }

            function throwGift() {
              const gift = document.createElement('span');
              gift.className = 'gift throw-gift';
              gift.textContent = '🎁';
              giftZone.appendChild(gift);
              gift.addEventListener('animationend', () => gift.remove());
            }

            window.addEventListener('message', (event) => {
              const message = event.data;
              if (message?.type === 'metrics' && message.metrics) {
                Object.assign(metrics, message.metrics);
                render();
              }
              if (message?.type === 'gift') {
                throwGift();
              }
            });

            render();
          </script>
        </body>
      </html>
    `;
  }
}

function getNonce(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 16; i += 1) {
    nonce += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return nonce;
}
