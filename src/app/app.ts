import { Component, signal } from '@angular/core';
import { AsmWorkerComponent } from '../components/asm-worker.component';
import { MainThreadComponent } from '../components/asm.component';
import { ThreadMonitorComponent } from '../components/thread-monitor.component';
import { WasmComponent } from '../components/wasm.component';

export type TabId = 'asm' | 'wasm' | 'asm-worker';

export interface Tab {
  id: TabId;
  label: string;
  description: string;
}

@Component({
  selector: 'app-root',
  imports: [ThreadMonitorComponent, MainThreadComponent, WasmComponent, AsmWorkerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly tabs: Tab[] = [
    {
      id: 'asm',
      label: 'asm.js — main thread',
      description: 'Synchronous decode on the JS main thread',
    },
    {
      id: 'wasm',
      label: 'WASM — main thread',
      description: 'Synchronous WASM decode on the JS main thread',
    },
    {
      id: 'asm-worker',
      label: 'asm.js — worker',
      description: 'asm.js decode offloaded to a Web Worker',
    },
  ];

  activeTab = signal<TabId>('asm');

  setTab(id: TabId) {
    this.activeTab.set(id);
  }
}
