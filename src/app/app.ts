import { Component, signal } from '@angular/core';
import { AsmWorkerComponent } from '../components/asm-worker.component';
import { MainThreadComponent } from '../components/main-thread.component';
import { ThreadMonitorComponent } from '../components/thread-monitor.component';
import { WasmThreadComponent } from '../components/wasm-thread.component';

export type TabId = 'main-thread' | 'wasm-thread' | 'asm-worker';

export interface Tab {
  id: TabId;
  label: string;
  description: string;
}

@Component({
  selector: 'app-root',
  imports: [ThreadMonitorComponent, MainThreadComponent, WasmThreadComponent, AsmWorkerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly tabs: Tab[] = [
    {
      id: 'main-thread',
      label: 'asm.js — main thread',
      description: 'Synchronous decode on the JS main thread',
    },
    {
      id: 'wasm-thread',
      label: 'WASM — main thread',
      description: 'Synchronous WASM decode on the JS main thread',
    },
    {
      id: 'asm-worker',
      label: 'asm.js — worker',
      description: 'asm.js decode offloaded to a Web Worker',
    },
  ];

  activeTab = signal<TabId>('main-thread');

  setTab(id: TabId) {
    this.activeTab.set(id);
  }
}
