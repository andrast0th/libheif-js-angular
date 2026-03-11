import { Component, OnDestroy, signal } from '@angular/core';
import { HeifAsmService } from '../services/heif-asm.service';
import { ThreadMonitorService } from '../services/thread-monitor.service';
import { HeifImage } from '../util/model';

@Component({
  selector: 'app-asm',
  standalone: true,
  template: `
    <label class="file-label">
      <input
        type="file"
        accept=".heic,.heif"
        (change)="onFileChange($event)"
        [disabled]="loading()"
      />
      Choose .heic / .heif file
    </label>

    <p class="status" [class.loading]="loading()">{{ status() }}</p>

    @if (images().length > 1) {
      <div class="thumb-row">
        @for (img of images(); track $index) {
          <button
            class="thumb"
            [class.active]="selectedIndex() === $index"
            (click)="selectImage($index)"
          >
            Image {{ $index + 1 }} ({{ img.width }}x{{ img.height }})
          </button>
        }
      </div>
    }

    @if (imageUrl()) {
      <div class="canvas-wrap">
        <img width="100%" [src]="imageUrl()" [alt]="imageAlt()" />
      </div>
      <p class="info">
        {{ images()[selectedIndex()].width }}x{{ images()[selectedIndex()].height }}px
        &nbsp;&bull;&nbsp;HEIF&nbsp;{{ heifSize() }}&nbsp;&rarr;&nbsp;{{ blobType() }}&nbsp;{{
          blobSize()
        }}
        @if (elapsedMs() !== null) {
          &nbsp;&bull;&nbsp;took&nbsp;{{ elapsedMs() }}&nbsp;ms
        }
      </p>
    }
  `,
})
export class MainThreadComponent implements OnDestroy {
  status = signal<string>('Pick a .heic file to decode it.');
  loading = signal(false);
  images = signal<HeifImage[]>([]);
  selectedIndex = signal(0);
  imageUrl = signal<string | null>(null);
  imageAlt = signal('');
  blobSize = signal('');
  blobType = signal('');
  heifSize = signal('');
  elapsedMs = signal<number | null>(null);

  private currentUrl: string | null = null;

  constructor(
    private heif: HeifAsmService,
    private monitor: ThreadMonitorService,
  ) {}

  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      input.value = '';
      return;
    }

    this.loading.set(true);
    this.status.set(`Decoding "${file.name}"...`);
    this.images.set([]);
    this.heifSize.set(this.formatSize(file.size));
    this.elapsedMs.set(null);
    this.monitor.reset();
    input.value = '';
    this.revokeCurrentUrl();

    const t0 = performance.now();
    try {
      const buffer = await file.arrayBuffer();
      const decoded = await this.heif.decode(buffer);
      this.images.set(decoded);
      this.selectedIndex.set(0);
      this.status.set(`Decoded ${decoded.length} image(s) from "${file.name}"`);
      await this.renderImage(0);
      this.elapsedMs.set(Math.round(performance.now() - t0));
    } catch (err: any) {
      this.status.set(`Error: ${err.message}`);
    } finally {
      this.loading.set(false);
    }
  }

  async selectImage(index: number) {
    this.selectedIndex.set(index);
    await this.renderImage(index);
  }

  async renderImage(index: number) {
    const img = this.images()[index];
    if (!img) return;

    const oc = new OffscreenCanvas(img.width, img.height);
    const ctx = oc.getContext('2d')!;
    ctx.putImageData(new ImageData(new Uint8ClampedArray(img.data), img.width, img.height), 0, 0);
    const blob = await oc.convertToBlob({ type: 'image/jpeg', quality: 0.92 });

    this.revokeCurrentUrl();
    const url = URL.createObjectURL(blob);
    this.currentUrl = url;
    this.imageUrl.set(url);
    this.imageAlt.set(`Decoded image ${index + 1} (${img.width}x${img.height})`);
    this.blobType.set(blob.type);
    this.blobSize.set(this.formatSize(blob.size));
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  private revokeCurrentUrl() {
    if (this.currentUrl) {
      URL.revokeObjectURL(this.currentUrl);
      this.currentUrl = null;
      this.imageUrl.set(null);
    }
  }

  ngOnDestroy() {
    this.revokeCurrentUrl();
  }
}
