import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ThreadMonitorService } from '../services/thread-monitor.service';

@Component({
  selector: 'app-thread-monitor',
  standalone: true,
  template: `
    <div class="tm">
      <div class="tm-row">
        <span class="tm-label">Time</span>
        <span class="tm-value mono">{{ currentTime() }}</span>
      </div>
      <div class="tm-row">
        <span class="tm-label">Frame Δ</span>
        <span
          class="tm-value mono"
          [class.ok]="delta() <= 50"
          [class.warn]="delta() > 50 && delta() <= 200"
          [class.bad]="delta() > 200"
          >{{ delta() }} ms</span
        >
      </div>
      <div class="tm-row">
        <span class="tm-label">Peak Δ</span>
        <span
          class="tm-value mono"
          [class.ok]="monitor.maxDelta() <= 50"
          [class.warn]="monitor.maxDelta() > 50 && monitor.maxDelta() <= 200"
          [class.bad]="monitor.maxDelta() > 200"
          >{{ monitor.maxDelta() }} ms</span
        >
        <button class="tm-reset" (click)="resetMax()">reset</button>
      </div>
    </div>
  `,
  styles: [
    `
      .tm {
        display: inline-flex;
        flex-direction: column;
        gap: 4px;
        background: #1a1a1a;
        color: #e0e0e0;
        border-radius: 8px;
        padding: 10px 16px;
        font-size: 13px;
        margin-bottom: 24px;
      }
      .tm-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .tm-label {
        width: 56px;
        color: #888;
        flex-shrink: 0;
      }
      .tm-value {
        min-width: 120px;
      }
      .mono {
        font-family: 'Courier New', monospace;
        font-size: 14px;
      }
      .ok {
        color: #4caf50;
      }
      .warn {
        color: #ff9800;
      }
      .bad {
        color: #f44336;
        font-weight: 700;
      }
      .tm-reset {
        margin-left: 8px;
        padding: 1px 8px;
        font-size: 11px;
        border: 1px solid #444;
        border-radius: 4px;
        background: #2a2a2a;
        color: #aaa;
        cursor: pointer;
      }
      .tm-reset:hover {
        background: #333;
        color: #fff;
      }
    `,
  ],
})
export class ThreadMonitorComponent implements OnInit, OnDestroy {
  currentTime = signal('--:--:--.---');
  delta = signal(0);

  private rafId = 0;
  private lastTs = 0;

  constructor(readonly monitor: ThreadMonitorService) {}

  ngOnInit() {
    const tick = (ts: number) => {
      const now = new Date();
      this.currentTime.set(now.toISOString().slice(11, 23));

      if (this.lastTs > 0) {
        const diff = Math.round(ts - this.lastTs);
        this.delta.set(diff);
        if (diff > this.monitor.maxDelta()) {
          this.monitor.maxDelta.set(diff);
        }
      }
      this.lastTs = ts;
      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.rafId);
  }

  resetMax() {
    this.monitor.reset();
    this.lastTs = 0;
  }
}
