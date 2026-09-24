import bwipjs from 'bwip-js';
import { saveAs } from 'file-saver';
import { DM_SANS_BASE64 } from '../assets/dmSansBase64';

export interface BarcodeRenderOptions {
  bcid: string;
  text: string;
  scale?: number;
  height?: number;
  includetext?: boolean;
  textfont?: string;
  textsize?: number;
  textxalign?: 'left' | 'center' | 'right';
  barcolor?: string;
  backgroundcolor?: string | null;
  rotate?: 'N' | 'R' | 'L' | 'I';
  padding?: number;
  extraOptions?: Record<string, any>;
}

// Initialize Google DM Sans font into bwip-js FontLib engine
try {
  bwipjs.loadFont('DMSANS', DM_SANS_BASE64);
} catch (e) {
  console.warn('Failed to load DM Sans into bwip-js:', e);
}

/**
 * Format hex color string by stripping '#' as required by bwip-js
 */
function cleanHex(color?: string | null): string | undefined {
  if (!color || color === 'transparent') return undefined;
  return color.replace(/^#/, '');
}

export const EAN_UPC_SET = new Set([
  'ean13', 'ean8', 'ean5', 'ean2', 'upca', 'upce', 'isbn', 'ismn', 'issn'
]);

export function isEanUpcSymbology(bcid: string): boolean {
  return EAN_UPC_SET.has(bcid?.toLowerCase());
}

/**
 * Resolve font name to bwip-js registered font
 */
function resolveFont(fontName?: string, bcid?: string): string {
  const isEan = bcid ? isEanUpcSymbology(bcid) : false;
  if (!fontName) return isEan ? 'OCR-B' : 'OCR-B';
  const norm = fontName.toLowerCase().replace(/[\s-_]/g, '');
  if (norm.includes('ocrb')) return 'OCR-B';
  if (norm.includes('ocra')) return 'OCR-A';
  if (norm.includes('dmsans')) return 'DMSANS';
  if (norm.includes('helvetica') || norm.includes('inter')) return 'Helvetica';
  if (norm.includes('courier')) return 'Courier';
  if (norm.includes('inconsolata') || norm.includes('mono')) return 'Inconsolata';
  return isEan ? 'OCR-B' : 'OCR-B';
}

/**
 * Builds bwip-js options strictly respecting GS1 / ISO 15420 pocket specs
 */
export function buildBwipOptions(options: BarcodeRenderOptions): any {
  const isEan = isEanUpcSymbology(options.bcid);
  const cleanBarColor = cleanHex(options.barcolor) || '000000';
  const cleanBgColor = cleanHex(options.backgroundcolor);

  const bwipOpts: any = {
    bcid: options.bcid,
    text: options.text,
    scale: options.scale || 3,
    height: options.height || 15,
    includetext: !!options.includetext,
    barcolor: cleanBarColor,
    rotate: options.rotate || 'N',
    padding: typeof options.padding === 'number' ? options.padding : 10,
    ...options.extraOptions,
  };

  if (cleanBgColor) {
    bwipOpts.backgroundcolor = cleanBgColor;
  }

  if (options.includetext) {
    const font = resolveFont(options.textfont, options.bcid);
    bwipOpts.textfont = font;

    if (isEan) {
      // For EAN/UPC barcodes:
      // 1. NEVER pass textxalign. BWIPP natively positions quiet zone digits and dual lower pockets.
      // 2. Only override textsize if explicitly altered from the standard 8.5
      if (options.textsize && options.textsize !== 8.5) {
        bwipOpts.textsize = options.textsize;
      }
    } else {
      // For linear symbologies (Code-128, Code-39, etc.):
      if (options.textsize) {
        bwipOpts.textsize = options.textsize;
      }
      // bwip-js natively centers text. Only pass textxalign if explicitly 'left' or 'right'.
      if (options.textxalign && options.textxalign !== 'center') {
        bwipOpts.textxalign = options.textxalign;
      }
      // Comfortable vertical breathing room for DM Sans so ascenders never touch bars
      if (font === 'DMSANS') {
        bwipOpts.textyoffset = -2;
      }
    }
  }

  return bwipOpts;
}

/**
 * Renders a barcode to an existing HTMLCanvasElement.
 */
export function renderToCanvas(
  canvas: HTMLCanvasElement,
  options: BarcodeRenderOptions
): void {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  const isEan = isEanUpcSymbology(options.bcid);
  if (!options.includetext && isEan) {
    // Preserve authentic ISO/GS1 guard bars & pockets without drawing numbers
    const drawing = (bwipjs as any).drawingCanvas(canvas);
    drawing.text = function() {};
    const bwipOptions = buildBwipOptions({
      ...options,
      includetext: true,
    });
    bwipjs.render(bwipOptions, drawing);
  } else {
    const bwipOptions = buildBwipOptions(options);
    bwipjs.toCanvas(canvas, bwipOptions);
  }
}

/**
 * Generates an SVG string representation of the barcode with exact standard positioning.
 */
export function renderToSvg(options: BarcodeRenderOptions): string {
  const isEan = isEanUpcSymbology(options.bcid);
  let rawSvg: string;

  if (!options.includetext && isEan) {
    // Preserve authentic ISO/GS1 guard bars & pockets without drawing text paths
    const drawing = (bwipjs as any).drawingSVG();
    drawing.text = function() {};
    const bwipOptions = buildBwipOptions({
      ...options,
      includetext: true,
    });
    bwipjs.render(bwipOptions, drawing);
    rawSvg = drawing.end();
  } else {
    const bwipOptions = buildBwipOptions(options);
    rawSvg = bwipjs.toSVG(bwipOptions);
  }

  // Extract dimensions from viewBox to guarantee explicit SVG width and height
  const vbMatch = rawSvg.match(/viewBox="0 0 ([\d\.]+) ([\d\.]+)"/);
  if (!vbMatch) return rawSvg;

  const origWidth = Math.round(parseFloat(vbMatch[1]));
  const origHeight = Math.round(parseFloat(vbMatch[2]));

  let finalSvg = rawSvg.replace(
    '<svg',
    `<svg width="${origWidth}" height="${origHeight}" style="max-width: 100%; height: auto;"`
  );

  return finalSvg;
}

/**
 * Generates an off-screen high-resolution PNG Blob (transparent or solid).
 */
export async function generatePngBlob(
  options: BarcodeRenderOptions,
  resolutionMultiplier: number = 1
): Promise<Blob> {
  const offscreenCanvas = document.createElement('canvas');
  const targetScale = (options.scale || 3) * resolutionMultiplier;

  renderToCanvas(offscreenCanvas, {
    ...options,
    scale: targetScale,
  });

  return new Promise<Blob>((resolve, reject) => {
    offscreenCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate PNG blob from canvas.'));
        }
      },
      'image/png'
    );
  });
}

/**
 * Downloads the barcode as PNG (transparent or solid) or SVG.
 */
export async function downloadBarcode(
  options: BarcodeRenderOptions,
  format: 'png' | 'svg',
  isTransparent: boolean = true,
  resolutionMultiplier: number = 1,
  customFileName?: string
): Promise<void> {
  const baseName = customFileName
    ? customFileName.replace(/\.[^/.]+$/, '')
    : `barcode_${options.bcid}_${isTransparent ? 'transparent' : 'solid'}`;

  if (format === 'svg') {
    const svgContent = renderToSvg({
      ...options,
      backgroundcolor: isTransparent ? null : options.backgroundcolor || 'ffffff',
    });
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    saveAs(blob, `${baseName}.svg`);
  } else {
    const blob = await generatePngBlob(
      {
        ...options,
        backgroundcolor: isTransparent ? null : options.backgroundcolor || 'ffffff',
      },
      resolutionMultiplier
    );
    saveAs(blob, `${baseName}.png`);
  }
}

/**
 * Copies the transparent or solid PNG directly to system clipboard.
 */
export async function copyBarcodeToClipboard(
  options: BarcodeRenderOptions,
  isTransparent: boolean = true
): Promise<boolean> {
  try {
    const blob = await generatePngBlob(
      {
        ...options,
        backgroundcolor: isTransparent ? null : options.backgroundcolor || 'ffffff',
      },
      2 // High-res for clipboard
    );

    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    } else {
      throw new Error('Clipboard API not supported in this browser.');
    }
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

/**
 * Cache for symbology preview thumbnails used in the search modal
 */
const thumbnailCache = new Map<string, string>();

/**
 * Generates or retrieves a cached SVG preview thumbnail for a symbology
 */
export function getSymbologyThumbnailSvg(
  bcid: string,
  text: string,
  extraOptions?: Record<string, any>
): string {
  const cacheKey = `${bcid}_${text}`;
  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey)!;
  }

  try {
    const opts = buildBwipOptions({
      bcid,
      text,
      scale: 1,
      height: 8,
      includetext: true,
      textfont: 'OCR-B',
      barcolor: '#1e293b',
      padding: 4,
      extraOptions: bcid === 'mailmark' ? { type: '29', ...extraOptions } : extraOptions,
    });
    const svg = bwipjs.toSVG(opts);

    // Ensure thumbnail SVG has width and height attributes so it never collapses
    const vbMatch = svg.match(/viewBox="0 0 ([\d\.]+) ([\d\.]+)"/);
    const withDimensions = vbMatch 
      ? svg.replace('<svg', `<svg width="${vbMatch[1]}" height="${vbMatch[2]}" style="max-height: 52px; width: auto;"`) 
      : svg;

    thumbnailCache.set(cacheKey, withDimensions);
    return withDimensions;
  } catch {
    return '';
  }
}

/**
 * Preloads all symbology thumbnails during idle time so modal opens with 0ms delay
 */
export function preloadThumbnailCache(
  list: Array<{ bcid: string; sample: string; defaultOptions?: any }>
): void {
  if (typeof window === 'undefined') return;

  const runPreload = () => {
    for (const item of list) {
      getSymbologyThumbnailSvg(item.bcid, item.sample, item.defaultOptions);
    }
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runPreload, { timeout: 1000 });
  } else {
    setTimeout(runPreload, 100);
  }
}
