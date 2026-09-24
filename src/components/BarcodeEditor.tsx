import React from 'react';
import { 
  BarcodeState 
} from '../types';
import { 
  FONT_OPTIONS 
} from '../data/symbologies';
import { isEanUpcSymbology } from '../utils/barcodeGenerator';
import { 
  Type, 
  RotateCw, 
  Sliders, 
  Palette, 
  ChevronRight, 
  Sparkles
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

            {/* Font Size & Alignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
                  <span>Font Size</span>
                  <span className="font-mono font-medium">{state.textSize}pt</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="16"
                  step="0.5"
                  value={state.textSize}
                  onChange={(e) => onChange({ textSize: parseFloat(e.target.value) })}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
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
                            ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                )}
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
