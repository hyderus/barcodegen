import React, { useState } from 'react';
import { 
  Download, 
  FileCode2, 
  Copy, 
  Check, 
  ChevronDown
} from 'lucide-react';
import { 
  downloadBarcode, 
  copyBarcodeToClipboard, 
  BarcodeRenderOptions 
} from '../utils/barcodeGenerator';

interface ExportActionsProps {
  renderOptions: BarcodeRenderOptions;
  isTransparent: boolean;
  formatTitle: string;
  onDownloaded?: () => void;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  renderOptions,
  isTransparent,
  formatTitle,
  onDownloaded,
}) => {
  const [resolutionMultiplier, setResolutionMultiplier] = useState<number>(2);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showResMenu, setShowResMenu] = useState(false);

  const handleDownload = async (format: 'png' | 'svg', forceTransparent: boolean = isTransparent) => {
    setIsDownloading(true);
    try {
      await downloadBarcode(
        renderOptions,
        format,
        forceTransparent,
        resolutionMultiplier,
        `barcode_${formatTitle}_${forceTransparent ? 'transparent' : 'solid'}`
      );
      if (onDownloaded) {
        onDownloaded();
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    const ok = await copyBarcodeToClipboard(renderOptions, isTransparent);
    if (ok) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      if (onDownloaded) {
        onDownloaded();
      }
    }
  };

  const RESOLUTIONS = [
    { mult: 1, label: '1x (Standard / Web)', dpi: '72 DPI' },
    { mult: 2, label: '2x (Retina / Sharp)', dpi: '150 DPI' },
    { mult: 4, label: '4x (High-Res Print)', dpi: '300 DPI' },
    { mult: 8, label: '8x (Ultra Crisp Vector-Grade)', dpi: '600 DPI' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
      
      {/* Header and Resolution Picker */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Download className="w-5 h-5 text-orange-500" />
            <span>Export & Download Center</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Download transparent high-resolution PNG or lossless vector SVG
          </p>
        </div>

        {/* Resolution Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowResMenu(!showResMenu)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <span>DPI: {RESOLUTIONS.find((r) => r.mult === resolutionMultiplier)?.label.split('(')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showResMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-1.5 z-30 animate-scale-in">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Export Resolution / Scale
              </div>
              {RESOLUTIONS.map((res) => (
                <button
                  key={res.mult}
                  onClick={() => {
                    setResolutionMultiplier(res.mult);
                    setShowResMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    resolutionMultiplier === res.mult
                      ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{res.label}</span>
                  <span className="font-mono text-[10px] text-slate-400">{res.dpi}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        
        {/* 1. Primary Highlight Button: Download Transparent PNG */}
        <button
          onClick={() => handleDownload('png', true)}
          disabled={isDownloading}
          className="group relative sm:col-span-2 lg:col-span-1 flex items-center justify-center space-x-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-white">
            <Download className="w-3.5 h-3.5" />
          </div>
          <span>Download Transparent PNG</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-orange-100 font-mono">
            {RESOLUTIONS.find((r) => r.mult === resolutionMultiplier)?.dpi}
          </span>
        </button>

        {/* 2. Download SVG Vector */}
        <button
          onClick={() => handleDownload('svg')}
          disabled={isDownloading}
          className="flex items-center justify-center space-x-2 px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-sm shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <FileCode2 className="w-4 h-4 text-orange-400" />
          <span>Download Vector SVG</span>
        </button>

        {/* 3. Copy Transparent PNG to Clipboard */}
        <button
          onClick={handleCopy}
          className={`flex items-center justify-center space-x-2 px-4 py-3.5 rounded-2xl border font-semibold text-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
            isCopied
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
          }`}
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-400" />
              <span>Copy Transparent PNG</span>
            </>
          )}
        </button>

      </div>

      {/* Secondary Row: Solid PNG option if currently solid or user wants white box */}
      {!isTransparent && (
        <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
          <span>Solid background is currently enabled.</span>
          <button
            onClick={() => handleDownload('png', false)}
            className="text-orange-600 dark:text-orange-400 hover:underline font-semibold"
          >
            Download Solid PNG ({renderOptions.backgroundcolor || '#ffffff'})
          </button>
        </div>
      )}

    </div>
  );
};
