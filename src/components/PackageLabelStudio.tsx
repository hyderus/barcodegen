import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PackageLabelState 
} from '../types';
import { 
  DEFAULT_PIXEL_LABEL, 
  renderPackageLabelToCanvas, 
  generatePackageLabelSvg 
} from '../utils/packageLabelGenerator';
import { saveAs } from 'file-saver';
import { 
  Download, 
  Printer, 
  Copy, 
  Check, 
  RotateCcw, 
  Layers, 
  Smartphone, 
  ShieldCheck, 
  QrCode
} from 'lucide-react';

interface PackageLabelStudioProps {
  onRecordHistory?: (title: string, dataUrl: string) => void;
}

export const PackageLabelStudio: React.FC<PackageLabelStudioProps> = ({ onRecordHistory }) => {
  const [labelState, setLabelState] = useState<PackageLabelState>(DEFAULT_PIXEL_LABEL);
  const [copied, setCopied] = useState(false);
  const [autoSyncQR, setAutoSyncQR] = useState(true);
  const [previewZoom, setPreviewZoom] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-sync QR payload if enabled
  useEffect(() => {
    if (autoSyncQR) {
      const payload = `${labelState.sku};${labelState.imei1};${labelState.imei2};${labelState.eid}`;
      setLabelState((prev) => ({ ...prev, qrPayload: payload }));
    }
  }, [autoSyncQR, labelState.sku, labelState.imei1, labelState.imei2, labelState.eid]);

  // Re-render canvas whenever state updates
  useEffect(() => {
    if (canvasRef.current) {
      renderPackageLabelToCanvas(canvasRef.current, labelState);
    }
  }, [labelState]);

  const updateState = (updates: Partial<PackageLabelState>) => {
    setLabelState((prev) => ({ ...prev, ...updates }));
  };

  const handleResetToPixel = () => {
    setLabelState(DEFAULT_PIXEL_LABEL);
    setAutoSyncQR(true);
  };

  // Download High-Resolution PNG
  const handleDownloadPng = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      if (blob) {
        const filename = `${labelState.sku || 'hardware'}_box_label.png`;
        saveAs(blob, filename);
        if (onRecordHistory) {
          onRecordHistory(
            `Packaging Label: ${labelState.sku}`,
            canvas.toDataURL('image/png')
          );
        }
      }
    }, 'image/png');
  }, [labelState.sku, onRecordHistory]);

  // Download Vector SVG
  const handleDownloadSvg = useCallback(() => {
    const svgStr = generatePackageLabelSvg(labelState);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const filename = `${labelState.sku || 'hardware'}_box_label.svg`;
    saveAs(blob, filename);
    if (onRecordHistory && canvasRef.current) {
      onRecordHistory(
        `Packaging SVG: ${labelState.sku}`,
        canvasRef.current.toDataURL('image/png')
      );
    }
  }, [labelState, onRecordHistory]);

  // Copy PNG to Clipboard
  const handleCopyPng = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, []);

  // Print Label Directly
  const handlePrint = useCallback(() => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Label - ${labelState.sku}</title>
          <style>
            @page {
              size: auto;
              margin: 10mm;
            }
            body {
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              background: #fff;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [labelState.sku]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Hardware Box Packaging Label Studio
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-600 text-white shadow-xs">
                1:1 Match
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generates genuine multi-barcode smartphone & device box packaging stickers (Google Pixel, Android & GS1 standards).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetToPixel}
          className="flex items-center justify-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
          <span>Reset to Pixel 7a Sample</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Interactive Form Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Product & SKU Info */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-orange-500" />
              <span>Product & SKU Information</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Product / Model Name:
                </label>
                <input
                  type="text"
                  value={labelState.modelName}
                  onChange={(e) => updateState({ modelName: e.target.value })}
                  placeholder="e.g. Google Pixel 7a (128GB, Charcoal)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    SKU Code:
                  </label>
                  <input
                    type="text"
                    value={labelState.sku}
                    onChange={(e) => updateState({ sku: e.target.value })}
                    placeholder="e.g. GA03694-GB"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Factory / Batch Code:
                  </label>
                  <input
                    type="text"
                    value={labelState.batchCode}
                    onChange={(e) => updateState({ batchCode: e.target.value })}
                    placeholder="e.g. 4302"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Barcodes & Identifiers */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-orange-500" />
              <span>Barcode Data & Cellular Identifiers</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* EAN-13 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 dark:text-slate-300 font-semibold">
                    EAN-13 / GTIN-13 (Top-Left Barcode):
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">13 digits</span>
                </div>
                <input
                  type="text"
                  maxLength={13}
                  value={labelState.ean}
                  onChange={(e) => updateState({ ean: e.target.value })}
                  placeholder="0840244701819"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Renders with authentic guard bars, quiet-zone leading digit, and DM Sans numerals.
                </p>
              </div>

              {/* IMEI 1 & IMEI 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    IMEI 1 (SIM 1):
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={labelState.imei1}
                    onChange={(e) => updateState({ imei1: e.target.value })}
                    placeholder="354487208189804"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    IMEI 2 (SIM 2):
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={labelState.imei2}
                    onChange={(e) => updateState({ imei2: e.target.value })}
                    placeholder="354487208189812"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* eID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 dark:text-slate-300 font-semibold">
                    eID (32-Digit Embedded SIM ID):
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">32 digits</span>
                </div>
                <input
                  type="text"
                  maxLength={32}
                  value={labelState.eid}
                  onChange={(e) => updateState({ eid: e.target.value })}
                  placeholder="89033023427100000000027633036749"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Card 3: QR Code & Customization */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <QrCode className="w-4 h-4 text-orange-500" />
              <span>QR Code Payload & Typography</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 dark:text-slate-300 font-semibold">
                    QR Code Payload:
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer text-[11px] text-orange-600 dark:text-orange-400">
                    <input
                      type="checkbox"
                      checked={autoSyncQR}
                      onChange={(e) => setAutoSyncQR(e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span>Auto-sync with fields</span>
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={labelState.qrPayload}
                  disabled={autoSyncQR}
                  onChange={(e) => updateState({ qrPayload: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    autoSyncQR 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white'
                  }`}
                />
              </div>

              {/* Font & Border Customization */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Label Typography:
                  </label>
                  <select
                    value={labelState.font}
                    onChange={(e) => updateState({ font: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="DM Sans">DM Sans (Google Sans 1:1)</option>
                    <option value="OCR-B">OCR-B Standard</option>
                    <option value="Inconsolata">Monospace</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Sticker Corners:
                  </label>
                  <select
                    value={labelState.borderStyle}
                    onChange={(e) => updateState({ borderStyle: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="rounded">Rounded Die-Cut (Physical)</option>
                    <option value="square">Square Rectangular</option>
                    <option value="none">Borderless / Transparent</option>
                  </select>
                </div>
              </div>

              {/* Text Spacing / Letter Tracking */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 dark:text-slate-300 font-semibold">
                    Barcode Digits Spacing / Tracking:
                  </label>
                  <span className="font-mono text-slate-500 font-bold">
                    {(labelState.textSpacing ?? 0.8) > 0 ? `+${labelState.textSpacing ?? 0.8}` : labelState.textSpacing ?? 0.8} pt
                  </span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="4"
                  step="0.2"
                  value={labelState.textSpacing ?? 0.8}
                  onChange={(e) => updateState({ textSpacing: parseFloat(e.target.value) })}
                  className="w-full accent-orange-600 cursor-pointer"
                />
                <div className="flex items-center space-x-1 mt-1">
                  {[
                    { label: 'Tight', val: 0 },
                    { label: 'Original Match', val: 0.8 },
                    { label: 'Spacious', val: 1.5 },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.val}
                      onClick={() => updateState({ textSpacing: p.val })}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                        (labelState.textSpacing ?? 0.8) === p.val
                          ? 'bg-orange-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 1:1 Live Preview & Export Suite (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  1:1 Live Packaging Sticker Preview
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-800/60">
                  Ready to Print
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {[0.75, 1, 1.25].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setPreviewZoom(z)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                      previewZoom === z
                        ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {Math.round(z * 100)}%
                  </button>
                ))}
              </div>
            </div>

            {/* Sticker Canvas Viewport */}
            <div className="relative overflow-auto p-4 sm:p-6 rounded-xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center min-h-[300px]">
              <div 
                className="transition-transform duration-150 origin-center drop-shadow-md"
                style={{ transform: `scale(${previewZoom})` }}
              >
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto block rounded-xl"
                  style={{ width: '100%', maxWidth: '750px' }}
                />
              </div>
            </div>

            {/* Export & Print Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>PNG (300 DPI)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-orange-400" />
                <span>Vector SVG</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-bold text-xs active:scale-95 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span>Print Sticker</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPng}
                className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-bold text-xs active:scale-95 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    <span>Copy PNG</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Reference Feature Breakdown Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2.5">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Packaging Specification Match (1:1 Analysis)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-600 dark:text-slate-400">
              <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">EAN-13 Quiet Zone & Pockets</span>
                True GS1 ISO 15420 guards extending downward with leading <code className="text-orange-600 font-bold">0</code> placed outside in the quiet margin.
              </div>
              <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Code 128 Mode C Density</span>
                Double-density packing for 15-digit IMEIs and 32-digit eSIM eIDs so they remain compact across the label width.
              </div>
              <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Google Sans / DM Sans</span>
                Clean geometric numerals and spurless uppercase letters matching Google hardware retail packaging stickers.
              </div>
              <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Factory Production QR</span>
                Automated optical test bench QR matrix coupled with the batch code (e.g. <code className="text-orange-600 font-bold">4302</code>).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
