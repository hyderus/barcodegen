import React from 'react';
import { 
  BarcodeState 
} from '../types';
import { 
  FONT_OPTIONS,
  SYMBOLOGIES
} from '../data/symbologies';
import { isEanUpcSymbology } from '../utils/barcodeGenerator';
import { 
  Type, 
  RotateCw, 
  Sliders, 
  Palette, 
  ChevronRight, 
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Move
} from 'lucide-react';

interface BarcodeEditorProps {
  state: BarcodeState;
  onChange: (updates: Partial<BarcodeState>) => void;
  onOpenSelector: () => void;
  onLoadSample: () => void;
}

const COLOR_PRESETS = [
  { name: 'Black', hex: '#000000' },
  { name: 'Dark Slate', hex: '#1e293b' },
  { name: 'Deep Navy', hex: '#1e3a8a' },
  { name: 'Forest Green', hex: '#14532d' },
  { name: 'Crimson', hex: '#7f1d1d' },
  { name: 'Orange', hex: '#ea580c' },
];

export const BarcodeEditor: React.FC<BarcodeEditorProps> = ({
  state,
  onChange,
  onOpenSelector,
  onLoadSample,
}) => {
  return (
    <div className="space-y-6">
      
      {/* 1. Barcode Symbology Selector Trigger Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-orange-300 dark:hover:border-orange-700/60">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Barcode Format & Symbology
          </label>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400">
            {state.symbology.category.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenSelector}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 hover:bg-orange-50/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 group transition-all duration-200 active:scale-[0.99] cursor-pointer hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-sm"
        >
          <div className="text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {state.symbology.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              {state.symbology.description}
            </p>
          </div>
          <div className="flex items-center space-x-1 text-xs font-medium text-orange-600 dark:text-orange-400 pl-3">
            <span className="hidden sm:inline">Change</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* 2. Barcode Data Input Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Barcode Data / Payload</span>
          </label>
          <button
            onClick={onLoadSample}
            className="flex items-center space-x-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Valid Sample</span>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={state.text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder={state.symbology.placeholder}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
          {state.text && (
            <button
              onClick={() => onChange({ text: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-start space-x-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-orange-600 dark:text-orange-400">Hint:</span>
          <span>{state.symbology.helpText}</span>
        </div>

        {state.symbology.bcid === 'upca' && state.text.length === 13 && state.text.startsWith('0') && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-xs">
            <span className="text-orange-800 dark:text-orange-300 font-medium">
              13-digit code starting with 0 detected. Google packaging labels use EAN-13 format for this.
            </span>
            <button
              type="button"
              onClick={() => {
                const eanSym = SYMBOLOGIES.find(s => s.bcid === 'ean13');
                if (eanSym) onChange({ symbology: eanSym });
              }}
              className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shrink-0 ml-2 cursor-pointer shadow-xs"
            >
              Switch to EAN-13
            </button>
          </div>
        )}
      </div>

      {/* 3. Number / Text Below Barcode Controls (KEY USER REQUIREMENT) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Type className="w-4 h-4 text-orange-500" />
              <span>Show Number / Text Below Barcode</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Include human-readable interpretation digits below the barcode bars
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={state.includeText}
            onClick={() => onChange({ includeText: !state.includeText })}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
              state.includeText ? 'bg-orange-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                state.includeText ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Text Customization Sub-options (only if includeText is true) */}
        {state.includeText && (
          <div className="pt-2 space-y-4 animate-fade-in">
            {/* Font Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Font Family (OCR-B Standard & DM Sans Google Font)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FONT_OPTIONS.map((f) => (
                  <button
                    type="button"
                    key={f.id}
                    onClick={() => onChange({ textFont: f.id })}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs border transition-all cursor-pointer ${
                      state.textFont === f.id
                        ? 'border-orange-500 bg-orange-50/80 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-bold ring-1 ring-orange-500/60 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="truncate font-medium">{f.name.split('(')[0]}</span>
                      {f.id === 'OCR-B' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-bold shrink-0">
                          Standard
                        </span>
                      )}
                      {f.id === 'DM Sans' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-orange-600 text-white font-bold shrink-0">
                          Google Font
                        </span>
                      )}
                    </div>
                    <span 
                      className="text-xs text-slate-500 dark:text-slate-400 shrink-0 font-semibold pl-2"
                      style={{ fontFamily: f.css }}
                    >
                      {f.preview}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Alternate Display Text / Label */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="font-semibold">Custom Display Text (Optional Label Override)</span>
                {state.altText ? (
                  <button
                    type="button"
                    onClick={() => onChange({ altText: '' })}
                    className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                  >
                    Reset to raw data
                  </button>
                ) : null}
              </div>
              <input
                type="text"
                value={state.altText || ''}
                placeholder={state.text || 'e.g. SKU: GA03694-GB'}
                onChange={(e) => onChange({ altText: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Customize the human-readable text printed with the barcode (e.g. adding labels like <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">SKU: ...</code> or dual numbers) while encoding the original data.
              </p>
            </div>

            {/* Font Size & Alignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mb-1.5">
                  <span className="font-semibold">Font Size</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="3"
                      max="32"
                      step="0.5"
                      value={state.textSize}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val > 0) onChange({ textSize: val });
                      }}
                      className="w-16 px-2 py-0.5 text-right font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="font-mono text-slate-400 text-xs">pt</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="4"
                  max="24"
                  step="0.5"
                  value={state.textSize}
                  onChange={(e) => onChange({ textSize: parseFloat(e.target.value) })}
                  className="w-full accent-orange-600 cursor-pointer"
                />
                <div className="flex items-center space-x-1.5 mt-1.5">
                  {[
                    { label: 'Small', size: 7 },
                    { label: 'Standard', size: 8.5 },
                    { label: 'Medium', size: 10 },
                    { label: 'Large', size: 12 },
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.size}
                      onClick={() => onChange({ textSize: preset.size })}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                        state.textSize === preset.size
                          ? 'bg-orange-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Text Alignment
                </label>
                {isEanUpcSymbology(state.symbology.bcid) ? (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">ISO Standard Pockets</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-800/60">
                      Auto Guard-Bars
                    </span>
                  </div>
                ) : (
                  <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => onChange({ textAlign: align })}
                        className={`flex-1 py-1 text-xs font-medium rounded capitalize transition-all ${
                          state.textAlign === align
                            ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm font-semibold'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                  {isEanUpcSymbology(state.symbology.bcid)
                    ? 'Retail symbologies enforce standardized GS1 pockets.'
                    : 'Align interpretation text relative to the barcode.'}
                </p>
              </div>
            </div>

            {/* Text Spacing / Letter Tracking Control */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="font-semibold flex items-center space-x-1.5">
                  <Move className="w-3.5 h-3.5 text-orange-500" />
                  <span>Text Spacing / Letter Tracking</span>
                </span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="-3"
                    max="10"
                    step="0.2"
                    value={state.textSpacing ?? 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) onChange({ textSpacing: val });
                    }}
                    className="w-16 px-2 py-0.5 text-right font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="font-mono text-slate-400 text-xs">pt</span>
                </div>
              </div>
              <input
                type="range"
                min="-2"
                max="6"
                step="0.2"
                value={state.textSpacing ?? 0}
                onChange={(e) => onChange({ textSpacing: parseFloat(e.target.value) })}
                className="w-full accent-orange-600 cursor-pointer"
              />
              <div className="flex items-center space-x-1.5 mt-1.5">
                {[
                  { label: 'Tight', spacing: -0.5 },
                  { label: 'Standard', spacing: 0 },
                  { label: 'Spacious', spacing: 0.8 },
                  { label: 'Wide', spacing: 1.5 },
                ].map((preset) => (
                  <button
                    type="button"
                    key={preset.spacing}
                    onClick={() => onChange({ textSpacing: preset.spacing })}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                      (state.textSpacing ?? 0) === preset.spacing
                        ? 'bg-orange-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {preset.label} ({preset.spacing > 0 ? `+${preset.spacing}` : preset.spacing})
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                Adjusts character kerning and spacing between digits/letters to match physical packaging prints.
              </p>
            </div>

            {/* Text Position & Nudge (Up, Down, Left, Right) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Move className="w-3.5 h-3.5 text-orange-500" />
                  <span>Text Positioning & Nudge (Up / Down / Left / Right)</span>
                </label>
                {(state.textXOffset || state.textYOffset) ? (
                  <button
                    type="button"
                    onClick={() => onChange({ textXOffset: 0, textYOffset: 0 })}
                    className="flex items-center space-x-1 text-[11px] font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Position</span>
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
                {/* D-Pad Nudge Buttons */}
                <div className="flex flex-col items-center justify-center space-y-1">
                  <button
                    type="button"
                    onClick={() => onChange({ textYOffset: (state.textYOffset || 0) + 1 })}
                    title="Nudge Text Up (+1pt)"
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-orange-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-orange-600 transition-all active:scale-95 shadow-xs cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => onChange({ textXOffset: (state.textXOffset || 0) - 1 })}
                      title="Nudge Text Left (-1pt)"
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-orange-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-orange-600 transition-all active:scale-95 shadow-xs cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange({ textXOffset: 0, textYOffset: 0 })}
                      title="Center / Reset Offset to (0, 0)"
                      className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-orange-100 dark:hover:bg-slate-500 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:text-orange-600 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                    >
                      0,0
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange({ textXOffset: (state.textXOffset || 0) + 1 })}
                      title="Nudge Text Right (+1pt)"
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-orange-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-orange-600 transition-all active:scale-95 shadow-xs cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange({ textYOffset: (state.textYOffset || 0) - 1 })}
                    title="Nudge Text Down (-1pt)"
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-orange-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-orange-600 transition-all active:scale-95 shadow-xs cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Direct Number Inputs for X and Y Offsets */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Horizontal (X Offset):</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        step="0.5"
                        value={state.textXOffset ?? 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) onChange({ textXOffset: val });
                        }}
                        className="w-16 px-2 py-0.5 text-right font-mono font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <span className="font-mono text-slate-400">pt</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Vertical (Y Offset):</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        step="0.5"
                        value={state.textYOffset ?? 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) onChange({ textYOffset: val });
                        }}
                        className="w-16 px-2 py-0.5 text-right font-mono font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <span className="font-mono text-slate-400">pt</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
                    Tip: Positive Y moves up, negative Y moves down. Positive X moves right, negative X moves left.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Appearance & Dimensions Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Palette className="w-4 h-4 text-orange-500" />
          <span>Colors & Background Transparency</span>
        </h4>

        {/* Transparent Background Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-800/40">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Transparent PNG Background</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-600 text-white font-bold">
                Recommended
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Exports without white or colored box, perfect for overlays and designs
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={state.isTransparent}
            onClick={() => onChange({ isTransparent: !state.isTransparent })}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
              state.isTransparent ? 'bg-orange-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                state.isTransparent ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Color Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Barcode Bar Color */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Barcode Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={state.barColor}
                onChange={(e) => onChange({ barColor: e.target.value })}
                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
              />
              <input
                type="text"
                value={state.barColor}
                onChange={(e) => onChange({ barColor: e.target.value })}
                className="w-24 px-2 py-1.5 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            {/* Quick swatches */}
            <div className="flex items-center space-x-1.5 mt-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.hex}
                  onClick={() => onChange({ barColor: p.hex })}
                  title={p.name}
                  style={{ backgroundColor: p.hex }}
                  className={`w-5 h-5 rounded-full border border-black/10 transition-transform ${
                    state.barColor.toLowerCase() === p.hex.toLowerCase() ? 'scale-125 ring-2 ring-orange-500' : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Background Solid Color (if not transparent) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Background Color {!state.isTransparent && '(Solid Mode)'}
            </label>
            {state.isTransparent ? (
              <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                Transparent (Active)
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={state.backgroundColor}
                  onChange={(e) => onChange({ backgroundColor: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                />
                <input
                  type="text"
                  value={state.backgroundColor}
                  onChange={(e) => onChange({ backgroundColor: e.target.value })}
                  className="w-24 px-2 py-1.5 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Sliders: Height, Scale, Padding */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Bar Height */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
              <span>Bar Height</span>
              <span className="font-mono font-medium">{state.height}mm</span>
            </div>
            <input
              type="range"
              min="8"
              max="40"
              value={state.height}
              onChange={(e) => onChange({ height: parseInt(e.target.value) })}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <div className="flex items-center space-x-1 mt-1.5">
              {[
                { label: 'Compact 10mm', height: 10 },
                { label: 'Standard 15mm', height: 15 },
                { label: 'Tall 20mm', height: 20 },
              ].map((h) => (
                <button
                  type="button"
                  key={h.height}
                  onClick={() => onChange({ height: h.height })}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    state.height === h.height
                      ? 'bg-orange-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scale */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
              <span>Scale Multiplier</span>
              <span className="font-mono font-medium">{state.scale}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              value={state.scale}
              onChange={(e) => onChange({ scale: parseInt(e.target.value) })}
              className="w-full accent-orange-600 cursor-pointer"
            />
          </div>

          {/* Padding / Margin */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
              <span>Quiet Zone (Padding)</span>
              <span className="font-mono font-medium">{state.padding}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={state.padding}
              onChange={(e) => onChange({ padding: parseInt(e.target.value) })}
              className="w-full accent-orange-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Rotation */}
        <div className="pt-2 flex items-center justify-between">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Orientation / Rotation</span>
          </label>
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            {[
              { val: 'N', label: '0°' },
              { val: 'R', label: '90°' },
              { val: 'I', label: '180°' },
              { val: 'L', label: '270°' },
            ].map((rot) => (
              <button
                key={rot.val}
                onClick={() => onChange({ rotate: rot.val as any })}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  state.rotate === rot.val
                    ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {rot.label}
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
