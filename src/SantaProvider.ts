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
              --tree-fill: #d7f7e8;
              --tree-fill-2: #effff7;
              --tree-border: #2e8b57;
              --tree-trunk: #b07a4a;
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
              zoom: 0.65;
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
              border: 2px dashed #d33c3c;
              border-radius: 18px;
              box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
            }
            .santa-emoji {
              font-size: 48px;
              filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
            }
            .gift-zone {
              position: fixed;
              inset: 0;
              overflow: hidden;
              pointer-events: none;
              z-index: 999;
            }
            .gift {
              position: absolute;
              left: 0;
              top: -24px;
              font-size: 20px;
              opacity: 0;
              will-change: transform, opacity;
            }
            .throw-gift {
              animation: gift-fall var(--dur, 1.6s) ease-in forwards;
            }
            @keyframes gift-fall {
              0% { transform: translate(0, 0) rotate(0deg) scale(0.95); opacity: 1; }
              70% { opacity: 1; }
              100% { transform: translate(var(--dx, 0px), 320px) rotate(var(--rot, 140deg)) scale(0.95); opacity: 0; }
            }
            .sleds {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
              gap: 12px;
              width: 100%;
            }
            .tree {
              position: relative;
              height: 150px;
              padding-top: 18px;
              display: grid;
              place-items: center;
              filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.10));
            }
            .tree::before {
              content: "";
              position: absolute;
              inset: 0;
              background: linear-gradient(180deg, var(--tree-fill) 0%, var(--tree-fill-2) 100%);
              border: 2px solid var(--tree-border);
              border-radius: 16px;
              clip-path: polygon(50% 4%, 94% 42%, 82% 42%, 98% 74%, 72% 74%, 86% 96%, 14% 96%, 28% 74%, 2% 74%, 18% 42%, 6% 42%);
            }
            .tree::after {
              content: "";
              position: absolute;
              width: 34px;
              height: 22px;
              left: 50%;
              bottom: 10px;
              transform: translateX(-50%);
              background: linear-gradient(180deg, #d8b08c 0%, var(--tree-trunk) 100%);
              border: 2px solid rgba(70, 40, 20, 0.25);
              border-radius: 6px;
            }
            .tree .lights {
              position: absolute;
              inset: 0;
              pointer-events: none;
              opacity: 0.9;
              mix-blend-mode: multiply;
              filter: saturate(1.05);
              background:
                radial-gradient(circle at 28% 45%, rgba(255, 204, 102, 0.85) 0 4px, transparent 6px),
                radial-gradient(circle at 58% 34%, rgba(255, 140, 180, 0.75) 0 4px, transparent 6px),
                radial-gradient(circle at 72% 58%, rgba(129, 220, 255, 0.75) 0 4px, transparent 6px),
                radial-gradient(circle at 40% 70%, rgba(173, 255, 156, 0.75) 0 4px, transparent 6px),
                radial-gradient(circle at 56% 82%, rgba(255, 236, 156, 0.75) 0 4px, transparent 6px);
              clip-path: polygon(50% 4%, 94% 42%, 82% 42%, 98% 74%, 72% 74%, 86% 96%, 14% 96%, 28% 74%, 2% 74%, 18% 42%, 6% 42%);
            }
            .tree .content {
              position: relative;
              z-index: 1;
              text-align: center;
              width: 100%;
              padding: 0 12px 28px;
              color: var(--text-primary);
            }
            .tree h3 {
              margin: 0 0 8px;
              font-size: 14px;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              color: var(--accent);
            }
            .tree .value {
              font-size: 28px;
              font-weight: 700;
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
              <span class="santa-emoji" aria-label="Santa">🎅</span>
            </div>
            <div class="rope" aria-hidden="true"></div>
            <div class="sleds">
              <div class="tree">
                <div class="lights" aria-hidden="true"></div>
                <div class="content">
                  <h3>Keystrokes</h3>
                  <div class="value" id="keystrokes">0</div>
                </div>
              </div>
              <div class="tree">
                <div class="lights" aria-hidden="true"></div>
                <div class="content">
                  <h3>Session Time</h3>
                  <div class="value" id="session">00:00</div>
                </div>
              </div>
              <div class="tree">
                <div class="lights" aria-hidden="true"></div>
                <div class="content">
                  <h3>IDE Time</h3>
                  <div class="value" id="total">00:00</div>
                </div>
              </div>
            </div>
          </div>
          <div class="gift-zone" id="gift-zone" aria-hidden="true"></div>
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
              const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
              const startX = Math.floor(Math.random() * Math.max(1, viewportWidth - 24));
              const drift = Math.floor((Math.random() - 0.5) * 140); // -70..70px
              const duration = 1.2 + Math.random() * 1.2; // 1.2..2.4s
              const rotation = Math.floor((Math.random() - 0.5) * 420); // -210..210deg
              gift.style.left = startX + 'px';
              gift.style.setProperty('--dx', drift + 'px');
              gift.style.setProperty('--dur', duration + 's');
              gift.style.setProperty('--rot', rotation + 'deg');
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
