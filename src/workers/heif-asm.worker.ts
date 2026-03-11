/// <reference lib="webworker" />

let lib: any = null;

async function getLib(): Promise<any> {
  if (!lib) {
    const module = await import('../libheif-asmjs.bundle.js');
    const LibHeif = (module as any).default ?? module;
    lib = typeof LibHeif === 'function' ? LibHeif() : LibHeif;
  }
  return lib;
}

export interface WorkerRequest {
  id: number;
  buffer: ArrayBuffer;
}

export interface WorkerResult {
  id: number;
  results?: Array<{ width: number; height: number; data: ArrayBuffer }>;
  error?: string;
}

self.addEventListener('message', async (e: MessageEvent<WorkerRequest>) => {
  const { id, buffer } = e.data;
  try {
    const lib = await getLib();
    const decoder = new lib.HeifDecoder();
    const data = decoder.decode(new Uint8Array(buffer));

    if (!data || data.length === 0) {
      (self as any).postMessage({
        id,
        error: 'No images found in HEIC file',
      } satisfies WorkerResult);
      return;
    }

    const results: Array<{ width: number; height: number; data: ArrayBuffer }> = [];

    for (const image of data) {
      const width: number = image.get_width();
      const height: number = image.get_height();

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

      // Transfer ownership of the underlying buffer — zero-copy back to main thread
      results.push({ width, height, data: decoded.buffer as ArrayBuffer });
    }

    const transferables = results.map((r) => r.data);
    (self as any).postMessage({ id, results } satisfies WorkerResult, transferables);
  } catch (err: any) {
    (self as any).postMessage({ id, error: err.message } satisfies WorkerResult);
  }
});
