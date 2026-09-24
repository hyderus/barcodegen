import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Barcode, 
  ShoppingCart, 
  Mail, 
  Layers, 
  QrCode, 
  Check, 
  ArrowRight,
  Info
} from 'lucide-react';
import { SYMBOLOGIES, CATEGORIES, Symbology, CategoryId } from '../data/symbologies';
import { getSymbologyThumbnailSvg } from '../utils/barcodeGenerator';

interface BarcodeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSymbology: Symbology;
  onSelect: (symbology: Symbology) => void;
}

export const BarcodeSelectorModal: React.FC<BarcodeSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedSymbology,
  onSelect,
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Silky smooth modal mount and enter/exit transition
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimatingIn(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setIsAnimatingIn(false);
      const timeout = setTimeout(() => {
        setShouldRender(false);
        setSearchQuery('');
      }, 280);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Focus search input when modal finishes opening
  useEffect(() => {
    if (isOpen && isAnimatingIn) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isAnimatingIn]);

  // Handle ESC key to smoothly close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered symbologies
  const filteredSymbologies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return SYMBOLOGIES.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.bcid.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  if (!shouldRender) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'linear': return <Barcode className="w-4 h-4 text-blue-500" />;
      case 'ean_upc': return <ShoppingCart className="w-4 h-4 text-emerald-500" />;
      case 'postal': return <Mail className="w-4 h-4 text-purple-500" />;
      case 'databar': return <Layers className="w-4 h-4 text-amber-500" />;
      case 'twod': return <QrCode className="w-4 h-4 text-rose-500" />;
      default: return <Barcode className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      
      {/* Backdrop with smooth fade transition */}
      <div 
        className={`fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 ease-out ${
          isAnimatingIn ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Modal Dialog with smooth Apple-style spring easing */}
      <div 
        className={`relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] z-10 transition-all duration-300 transform ${
          isAnimatingIn 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-[0.96] translate-y-4 pointer-events-none'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-20">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Select Barcode Symbology
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-800/40">
                {SYMBOLOGIES.length} Formats
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Live visual previews of all linear, retail EAN/UPC, postal, GS1 DataBar, and 2D barcode standards.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="px-5 py-3 sm:px-6 sm:py-4 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, code standard, or category (e.g. Code 128, EAN-13, PostNet, DataBar, QR)..."
              className="w-full pl-11 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60'
              }`}
            >
              All Types ({SYMBOLOGIES.length})
            </button>

            {CATEGORIES.map((cat) => {
              const count = SYMBOLOGIES.filter(s => s.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  {getCategoryIcon(cat.id)}
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeCategory === cat.id ? 'bg-orange-700 text-orange-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Symbologies Grid with Live Visual Previews */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredSymbologies.length === 0 ? (
            <div className="py-16 text-center">
              <Info className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No symbology found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No matching barcode format found for "{searchQuery}". Try searching for Code 128, EAN, UPC, PostNet, or DataBar.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredSymbologies.map((item) => {
                const isSelected = selectedSymbology.id === item.id;
                const thumbnailSvg = getSymbologyThumbnailSvg(
                  item.bcid,
                  item.sample,
                  item.defaultOptions
                );

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className={`group relative text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99] ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/20 ring-2 ring-orange-500/80 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-lg'
                    }`}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 ${
                            isSelected 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-orange-500'
                          }`}>
                            {getCategoryIcon(item.category)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                              {item.name}
                            </h4>
                            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                              bcid: {item.bcid}
                            </span>
                          </div>
                        </div>

                        {isSelected ? (
                          <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 capitalize">
                            {item.category.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      {/* Visual Barcode Preview Thumbnail Area */}
                      <div className="my-3 w-full h-20 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center p-2.5 overflow-hidden group-hover:bg-white dark:group-hover:bg-slate-900 group-hover:border-orange-200 dark:group-hover:border-orange-900/60 transition-all">
                        {thumbnailSvg ? (
                          <div 
                            className="max-h-full max-w-full flex items-center justify-center [&>svg]:max-h-16 [&>svg]:max-w-full [&>svg]:w-auto [&>svg]:h-auto transition-transform duration-200 group-hover:scale-105"
                            dangerouslySetInnerHTML={{ __html: thumbnailSvg }}
                          />
                        ) : (
                          <span className="text-xs text-slate-400 italic">Preview not available</span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[32px]">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono truncate max-w-[170px]" title={item.sample}>
                        Sample: <code className="text-slate-700 dark:text-slate-300 font-semibold">{item.sample}</code>
                      </span>
                      <span className={`font-semibold flex items-center space-x-1 shrink-0 ${
                        isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400'
                      }`}>
                        <span>{isSelected ? 'Selected' : 'Use Format'}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 sm:px-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredSymbologies.length}</strong> of {SYMBOLOGIES.length} symbologies
          </span>
          <span className="hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">ESC</kbd> to close
          </span>
        </div>

      </div>
    </div>
  );
};
