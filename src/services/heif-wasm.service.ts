import { Injectable } from '@angular/core';
import libheif from 'libheif-js/libheif-wasm/libheif-bundle.mjs';
import { HeifImage } from './heif.service';

@Injectable({ providedIn: 'root' })
export class HeifWasmService {
  async decode(buffer: ArrayBuffer): Promise<HeifImage[]> {
    const { HeifDecoder } = libheif();
    const decoder = new HeifDecoder();
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
