import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { SYMBOLOGIES } from '../data/symbologies';
import { generatePngBlob } from '../utils/barcodeGenerator';
import { 
  Layers, 
  Loader2,
  FileSpreadsheet,
  FileArchive
} from 'lucide-react';

export const BatchGenerator: React.FC = () => {
  const [selectedBcid, setSelectedBcid] = useState('code128');
  const [includeText, setIncludeText] = useState(true);
  const [isTransparent, setIsTransparent] = useState(true);
  const [inputText, setInputText] = useState(
    'ITEM-00101\nITEM-00102\nITEM-00103\nITEM-00104\nITEM-00105'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const lines = inputText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const handleBatchDownload = async () => {
    if (lines.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: lines.length });

    const zip = new JSZip();
    const folder = zip.folder(`barcodes_${selectedBcid}`) || zip;

    let successful = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      try {
        const blob = await generatePngBlob({
          bcid: selectedBcid,
          text: line,
          includetext: includeText,
          backgroundcolor: isTransparent ? null : 'ffffff',
          scale: 3,
          height: 15,
          textfont: 'OCR-B',
          textsize: 8.5,
          textxalign: 'center',
          barcolor: '000000',
        });

        // Clean filename
        const safeName = line.replace(/[^a-zA-Z0-9_-]/g, '_');
        folder.file(`${String(i + 1).padStart(3, '0')}_${safeName}.png`, blob);
        successful++;
      } catch (err) {
        console.warn(`Error generating barcode for line "${line}":`, err);
      }
      setProgress({ current: i + 1, total: lines.length });
    }

    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `barcodes_${selectedBcid}_${successful}_items.zip`);
    } catch (err) {
      console.error('Failed to generate zip:', err);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Batch Barcode Generator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate hundreds of transparent PNG barcodes at once and download as a ZIP archive.
            </p>
          </div>
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          {/* Format Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Symbology Format
            </label>
            <select
              value={selectedBcid}
              onChange={(e) => setSelectedBcid(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            >
              {SYMBOLOGIES.map((s) => (
                <option key={s.id} value={s.bcid}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          {/* Show text toggle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Numbers Below Barcode
            </label>
            <button
              onClick={() => setIncludeText(!includeText)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-between transition-colors ${
                includeText
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>{includeText ? 'Numbers Shown' : 'Barcode Bars Only'}</span>
              <span className="w-2 h-2 rounded-full bg-orange-500" />
            </button>
          </div>

          {/* Transparent PNG Toggle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              PNG Background
            </label>
            <button
              onClick={() => setIsTransparent(!isTransparent)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-between transition-colors ${
                isTransparent
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>{isTransparent ? 'Transparent PNG (Alpha)' : 'Solid White PNG'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Input Textarea Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-orange-500" />
            <span>Barcode List (One barcode per line)</span>
          </label>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
            {lines.length} Barcodes to Generate
          </span>
        </div>

        <textarea
          rows={8}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter one barcode per line, e.g.&#10;ITEM-1001&#10;ITEM-1002&#10;ITEM-1003"
          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        {/* Progress Bar */}
        {progress && (
          <div className="space-y-1.5 animate-fade-in">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Generating barcodes...</span>
              <span className="font-mono font-bold">
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-150"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Download Button */}
        <button
          onClick={handleBatchDownload}
          disabled={lines.length === 0 || isProcessing}
          className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-orange-500/25 transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Packaging Barcodes into ZIP...</span>
            </>
          ) : (
            <>
              <FileArchive className="w-5 h-5" />
              <span>Download ZIP Archive of {lines.length} Barcodes</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
