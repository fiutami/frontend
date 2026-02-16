import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BackgroundRemovalService {
  readonly isProcessing = signal(false);
  readonly progress = signal(0);

  async removeBackground(blob: Blob): Promise<Blob> {
    this.isProcessing.set(true);
    this.progress.set(0);

    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const result = await removeBackground(blob, {
        model: 'isnet_fp16',
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            this.progress.set(Math.round((current / total) * 100));
          }
        },
      });
      return result;
    } finally {
      this.isProcessing.set(false);
      this.progress.set(0);
    }
  }
}
