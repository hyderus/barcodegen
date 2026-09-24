import bwipjs from 'bwip-js';
import { saveAs } from 'file-saver';
import { DM_SANS_BASE64 } from '../assets/dmSansBase64';

export interface BarcodeRenderOptions {
  bcid: string;
  text: string;
  alttext?: string;
  scale?: number;
  height?: number;
  includetext?: boolean;
  textfont?: string;
  textsize?: number;
  textxalign?: 'left' | 'center' | 'right';
  textxoffset?: number;
  textyoffset?: number;
  textspacing?: number;
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

export const SQUARE_2D_SYMBOLOGIES = new Set([
  'qrcode',
  'datamatrix',
  'azteccode',
  'maxicode',
  'dotcode',
  'hanxin',
  'microqrcode',
  'gs1qrcode',
  'gs1datamatrix',
]);

export function isEanUpcSymbology(bcid: string): boolean {
  return EAN_UPC_SET.has(bcid?.toLowerCase());
}

export function isSquare2dSymbology(bcid: string): boolean {
  return SQUARE_2D_SYMBOLOGIES.has(bcid?.toLowerCase());
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
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

function getFontFamilyString(resolvedFont: string): string {
  switch (resolvedFont) {
    case 'DMSANS':
      return "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    case 'OCR-B':
      return "'OCR-B', 'Lucida Console', Monaco, monospace";
    case 'OCR-A':
      return "'OCR-A', monospace";
    case 'Helvetica':
      return "Helvetica, Inter, -apple-system, sans-serif";
    case 'Courier':
      return "'Courier New', Courier, monospace";
    case 'Inconsolata':
      return "'Inconsolata', monospace";
    default:
      return "'OCR-B', monospace";
  }
}

/**
 * Builds bwip-js options strictly respecting GS1 / ISO 15420 pocket specs and 2D matrix ratios
 */
export function buildBwipOptions(options: BarcodeRenderOptions): any {
  const isEan = isEanUpcSymbology(options.bcid);
  const is2DMatrix = isSquare2dSymbology(options.bcid);
  const cleanBarColor = cleanHex(options.barcolor) || '000000';
  const cleanBgColor = cleanHex(options.backgroundcolor);

  const bwipOpts: any = {
    bcid: options.bcid,
    text: options.text,
    scale: options.scale || 3,
    includetext: !!options.includetext,
    barcolor: cleanBarColor,
    rotate: options.rotate || 'N',
    padding: typeof options.padding === 'number' ? options.padding : 10,
    ...options.extraOptions,
  };

  // Only assign height for 1D linear / stacked symbologies.
  // Passing height to 2D matrix symbologies distorts their square aspect ratio.
  if (!is2DMatrix) {
    bwipOpts.height = typeof options.height === 'number' && options.height > 0 ? options.height : 15;
  }

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
    }

    if (options.alttext) {
      bwipOpts.alttext = options.alttext;
    }

    // Manual user offset control (move up/down via textyoffset, move left/right via textxoffset)
    let baseYOffset = 0;
    if (!isEan && font === 'DMSANS') {
      baseYOffset = -2; // safe baseline breathing room for DM Sans ascenders
    }
    const finalYOffset = baseYOffset + (typeof options.textyoffset === 'number' ? options.textyoffset : 0);
    if (finalYOffset !== 0) {
      bwipOpts.textyoffset = finalYOffset;
    }

    if (typeof options.textxoffset === 'number' && options.textxoffset !== 0) {
      bwipOpts.textxoffset = options.textxoffset;
    }
  }

  return bwipOpts;
}

export function drawTextWithTracking(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  align: 'left' | 'center' | 'right'
) {
  if (!spacing) {
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    return;
  }
  const anyCtx = ctx as any;
  if ('letterSpacing' in anyCtx) {
    anyCtx.letterSpacing = `${spacing}px`;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    anyCtx.letterSpacing = '0px';
    return;
  }
  let totalWidth = 0;
  const widths: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const w = ctx.measureText(text[i]).width;
    widths.push(w);
    totalWidth += w + (i < text.length - 1 ? spacing : 0);
  }
  let curX = x;
  if (align === 'center') curX = x - totalWidth / 2;
  else if (align === 'right') curX = x - totalWidth;
  for (let i = 0; i < text.length; i++) {
    ctx.textAlign = 'left';
    ctx.fillText(text[i], curX, y);
    curX += widths[i] + spacing;
  }
}

function renderUnifiedEanCanvasText(
  ctx: CanvasRenderingContext2D,
  options: BarcodeRenderOptions,
  textCalls: Array<[number, number, string, string, any]>,
  resolvedFont: string
) {
  const scale = options.scale || 3;
  const pad = typeof options.padding === 'number' ? options.padding : 10;
  const padX = pad * scale;
  const padY = pad * scale;
  const isDmSans = resolvedFont === 'DMSANS';
  const fontFamily = getFontFamilyString(resolvedFont);
  const fontWeight = isDmSans ? '700' : 'normal';
  const fontSizePx = Math.round(scale * (options.textsize || 8.5) * 1.05);
  ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;
  ctx.fillStyle = options.barcolor ? `#${cleanHex(options.barcolor)}` : '#000000';

  const xOffset = options.textxoffset || 0;
  const yOffset = options.textyoffset || 0;
  const spacing = (options.textspacing || 0) * (scale / 3);

  if (textCalls.length === 13) {
    // EAN-13: 1 outside lead digit + 6 in left pocket + 6 in right pocket
    const leadChar = textCalls[0][2];
    const leadX = textCalls[0][0] + padX + xOffset;
    const baselineY = textCalls[0][1] + padY - yOffset;

    const leftStr = textCalls.slice(1, 7).map((t) => t[2]).join('');
    const leftCenterX = (textCalls[1][0] + textCalls[6][0]) / 2 + padX + xOffset;

    const rightStr = textCalls.slice(7, 13).map((t) => t[2]).join('');
    const rightCenterX = (textCalls[7][0] + textCalls[12][0]) / 2 + padX + xOffset;

    drawTextWithTracking(ctx, leadChar, leadX, baselineY, 0, 'center');
    drawTextWithTracking(ctx, leftStr, leftCenterX, baselineY, spacing, 'center');
    drawTextWithTracking(ctx, rightStr, rightCenterX, baselineY, spacing, 'center');
  } else if (textCalls.length === 12) {
    // UPC-A: 1 outside lead + 5 left pocket + 5 right pocket + 1 outside check digit
    const leadChar = textCalls[0][2];
    const leadX = textCalls[0][0] + padX + xOffset;
    const baselineY = textCalls[0][1] + padY - yOffset;

    const leftStr = textCalls.slice(1, 6).map((t) => t[2]).join('');
    const leftCenterX = (textCalls[1][0] + textCalls[5][0]) / 2 + padX + xOffset;

    const rightStr = textCalls.slice(6, 11).map((t) => t[2]).join('');
    const rightCenterX = (textCalls[6][0] + textCalls[10][0]) / 2 + padX + xOffset;

    const checkChar = textCalls[11][2];
    const checkX = textCalls[11][0] + padX + xOffset;

    drawTextWithTracking(ctx, leadChar, leadX, baselineY, 0, 'center');
    drawTextWithTracking(ctx, leftStr, leftCenterX, baselineY, spacing, 'center');
    drawTextWithTracking(ctx, rightStr, rightCenterX, baselineY, spacing, 'center');
    drawTextWithTracking(ctx, checkChar, checkX, baselineY, 0, 'center');
  } else {
    // Fallback: draw all textCalls with tracking
    for (const call of textCalls) {
      drawTextWithTracking(ctx, call[2], call[0] + padX + xOffset, call[1] + padY - yOffset, spacing, 'center');
    }
  }
}

function renderUnifiedLinearCanvasText(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  options: BarcodeRenderOptions,
  textCalls: Array<[number, number, string, string, any]>,
  resolvedFont: string
) {
  const scale = options.scale || 3;
  const pad = typeof options.padding === 'number' ? options.padding : 10;
  const padX = pad * scale;
  const padY = pad * scale;
  const isDmSans = resolvedFont === 'DMSANS';
  const fontFamily = getFontFamilyString(resolvedFont);
  const fontWeight = isDmSans ? '700' : 'normal';
  const fontObj = textCalls[0]?.[4];
  const fontSizePx = options.textsize
    ? Math.round(options.textsize * scale)
    : (fontObj?.height || Math.round(10 * scale));

  ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;
  ctx.fillStyle = options.barcolor ? `#${cleanHex(options.barcolor)}` : '#000000';

  const xOffset = options.textxoffset || 0;
  const yOffset = options.textyoffset || 0;
  const spacing = (options.textspacing || 0) * (scale / 3);

  if (textCalls.length === 1) {
    const textStr = textCalls[0][2];
    const rawY = textCalls[0][1];
    const baselineY = rawY + padY - yOffset;

    let targetX = canvas.width / 2 + xOffset;
    let align: 'left' | 'center' | 'right' = 'center';

    if (options.textxalign === 'left') {
      targetX = padX + xOffset;
      align = 'left';
    } else if (options.textxalign === 'right') {
      targetX = canvas.width - padX + xOffset;
      align = 'right';
    }

    drawTextWithTracking(ctx, textStr, targetX, baselineY, spacing, align);
  } else {
    for (const call of textCalls) {
      const callX = call[0] + padX + xOffset;
      const callY = call[1] + padY - yOffset;
      drawTextWithTracking(ctx, call[2], callX, callY, spacing, 'left');
    }
  }
}

/**
 * Renders a barcode to an existing HTMLCanvasElement with unified pocket typography and text spacing.
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
  const is2DMatrix = isSquare2dSymbology(options.bcid);
  const resolvedFont = resolveFont(options.textfont, options.bcid);

  if (is2DMatrix || !options.includetext) {
    if (!options.includetext && isEan) {
      // Preserve authentic ISO/GS1 guard bars & pockets without drawing numbers
      const drawing = (bwipjs as any).drawingCanvas(canvas);
      drawing.text = function() {};
      const bwipOptions = buildBwipOptions({
        ...options,
        includetext: true,
      });
      bwipjs.render(bwipOptions, drawing);
      if (typeof drawing.end === 'function') drawing.end();
    } else {
      const bwipOptions = buildBwipOptions(options);
      bwipjs.toCanvas(canvas, bwipOptions);
    }
    return;
  }

  // Intercept monospaced fixed-slot text to render cohesive grouped pocket numbers or custom linear tracking
  const textCalls: Array<[number, number, string, string, any]> = [];
  const drawing = (bwipjs as any).drawingCanvas(canvas);
  drawing.text = function(...args: any[]) {
    textCalls.push(args as any);
  };
  const bwipOptions = buildBwipOptions({
    ...options,
    includetext: true,
  });
  bwipjs.render(bwipOptions, drawing);
  if (typeof drawing.end === 'function') drawing.end();

  if (ctx && textCalls.length > 0) {
    if (isEan) {
      renderUnifiedEanCanvasText(ctx, options, textCalls, resolvedFont);
    } else {
      renderUnifiedLinearCanvasText(ctx, canvas, options, textCalls, resolvedFont);
    }
  }
}

/**
 * Generates an SVG string representation of the barcode with exact standard positioning.
 */
export function renderToSvg(options: BarcodeRenderOptions): string {
  const isEan = isEanUpcSymbology(options.bcid);
  const is2DMatrix = isSquare2dSymbology(options.bcid);
  const resolvedFont = resolveFont(options.textfont, options.bcid);

  let rawSvg: string;

  if (is2DMatrix || !options.includetext) {
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
  } else {
    // Intercept text calls to render custom typography, DM Sans, and letter tracking
    const textCalls: Array<[number, number, string, string, any]> = [];
    const drawing = (bwipjs as any).drawingSVG();
    drawing.text = function(...args: any[]) {
      textCalls.push(args as any);
    };
    const bwipOptions = buildBwipOptions({
      ...options,
      includetext: true,
    });
    bwipjs.render(bwipOptions, drawing);
    rawSvg = drawing.end();

    if (textCalls.length > 0) {
      const scale = options.scale || 3;
      const pad = typeof options.padding === 'number' ? options.padding : 10;
      const padX = pad * scale;
      const padY = pad * scale;
      const isDmSans = resolvedFont === 'DMSANS';
      const fontFamily = getFontFamilyString(resolvedFont);
      const fontWeight = isDmSans ? '700' : 'normal';
      const barColor = options.barcolor ? `#${cleanHex(options.barcolor)}` : '#000000';
      const xOffset = options.textxoffset || 0;
      const yOffset = options.textyoffset || 0;
      const spacingPx = ((options.textspacing || 0) * (scale / 3)).toFixed(2);

      // Extract viewBox dimensions to compute bounds
      const vbMatchTemp = rawSvg.match(/viewBox="0 0 ([\d\.]+) ([\d\.]+)"/);
      const vbWidth = vbMatchTemp ? parseFloat(vbMatchTemp[1]) : 300;

      let textSvgNodes = '';

      if (isEan && textCalls.length === 13) {
        // EAN-13
        const fontSizePx = Math.round(scale * (options.textsize || 8.5) * 1.05);
        const leadChar = textCalls[0][2];
        const leadX = (textCalls[0][0] + padX + xOffset).toFixed(2);
        const baselineY = (textCalls[0][1] + padY - yOffset).toFixed(2);
        const leftStr = textCalls.slice(1, 7).map((t) => t[2]).join('');
        const leftCenterX = ((textCalls[1][0] + textCalls[6][0]) / 2 + padX + xOffset).toFixed(2);
        const rightStr = textCalls.slice(7, 13).map((t) => t[2]).join('');
        const rightCenterX = ((textCalls[7][0] + textCalls[12][0]) / 2 + padX + xOffset).toFixed(2);

        textSvgNodes = `
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&amp;display=swap');
      .svg-barcode-num {
        font-family: ${fontFamily};
        font-weight: ${fontWeight};
        font-size: ${fontSizePx}px;
        fill: ${barColor};
      }
    </style>
  </defs>
  <text x="${leadX}" y="${baselineY}" text-anchor="middle" class="svg-barcode-num">${escapeXml(leadChar)}</text>
  <text x="${leftCenterX}" y="${baselineY}" text-anchor="middle" class="svg-barcode-num" letter-spacing="${spacingPx}px">${escapeXml(leftStr)}</text>
  <text x="${rightCenterX}" y="${baselineY}" text-anchor="middle" class="svg-barcode-num" letter-spacing="${spacingPx}px">${escapeXml(rightStr)}</text>`;
      } else if (isEan && textCalls.length === 12) {
        // UPC-A
        const fontSizePx = Math.round(scale * (options.textsize || 8.5) * 1.05);
        const leadChar = textCalls[0][2];
        const leadX = (textCalls[0][0] + padX + xOffset).toFixed(2);
        const baselineY = (textCalls[0][1] + padY - yOffset).toFixed(2);
        const leftStr = textCalls.slice(1, 6).map((t) => t[2]).join('');
        const leftCenterX = ((textCalls[1][0] + textCalls[5][0]) / 2 + padX + xOffset).toFixed(2);
        const rightStr = textCalls.slice(6, 11).map((t) => t[2]).join('');
        const rightCenterX = ((textCalls[6][0] + textCalls[10][0]) / 2 + padX + xOffset).toFixed(2);
        const checkChar = textCalls[11][2];
        const checkX = (textCalls[11][0] + padX + xOffset).toFixed(2);

        textSvgNodes = `
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&amp;display=swap');
      .svg-barcode-num {
        font-family: ${fontFamily};
        font-weight: ${fontWeight};
        font-size: ${fontSizePx}px;
        fill: ${barColor};
      }
    </style>
  </defs>
  <text x="${leadX}" y="${baselineY}" text-anchor="middle" class="svg-barcode-num">${escapeXml(leadChar)}</text>
  <text x="${leftCenterX}" y="${baselineY}" text-anchor="middle" class="svg-barcode-num" letter-spacing="${spacingPx}px">${escapeXml(leftStr)}</text>
  <text x="${rightCenterX}" y="${baselineY}" text-anchor="middle" class="svg-barcode-num" letter-spacing="${spacingPx}px">${escapeXml(rightStr)}</text>
  <text x="${checkX}" y="${baselineY}" text-anchor="middle" class="svg-barcode-num">${escapeXml(checkChar)}</text>`;
      } else if (textCalls.length === 1) {
        // Single linear barcode text line (Code-128, Code-39, ITF-14, Codabar, etc.)
        const fontObj = textCalls[0][4];
        const fontSizePx = options.textsize
          ? Math.round(options.textsize * scale)
          : (fontObj?.height || Math.round(10 * scale));
        const textStr = textCalls[0][2];
        const rawY = textCalls[0][1];
        const baselineY = (rawY + padY - yOffset).toFixed(2);

        let targetX = (vbWidth / 2 + xOffset).toFixed(2);
        let anchor = 'middle';
        if (options.textxalign === 'left') {
          targetX = (padX + xOffset).toFixed(2);
          anchor = 'start';
        } else if (options.textxalign === 'right') {
          targetX = (vbWidth - padX + xOffset).toFixed(2);
          anchor = 'end';
        }

        textSvgNodes = `
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&amp;display=swap');
      .svg-barcode-num {
        font-family: ${fontFamily};
        font-weight: ${fontWeight};
        font-size: ${fontSizePx}px;
        fill: ${barColor};
      }
    </style>
  </defs>
  <text x="${targetX}" y="${baselineY}" text-anchor="${anchor}" class="svg-barcode-num" letter-spacing="${spacingPx}px">${escapeXml(textStr)}</text>`;
      } else {
        // Multi-line / fallback linear barcode text
        const fontSizePx = options.textsize
          ? Math.round(options.textsize * scale)
          : (textCalls[0][4]?.height || Math.round(10 * scale));
        let nodes = '';
        for (const call of textCalls) {
          const callX = (call[0] + padX + xOffset).toFixed(2);
          const callY = (call[1] + padY - yOffset).toFixed(2);
          nodes += `<text x="${callX}" y="${callY}" text-anchor="start" class="svg-barcode-num" letter-spacing="${spacingPx}px">${escapeXml(call[2])}</text>\n`;
        }
        textSvgNodes = `
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&amp;display=swap');
      .svg-barcode-num {
        font-family: ${fontFamily};
        font-weight: ${fontWeight};
        font-size: ${fontSizePx}px;
        fill: ${barColor};
      }
    </style>
  </defs>
  ${nodes}`;
      }

      if (textSvgNodes) {
        rawSvg = rawSvg.replace('</svg>', `${textSvgNodes}\n</svg>`);
      }
    }
  }

  // Extract dimensions from viewBox to guarantee explicit SVG width and height
  const vbMatch = rawSvg.match(/viewBox="0 0 ([\d\.]+) ([\d\.]+)"/);
  if (!vbMatch) return rawSvg;

  const origWidth = Math.round(parseFloat(vbMatch[1]));
  const origHeight = Math.round(parseFloat(vbMatch[2]));

  let finalSvg = rawSvg.replace(
    '<svg',
    `<svg width="${origWidth}" height="${origHeight}" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; height: auto;"`
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
