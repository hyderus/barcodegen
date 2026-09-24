import React, { useMemo, useState, useEffect } from 'react';
import { 
  renderToSvg, 
  generatePngBlob,
  copyBarcodeToClipboard, 
  BarcodeRenderOptions 
} from '../utils/barcodeGenerator';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Copy, 
  Check, 
  AlertCircle, 
  Sparkles,
  Grid,
  Sun,
  Moon
} from 'lucide-react';

interface PreviewCanvasProps {
  renderOptions: BarcodeRenderOptions;
  symbologyName: string;
  isTransparent: boolean;
  onFixWithSample?: () => void;
  onSuccessRender?: (dataUrl: string) => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  renderOptions,
  symbologyName,
  isTransparent,
  onFixWithSample,
  onSuccessRender,
}) => {
  const [zoom, setZoom] = useState(1);
  const [backdrop, setBackdrop] = useState<'checkerboard' | 'dark' | 'white'>('checkerboard');
  const [isCopied, setIsCopied] = useState(false);

  // Generate crisp vector SVG for the live preview
  const { svgMarkup, svgDimensions, errorMessage } = useMemo(() => {
    try {
      const svg = renderToSvg(renderOptions);
      // Extract viewBox dimensions
      const match = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
      const width = match ? Math.round(parseFloat(match[1])) : null;
      const height = match ? Math.round(parseFloat(match[2])) : null;

      return {
        svgMarkup: svg,
        svgDimensions: width && height ? `${width} × ${height} px` : null,
        errorMessage: null,
      };
    } catch (err: any) {
      let msg = err.message || 'Unable to generate barcode with the current data.';
      if (msg.includes('bwipp.')) {
        msg = msg.split('bwipp.')[1].replace(/#[0-9]+:/, ':').trim();
      }
      return {
        svgMarkup: null,
        svgDimensions: null,
        errorMessage: msg,
      };
    }
  }, [renderOptions]);

  // Generate high-resolution data URL for history tracking
  useEffect(() => {
    if (!svgMarkup) return;
    let isCancelled = false;

    // Generate crisp 3x offscreen PNG for history
    generatePngBlob(renderOptions, 2)
      .then((blob) => {
        if (!isCancelled && onSuccessRender) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (!isCancelled && typeof reader.result === 'string') {
              onSuccessRender(reader.result);
            }
          };
          reader.readAsDataURL(blob);
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [renderOptions, svgMarkup, onSuccessRender]);

  const handleCopy = async () => {
    const success = await copyBarcodeToClipboard(renderOptions, isTransparent);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
  const handleZoomReset = () => setZoom(1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between h-full min-h-[480px]">
      
      {/* Top Bar: Title, Transparency Badge & Viewport Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
              {symbologyName}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              isTransparent
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}>
              {isTransparent ? 'Transparent PNG (Alpha)' : 'Solid Background'}
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5 truncate max-w-[280px]">
            {renderOptions.text}
          </p>
        </div>

        {/* View Controls: Backdrop, Zoom, Copy */}
        <div className="flex items-center space-x-2">
          {/* Backdrop Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setBackdrop('checkerboard')}
              title="Checkerboard pattern (Transparency test)"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                backdrop === 'checkerboard'
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setBackdrop('white')}
              title="White preview background"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                backdrop === 'white'
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setBackdrop('dark')}
              title="Dark preview background"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                backdrop === 'dark'
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomReset}
              title="Reset Zoom to 100%"
              className="text-[11px] font-mono font-semibold px-1.5 text-slate-700 dark:text-slate-300 hover:text-orange-600"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomReset}
              title="Fit to Screen"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!!errorMessage}
            title="Copy Transparent PNG to Clipboard"
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isCopied
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Artboard Canvas Stage */}
      <div className="relative flex-1 my-4 min-h-[320px] rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center overflow-auto p-4 transition-colors">
        
        {/* Layer 1: Backdrop */}
        <div
          className={`absolute inset-0 transition-colors duration-200 ${
            backdrop === 'checkerboard'
              ? 'checkerboard-pattern bg-slate-50 dark:bg-slate-950'
              : backdrop === 'dark'
              ? 'bg-slate-950'
              : 'bg-white'
          }`}
        />

        {/* Layer 2: Error Overlay or Razor-Sharp Vector Artboard */}
        {errorMessage ? (
          <div className="relative z-10 max-w-md mx-4 p-6 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-red-200 dark:border-red-900/60 shadow-2xl backdrop-blur-md text-center animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Invalid Format for {symbologyName}
            </h4>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 mb-4 leading-relaxed">
              {errorMessage}
            </p>
            {onFixWithSample && (
              <button
                onClick={onFixWithSample}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-md shadow-orange-500/25 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fix with Valid Sample</span>
              </button>
            )}
          </div>
        ) : (
          /* Razor-Sharp Pure Vector SVG Artboard */
          <div
            className="relative z-10 transition-transform duration-150 ease-out flex items-center justify-center p-6 max-w-full max-h-full"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            {svgMarkup ? (
              <div 
                className="flex items-center justify-center max-w-full max-h-full [&>svg]:block [&>svg]:max-w-[540px] [&>svg]:max-h-[320px] [&>svg]:h-auto [&>svg]:drop-shadow-md"
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
              />
            ) : null}
          </div>
        )}

      </div>

      {/* Bottom Bar: Vector Precision Indicator & Dimensions */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 dark:text-slate-500">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Razor-Sharp Vector Render</span>
          </span>
          {svgDimensions && (
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {svgDimensions}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <span>
            {renderOptions.includetext ? 'Text: Visible' : 'Text: Hidden'}
          </span>
          <span>•</span>
          <span>
            Zoom: {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

    </div>
  );
};
