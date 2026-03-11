import { Injectable } from '@angular/core';

export interface HeifImage {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

@Injectable({ providedIn: 'root' })
export class HeifService {
  private lib: any = null;

  private async getLib(): Promise<any> {
    if (!this.lib) {
      // Lazy-load the asm.js build — no WASM, no wasm-unsafe-eval CSP needed
      const module = await import('../libheif-asmjs.bundle.js');
      const LibHeif = (module as any).default ?? module;
      this.lib = typeof LibHeif === 'function' ? LibHeif() : LibHeif;
    }
    return this.lib;
  }

  async decode(buffer: ArrayBuffer): Promise<HeifImage[]> {
    const lib = await this.getLib();
    const decoder = new lib.HeifDecoder();
    const data = decoder.decode(new Uint8Array(buffer));

    if (!data || data.length === 0) {
      throw new Error('No images found in HEIC file');
    }

    const results: HeifImage[] = [];

    for (const image of data) {
      const width = image.get_width();
      const height = image.get_height();

      const decoded = await new Promise<Uint8ClampedArray>((resolve, reject) => {
        image.display(
          { data: new Uint8ClampedArray(width * height * 4), width, height },
          (result: any) => {
            if (!result) {
              reject(new Error('Failed to decode HEIF image'));
              return;
            }
            resolve(result.data);
          },
        );
      });

      results.push({ width, height, data: decoded });
    }

    return results;
  }
}
