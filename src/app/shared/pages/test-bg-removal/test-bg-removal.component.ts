import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

interface BgResult {
  blob: Blob | null;
  url: string | null;
  timeMs: number;
  sizeKb: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  error: string | null;
}

@Component({
  selector: 'app-test-bg-removal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <header class="header">
        <h1>Background Removal Benchmark</h1>
        <p class="subtitle">Confronto client-side vs API per la rimozione sfondo pet</p>
      </header>

      <!-- Upload Zone -->
      <div
        class="upload-zone"
        [class.drag-over]="isDragOver"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">
        <input
          #fileInput
          type="file"
          accept="image/jpeg,image/png,image/webp"
          (change)="onFileSelected($event)"
          hidden />
        <div class="upload-icon">&#128247;</div>
        <p class="upload-text">
          {{ originalUrl ? 'Clicca o trascina per cambiare foto' : 'Trascina una foto del pet qui' }}
        </p>
        <p class="upload-hint">JPEG, PNG o WebP &middot; Max 10 MB</p>
      </div>

      <p *ngIf="fileError" class="file-error">{{ fileError }}</p>

      <!-- Original Preview -->
      <div *ngIf="originalUrl" class="original-section">
        <h2>Originale</h2>
        <div class="original-preview">
          <img [src]="originalUrl" alt="Original" />
        </div>
        <p class="meta">{{ originalName }} &middot; {{ originalSizeKb | number:'1.0-0' }} KB</p>
      </div>

      <!-- Results Side by Side -->
      <div *ngIf="originalUrl" class="results-grid">

        <!-- IMGLY Result -->
        <div class="result-card">
          <h3>&#64;imgly/background-removal</h3>
          <p class="method-tag client">Client-side (WASM)</p>

          <div class="model-row">
            <label>Modello:</label>
            <select [(ngModel)]="imglyModel">
              <option value="isnet">ISNet Full (migliore qualita)</option>
              <option value="isnet_fp16">ISNet FP16 (bilanciato)</option>
              <option value="isnet_quint8">ISNet Quint8 (piu veloce)</option>
            </select>
          </div>

          <div class="result-preview checkerboard">
            <div *ngIf="imgly.status === 'idle'" class="placeholder">In attesa...</div>
            <div *ngIf="imgly.status === 'processing'" class="spinner-wrap">
              <div class="spinner"></div>
              <p>Elaborazione in corso...</p>
              <p class="hint">Il primo avvio scarica il modello (~40 MB)</p>
            </div>
            <img *ngIf="imgly.status === 'done' && imgly.url" [src]="imgly.url" alt="IMGLY result" />
            <div *ngIf="imgly.status === 'error'" class="error-msg">{{ imgly.error }}</div>
          </div>

          <div *ngIf="imgly.status === 'done'" class="metrics">
            <div class="metric">
              <span class="metric-label">Tempo</span>
              <span class="metric-value">{{ imgly.timeMs | number:'1.0-0' }} ms</span>
            </div>
            <div class="metric">
              <span class="metric-label">Output</span>
              <span class="metric-value">{{ imgly.sizeKb | number:'1.0-0' }} KB</span>
            </div>
          </div>
        </div>

        <!-- Clipdrop Result -->
        <div class="result-card">
          <h3>Clipdrop (Stability AI)</h3>
          <p class="method-tag api">API esterna &middot; 100 free/giorno</p>
          <p *ngIf="!clipdropApiKey" class="no-key-warn">API key non configurata in environment</p>

          <div class="result-preview checkerboard">
            <div *ngIf="clipdrop.status === 'idle'" class="placeholder">In attesa...</div>
            <div *ngIf="clipdrop.status === 'processing'" class="spinner-wrap">
              <div class="spinner"></div>
              <p>Chiamata API Clipdrop...</p>
            </div>
            <img *ngIf="clipdrop.status === 'done' && clipdrop.url" [src]="clipdrop.url" alt="Clipdrop result" />
            <div *ngIf="clipdrop.status === 'error'" class="error-msg">{{ clipdrop.error }}</div>
          </div>

          <div *ngIf="clipdrop.status === 'done'" class="metrics">
            <div class="metric">
              <span class="metric-label">Tempo</span>
              <span class="metric-value">{{ clipdrop.timeMs | number:'1.0-0' }} ms</span>
            </div>
            <div class="metric">
              <span class="metric-label">Output</span>
              <span class="metric-value">{{ clipdrop.sizeKb | number:'1.0-0' }} KB</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Process Button -->
      <button
        *ngIf="originalUrl && !isProcessing"
        class="process-btn"
        (click)="processAll()">
        Avvia Benchmark
      </button>

      <!-- Comparison Summary -->
      <div *ngIf="imgly.status === 'done' && clipdrop.status === 'done'" class="summary">
        <h2>Riepilogo</h2>
        <table class="summary-table">
          <thead>
            <tr>
              <th></th>
              <th>&#64;imgly (WASM)</th>
              <th>Clipdrop (API)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tempo</td>
              <td [class.winner]="imgly.timeMs <= clipdrop.timeMs">{{ imgly.timeMs | number:'1.0-0' }} ms</td>
              <td [class.winner]="clipdrop.timeMs < imgly.timeMs">{{ clipdrop.timeMs | number:'1.0-0' }} ms</td>
            </tr>
            <tr>
              <td>Dimensione output</td>
              <td>{{ imgly.sizeKb | number:'1.0-0' }} KB</td>
              <td>{{ clipdrop.sizeKb | number:'1.0-0' }} KB</td>
            </tr>
            <tr>
              <td>Costo</td>
              <td class="winner">Gratuito</td>
              <td class="winner">100 free/giorno</td>
            </tr>
            <tr>
              <td>Privacy</td>
              <td class="winner">100% locale</td>
              <td>Upload a Stability AI</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f4f6fa;
    }

    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px 16px 80px;
    }

    .header {
      text-align: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .subtitle {
      margin: 4px 0 0;
      font-size: 14px;
      color: #666;
    }

    /* Upload Zone */
    .upload-zone {
      border: 2px dashed #b0bec5;
      border-radius: 16px;
      padding: 32px 16px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      background: #fff;
    }

    .upload-zone:hover,
    .upload-zone.drag-over {
      border-color: #1565c0;
      background: #e3f2fd;
    }

    .upload-icon {
      font-size: 48px;
      line-height: 1;
    }

    .upload-text {
      margin: 8px 0 4px;
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }

    .upload-hint {
      margin: 0;
      font-size: 12px;
      color: #999;
    }

    .file-error {
      color: #d32f2f;
      font-size: 13px;
      text-align: center;
      margin: 8px 0 0;
    }

    /* Original Preview */
    .original-section {
      margin-top: 24px;
      text-align: center;
    }

    .original-section h2 {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 0 0 8px;
    }

    .original-preview {
      border-radius: 12px;
      overflow: hidden;
      display: inline-block;
      max-width: 300px;
      border: 1px solid #e0e0e0;
    }

    .original-preview img {
      display: block;
      width: 100%;
      height: auto;
    }

    .meta {
      margin: 6px 0 0;
      font-size: 12px;
      color: #888;
    }

    /* Results Grid */
    .results-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 24px;
    }

    @media (max-width: 600px) {
      .results-grid {
        grid-template-columns: 1fr;
      }
    }

    .result-card {
      background: #fff;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }

    .result-card h3 {
      margin: 0 0 4px;
      font-size: 15px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .method-tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 8px;
      margin: 0 0 12px;
    }

    .method-tag.client {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .method-tag.api {
      background: #fff3e0;
      color: #e65100;
    }

    /* Model selector */
    .model-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .model-row label {
      font-size: 12px;
      font-weight: 600;
      color: #555;
      white-space: nowrap;
    }

    .model-row select {
      flex: 1;
      padding: 6px 10px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 12px;
      outline: none;
      background: #fff;
      transition: border-color 0.2s;
    }

    .model-row select:focus {
      border-color: #1565c0;
    }

    /* No key warning */
    .no-key-warn {
      font-size: 12px;
      color: #e65100;
      margin: 0 0 8px;
    }

    /* Result Preview */
    .result-preview {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .checkerboard {
      background-image:
        linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
        linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
        linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
      background-size: 16px 16px;
      background-position: 0 0, 0 8px, 8px -8px, -8px 0;
    }

    .result-preview img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .placeholder {
      font-size: 13px;
      color: #999;
      background: rgba(255,255,255,0.85);
      padding: 8px 16px;
      border-radius: 8px;
    }

    .error-msg {
      font-size: 13px;
      color: #d32f2f;
      background: rgba(255,255,255,0.9);
      padding: 8px 16px;
      border-radius: 8px;
      text-align: center;
      word-break: break-word;
    }

    /* Spinner */
    .spinner-wrap {
      text-align: center;
      background: rgba(255,255,255,0.85);
      padding: 16px;
      border-radius: 12px;
    }

    .spinner-wrap p {
      margin: 8px 0 0;
      font-size: 13px;
      color: #555;
    }

    .spinner-wrap .hint {
      font-size: 11px;
      color: #999;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e0e0e0;
      border-top-color: #1565c0;
      border-radius: 50%;
      margin: 0 auto;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Metrics */
    .metrics {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }

    .metric {
      flex: 1;
      background: #f4f6fa;
      border-radius: 10px;
      padding: 8px 12px;
      text-align: center;
    }

    .metric-label {
      display: block;
      font-size: 11px;
      color: #888;
      margin-bottom: 2px;
    }

    .metric-value {
      display: block;
      font-size: 16px;
      font-weight: 700;
      color: #1a1a2e;
    }

    /* Process Button */
    .process-btn {
      display: block;
      width: 100%;
      margin-top: 24px;
      padding: 14px;
      font-size: 16px;
      font-weight: 700;
      color: #fff;
      background: #1565c0;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .process-btn:hover {
      background: #0d47a1;
    }

    /* Summary Table */
    .summary {
      margin-top: 32px;
    }

    .summary h2 {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 12px;
    }

    .summary-table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }

    .summary-table th,
    .summary-table td {
      padding: 10px 12px;
      font-size: 13px;
      text-align: left;
      border-bottom: 1px solid #f0f0f0;
    }

    .summary-table th {
      background: #f4f6fa;
      font-weight: 600;
      color: #555;
    }

    .summary-table td:first-child {
      font-weight: 600;
      color: #333;
    }

    .summary-table .winner {
      color: #2e7d32;
      font-weight: 700;
    }
  `]
})
export class TestBgRemovalComponent {
  isDragOver = false;
  fileError: string | null = null;

  originalFile: File | null = null;
  originalUrl: string | null = null;
  originalName = '';
  originalSizeKb = 0;

  clipdropApiKey = (environment as Record<string, unknown>)['clipdropApiKey'] as string || '';
  imglyModel: 'isnet' | 'isnet_fp16' | 'isnet_quint8' = 'isnet';

  imgly: BgResult = this.emptyResult();
  clipdrop: BgResult = this.emptyResult();

  get isProcessing(): boolean {
    return this.imgly.status === 'processing' || this.clipdrop.status === 'processing';
  }

  constructor(private cdr: ChangeDetectorRef) {}

  // --- File handling ---

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) this.loadFile(file);
  }

  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.loadFile(file);
    input.value = '';
  }

  private loadFile(file: File): void {
    this.fileError = null;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.fileError = 'Formato non supportato. Usa JPEG, PNG o WebP.';
      this.cdr.markForCheck();
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      this.fileError = 'File troppo grande. Massimo 10 MB.';
      this.cdr.markForCheck();
      return;
    }

    // Revoke previous URL
    if (this.originalUrl) URL.revokeObjectURL(this.originalUrl);
    if (this.imgly.url) URL.revokeObjectURL(this.imgly.url);
    if (this.clipdrop.url) URL.revokeObjectURL(this.clipdrop.url);

    this.originalFile = file;
    this.originalUrl = URL.createObjectURL(file);
    this.originalName = file.name;
    this.originalSizeKb = file.size / 1024;
    this.imgly = this.emptyResult();
    this.clipdrop = this.emptyResult();
    this.cdr.markForCheck();
  }

  // --- Processing ---

  async processAll(): Promise<void> {
    if (!this.originalFile) return;

    // Launch both in parallel
    const imglyPromise = this.processImgly(this.originalFile);
    const clipdropPromise = this.clipdropApiKey
      ? this.processClipdrop(this.originalFile)
      : Promise.resolve();

    await Promise.allSettled([imglyPromise, clipdropPromise]);
  }

  private async processImgly(file: File): Promise<void> {
    this.imgly = { ...this.emptyResult(), status: 'processing' };
    this.cdr.markForCheck();

    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const start = performance.now();
      const blob = await removeBackground(file, {
        device: 'cpu',
        model: this.imglyModel,
      });
      const elapsed = performance.now() - start;

      this.imgly = {
        blob,
        url: URL.createObjectURL(blob),
        timeMs: elapsed,
        sizeKb: blob.size / 1024,
        status: 'done',
        error: null,
      };
    } catch (err: unknown) {
      this.imgly = {
        ...this.emptyResult(),
        status: 'error',
        error: err instanceof Error ? err.message : 'Errore sconosciuto',
      };
    }
    this.cdr.markForCheck();
  }

  private async processClipdrop(file: File): Promise<void> {
    if (!this.clipdropApiKey) {
      this.clipdrop = { ...this.emptyResult(), status: 'error', error: 'API key mancante' };
      this.cdr.markForCheck();
      return;
    }

    this.clipdrop = { ...this.emptyResult(), status: 'processing' };
    this.cdr.markForCheck();

    try {
      const formData = new FormData();
      formData.append('image_file', file);

      const start = performance.now();
      const res = await fetch('https://clipdrop-api.co/remove-background/v1', {
        method: 'POST',
        headers: { 'x-api-key': this.clipdropApiKey },
        body: formData,
      });
      const elapsed = performance.now() - start;

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        const errMsg = errBody?.error || `HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      const blob = await res.blob();
      this.clipdrop = {
        blob,
        url: URL.createObjectURL(blob),
        timeMs: elapsed,
        sizeKb: blob.size / 1024,
        status: 'done',
        error: null,
      };
    } catch (err: unknown) {
      this.clipdrop = {
        ...this.emptyResult(),
        status: 'error',
        error: err instanceof Error ? err.message : 'Errore sconosciuto',
      };
    }
    this.cdr.markForCheck();
  }

  private emptyResult(): BgResult {
    return { blob: null, url: null, timeMs: 0, sizeKb: 0, status: 'idle', error: null };
  }
}
