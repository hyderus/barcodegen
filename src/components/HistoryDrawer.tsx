import React from 'react';
import { HistoryItem } from '../types';
import { 
  X, 
  Trash2, 
  Clock, 
  Download, 
  Barcode,
  QrCode
} from 'lucide-react';
import { saveAs } from 'file-saver';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onClear: () => void;
  onSelect: (item: HistoryItem) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onClear,
  onSelect,
}) => {
  if (!isOpen) return null;

  const handleDownloadItem = (item: HistoryItem) => {
    // Convert dataUrl to blob and download
    fetch(item.dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        saveAs(blob, `${item.bcid}_${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`);
      });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-scale-in">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Generation History
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                {items.length}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {items.length > 0 && (
                <button
                  onClick={onClear}
                  title="Clear history"
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="py-20 text-center">
                <Clock className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No generation history yet
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Barcodes and QR codes you generate in this session will appear here for easy re-download.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-orange-300 dark:hover:border-orange-800 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                        {item.type === 'qrcode' ? (
                          <QrCode className="w-4 h-4" />
                        ) : (
                          <Barcode className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                          {item.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.bcid} • {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadItem(item)}
                      title="Download PNG"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div 
                    onClick={() => { onSelect(item); onClose(); }}
                    className="mt-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 checkerboard-pattern flex items-center justify-center cursor-pointer group"
                  >
                    <img
                      src={item.dataUrl}
                      alt={item.title}
                      className="max-h-16 max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[200px] font-mono">
                      {item.text}
                    </span>
                    <button
                      onClick={() => { onSelect(item); onClose(); }}
                      className="text-orange-600 dark:text-orange-400 hover:underline font-semibold"
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
