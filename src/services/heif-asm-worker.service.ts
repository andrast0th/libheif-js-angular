import { Injectable, OnDestroy } from '@angular/core';
import { HeifImage } from '../util/model';
import type { WorkerResult } from '../workers/heif-asm.worker';

@Injectable({ providedIn: 'root' })
export class HeifAsmWorkerService implements OnDestroy {
  private worker = new Worker(new URL('../workers/heif-asm.worker', import.meta.url), {
    type: 'module',
  });
  private pending = new Map<
    number,
    { resolve: (v: HeifImage[]) => void; reject: (e: Error) => void }
  >();
  private nextId = 0;

  constructor() {
    this.worker.addEventListener('message', (e: MessageEvent<WorkerResult>) => {
      const { id, results, error } = e.data;
      const p = this.pending.get(id);
      if (!p) return;
      this.pending.delete(id);

      if (error) {
        p.reject(new Error(error));
      } else {
        p.resolve(
          (results ?? []).map(({ width, height, data }) => ({
            width,
            height,
            data: new Uint8ClampedArray(data),
          })),
        );
      }
    });
  }

  decode(buffer: ArrayBuffer): Promise<HeifImage[]> {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.pending.set(id, { resolve, reject });
      // Transfer the buffer to the worker — zero-copy
      this.worker.postMessage({ id, buffer }, [buffer]);
    });
  }

  ngOnDestroy() {
    this.worker.terminate();
  }
}
