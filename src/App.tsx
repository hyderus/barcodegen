import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { BarcodeSelectorModal } from './components/BarcodeSelectorModal';
import { BarcodeEditor } from './components/BarcodeEditor';
import { QRCodeEditor } from './components/QRCodeEditor';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ExportActions } from './components/ExportActions';
import { BatchGenerator } from './components/BatchGenerator';
import { PackageLabelStudio } from './components/PackageLabelStudio';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SYMBOLOGIES, Symbology } from './data/symbologies';
import { AppMode, BarcodeState, QRState, HistoryItem } from './types';
import { BarcodeRenderOptions, preloadThumbnailCache } from './utils/barcodeGenerator';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

export const App: React.FC = () => {
  // Preload all barcode thumbnails in background for instantaneous modal opening
  useEffect(() => {
    preloadThumbnailCache(SYMBOLOGIES);
  }, []);

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // App mode
  const [currentMode, setCurrentMode] = useState<AppMode>('barcode');

  // Selector modal
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // History drawer
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('barcode_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('barcode_history', JSON.stringify(history.slice(0, 30)));
    } catch {}
  }, [history]);

  // Current canvas data URL for history tracking
  const [latestDataUrl, setLatestDataUrl] = useState<string>('');

  // Barcode studio state
  const [barcodeState, setBarcodeState] = useState<BarcodeState>({
    symbology: SYMBOLOGIES[0], // Code-128
    text: SYMBOLOGIES[0].sample,
    altText: '',
    includeText: true,
    textFont: 'OCR-B',
    textSize: 8.5,
    textAlign: 'center',
    textXOffset: 0,
    textYOffset: 0,
    textSpacing: 0,
    barColor: '#000000',
    backgroundColor: '#ffffff',
    isTransparent: true,
    scale: 3,
    height: 15,
    padding: 10,
    rotate: 'N',
    customFileName: '',
  });

  // QR code studio state
  const [qrState, setQrState] = useState<QRState>({
    qrType: 'url',
    url: 'https://github.com',
    text: 'Scan to visit my link or text',
    wifi: {
      ssid: 'Office_WiFi',
      password: 'password123',
      encryption: 'WPA',
      hidden: false,
    },
    vcard: {
      firstName: 'John',
      lastName: 'Doe',
      organization: 'Acme Corp',
      phone: '+1 555-0123',
      email: 'john@example.com',
      url: 'https://example.com',
    },
    email: {
      address: 'support@example.com',
      subject: 'Customer Inquiry',
      body: 'Hello, I have a question regarding your products.',
    },
    sms: {
      phone: '+1 555-0123',
      message: 'Hello, please contact me back.',
    },
    ecLevel: 'M',
    barColor: '#000000',
    backgroundColor: '#ffffff',
    isTransparent: true,
    scale: 4,
    padding: 4,
  });

  // When switching symbology
  const handleSelectSymbology = (newSymbology: Symbology) => {
    setBarcodeState((prev) => ({
      ...prev,
      symbology: newSymbology,
      text: newSymbology.sample, // Auto seed with valid sample so it never errors!
    }));
  };

  // Build compiled QR text based on sub-type
  const qrEncodedText = useMemo(() => {
    switch (qrState.qrType) {
      case 'url':
        return qrState.url || 'https://example.com';
      case 'text':
        return qrState.text || ' ';
      case 'wifi':
        return `WIFI:T:${qrState.wifi.encryption};S:${qrState.wifi.ssid};P:${qrState.wifi.password};${
          qrState.wifi.hidden ? 'H:true;' : ''
        };`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${qrState.vcard.lastName};${qrState.vcard.firstName};;;\nFN:${qrState.vcard.firstName} ${qrState.vcard.lastName}\nORG:${qrState.vcard.organization}\nTEL:${qrState.vcard.phone}\nEMAIL:${qrState.vcard.email}\nURL:${qrState.vcard.url}\nEND:VCARD`;
      case 'email':
        return `mailto:${qrState.email.address}?subject=${encodeURIComponent(
          qrState.email.subject
        )}&body=${encodeURIComponent(qrState.email.body)}`;
      case 'sms':
        return `SMSTO:${qrState.sms.phone}:${qrState.sms.message}`;
      default:
        return 'https://example.com';
    }
  }, [qrState]);

  // Compute active BarcodeRenderOptions for the canvas and export actions
  const activeRenderOptions: BarcodeRenderOptions = useMemo(() => {
    if (currentMode === 'qrcode') {
      return {
        bcid: 'qrcode',
        text: qrEncodedText,
        scale: qrState.scale,
        includetext: false,
        barcolor: qrState.barColor,
        backgroundcolor: qrState.isTransparent ? null : qrState.backgroundColor,
        padding: qrState.padding,
        extraOptions: {
          eclevel: qrState.ecLevel,
        },
      };
    } else {
      return {
        bcid: barcodeState.symbology.bcid,
        text: barcodeState.text || '12345',
        alttext: barcodeState.altText ? barcodeState.altText : undefined,
        scale: barcodeState.scale,
        height: barcodeState.height,
        includetext: barcodeState.includeText,
        textfont: barcodeState.textFont,
        textsize: barcodeState.textSize,
        textxalign: barcodeState.textAlign,
        textxoffset: barcodeState.textXOffset || 0,
        textyoffset: barcodeState.textYOffset || 0,
        textspacing: barcodeState.textSpacing || 0,
        barcolor: barcodeState.barColor,
        backgroundcolor: barcodeState.isTransparent ? null : barcodeState.backgroundColor,
        rotate: barcodeState.rotate,
        padding: barcodeState.padding,
        extraOptions: barcodeState.symbology.defaultOptions,
      };
    }
  }, [currentMode, qrEncodedText, qrState, barcodeState]);

  // Save to history on successful download or copy
  const handleRecordHistory = useCallback(() => {
    if (!latestDataUrl) return;

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: currentMode === 'qrcode' ? 'qrcode' : 'barcode',
      title:
        currentMode === 'qrcode'
          ? `QR (${qrState.qrType.toUpperCase()})`
          : barcodeState.symbology.name,
      bcid: activeRenderOptions.bcid,
      text: activeRenderOptions.text,
      includeText: !!activeRenderOptions.includetext,
      isTransparent: currentMode === 'qrcode' ? qrState.isTransparent : barcodeState.isTransparent,
      dataUrl: latestDataUrl,
    };

    setHistory((prev) => [newItem, ...prev.filter((item) => item.text !== newItem.text)]);
  }, [latestDataUrl, currentMode, qrState, barcodeState, activeRenderOptions]);

  // Load history item into active editor
  const handleLoadHistoryItem = (item: HistoryItem) => {
    if (item.type === 'qrcode') {
      setCurrentMode('qrcode');
      setQrState((prev) => ({
        ...prev,
        text: item.text || prev.text,
        url: item.text || prev.url,
        isTransparent: item.isTransparent !== undefined ? item.isTransparent : prev.isTransparent,
      }));
    } else {
      setCurrentMode('barcode');
      const foundSym = SYMBOLOGIES.find((s) => s.bcid === item.bcid) || SYMBOLOGIES[0];
      setBarcodeState((prev) => ({
        ...prev,
        symbology: foundSym,
        text: item.text || prev.text,
        includeText: item.includeText !== undefined ? item.includeText : prev.includeText,
        isTransparent: item.isTransparent !== undefined ? item.isTransparent : prev.isTransparent,
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Navigation */}
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Mode 1: Box Label 1:1 Studio */}
        {currentMode === 'packagelabel' ? (
          <PackageLabelStudio
            onRecordHistory={(title, dataUrl) => {
              const newItem: HistoryItem = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                type: 'barcode',
                title,
                dataUrl,
              };
              setHistory((prev) => [newItem, ...prev.filter((i) => i.title !== newItem.title)].slice(0, 30));
            }}
          />
        ) : currentMode === 'batch' ? (
          /* Mode 2: Batch Generator */
          <BatchGenerator />
        ) : (
          /* Mode 3 & 4: Barcode Studio & QR Code Studio */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Left Controls Column (6 cols on lg) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Studio Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>
                      {currentMode === 'barcode' ? 'Barcode Studio' : 'QR Code Studio'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white font-semibold">
                      Live Preview
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentMode === 'barcode'
                      ? 'Select from over 40+ linear, postal, and GS1 barcode standards.'
                      : 'Create interactive QR codes for URLs, Wi-Fi networks, and contact cards.'}
                  </p>
                </div>

                {currentMode === 'barcode' && (
                  <button
                    onClick={() => setIsSelectorOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
                  >
                    Browse All Types
                  </button>
                )}
              </div>

              {/* Editor Switch */}
              {currentMode === 'barcode' ? (
                <BarcodeEditor
                  state={barcodeState}
                  onChange={(updates) => setBarcodeState((prev) => ({ ...prev, ...updates }))}
                  onOpenSelector={() => setIsSelectorOpen(true)}
                  onLoadSample={() =>
                    setBarcodeState((prev) => ({ ...prev, text: prev.symbology.sample }))
                  }
                />
              ) : (
                <QRCodeEditor
                  state={qrState}
                  onChange={(updates) => setQrState((prev) => ({ ...prev, ...updates }))}
                />
              )}
            </div>

            {/* Right Preview & Export Column (6 cols on lg, sticky on desktop) */}
            <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-24">
              {/* Canvas Live Preview */}
              <PreviewCanvas
                renderOptions={activeRenderOptions}
                symbologyName={
                  currentMode === 'qrcode'
                    ? `QR Code (${qrState.qrType.toUpperCase()})`
                    : barcodeState.symbology.name
                }
                isTransparent={
                  currentMode === 'qrcode'
                    ? qrState.isTransparent
                    : barcodeState.isTransparent
                }
                onFixWithSample={() => {
                  if (currentMode === 'barcode') {
                    setBarcodeState((prev) => ({ ...prev, text: prev.symbology.sample }));
                  } else {
                    setQrState((prev) => ({ ...prev, url: 'https://example.com' }));
                  }
                }}
                onSuccessRender={setLatestDataUrl}
              />

              {/* Export / Download Actions Card */}
              <ExportActions
                renderOptions={activeRenderOptions}
                isTransparent={
                  currentMode === 'qrcode'
                    ? qrState.isTransparent
                    : barcodeState.isTransparent
                }
                formatTitle={
                  currentMode === 'qrcode' ? 'qrcode' : barcodeState.symbology.bcid
                }
                onDownloaded={handleRecordHistory}
              />
            </div>

          </div>
        )}

      </main>

      {/* Feature Highlights Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Transparent PNG Ready
                </h4>
                <p className="text-[11px] text-slate-500">
                  Export with true alpha channel for seamless graphic and packaging overlays.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  100% Client-Side Privacy
                </h4>
                <p className="text-[11px] text-slate-500">
                  All barcodes are rendered locally in your browser. Zero data leaves your device.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Full Symbology Library
                </h4>
                <p className="text-[11px] text-slate-500">
                  Linear, Postal, GS1 DataBar, EAN/UPC, and 2D QR matrix codes supported.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Symbology Selector Modal */}
      <BarcodeSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        selectedSymbology={barcodeState.symbology}
        onSelect={handleSelectSymbology}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onClear={() => setHistory([])}
        onSelect={handleLoadHistoryItem}
      />

    </div>
  );
};

export default App;
