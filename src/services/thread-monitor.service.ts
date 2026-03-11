import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThreadMonitorService {
  readonly maxDelta = signal(0);

  reset() {
    this.maxDelta.set(0);
  }
}
