import bwipjs from 'bwip-js';
import { PackageLabelState } from '../types';

export const DEFAULT_PIXEL_LABEL: PackageLabelState = {
  modelName: 'Google Pixel 7a (128GB, Charcoal)',
  sku: 'GA03694-GB',
  ean: '0840244701819',
  imei1: '354487208189804',
  imei2: '354487208189812',
  eid: '89033023427100000000027633036749',
  batchCode: '4302',
  qrPayload: 'GA03694-GB;354487208189804;354487208189812;89033023427100000000027633036749',
  font: 'DM Sans',
  scale: 3, // High DPI for crisp printing
  backgroundColor: '#ffffff',
  barColor: '#000000',
  isTransparent: false,
  borderStyle: 'rounded',
};

function extractSvgInner(svgStr: string) {
  const vbMatch = svgStr.match(/viewBox="([^"]+)"/);
  const viewBox = vbMatch ? vbMatch[1] : '0 0 100 100';
  const inner = svgStr
    .replace(/<\?xml[^>]*\?>/, '')
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '');
  return { viewBox, inner };
}

function resolveFontFamily(fontName: string): string {
  const norm = fontName.toLowerCase();
  if (norm.includes('dm') || norm.includes('sans')) return "'DM Sans', sans-serif";
  if (norm.includes('ocr')) return "'OCR-B', monospace";
  if (norm.includes('mono')) return "'Inconsolata', monospace";
  return "'DM Sans', sans-serif";
}

function resolveBwipFont(fontName: string): string {
  const norm = fontName.toLowerCase();
  if (norm.includes('dm') || norm.includes('sans')) return 'DMSANS';
  if (norm.includes('ocr')) return 'OCR-B';
  return 'DMSANS';
}

/**
 * Generates an authentic 1:1 Vector SVG representation of the hardware packaging label.
 */
export function generatePackageLabelSvg(state: PackageLabelState): string {
  const bwipFont = resolveBwipFont(state.font);
  const cssFont = resolveFontFamily(state.font);
  const isTrans = state.isTransparent;
  const bgColor = isTrans ? 'none' : (state.backgroundColor || '#ffffff');
  const barColor = state.barColor || '#000000';

  // 1. EAN-13 (Top-Left)
  let eanSvgStr = '';
  try {
    eanSvgStr = bwipjs.toSVG({
      bcid: 'ean13',
      text: state.ean.replace(/\D/g, '').padEnd(12, '0').slice(0, 13),
      includetext: true,
      textfont: bwipFont,
      textsize: 8.5,
      scale: 2,
      height: 14,
      barcolor: barColor.replace('#', ''),
    });
  } catch (e) {
    console.warn('EAN SVG error:', e);
  }
  const ean = extractSvgInner(eanSvgStr || '<svg viewBox="0 0 100 50"></svg>');

  // 2. SKU Barcode (Top-Middle)
  let skuSvgStr = '';
  try {
    skuSvgStr = bwipjs.toSVG({
      bcid: 'code128',
      text: state.sku || 'SKU',
      includetext: false,
      scale: 2,
      height: 9,
      barcolor: barColor.replace('#', ''),
    });
  } catch (e) {
    console.warn('SKU SVG error:', e);
  }
  const sku = extractSvgInner(skuSvgStr || '<svg viewBox="0 0 100 50"></svg>');

  // 3. IMEI Barcode (Middle Row)
  let imeiSvgStr = '';
  try {
    imeiSvgStr = bwipjs.toSVG({
      bcid: 'code128',
      text: state.imei1.replace(/\D/g, '') || '000000000000000',
      includetext: false,
      scale: 2,
      height: 8,
      barcolor: barColor.replace('#', ''),
    });
  } catch (e) {
    console.warn('IMEI SVG error:', e);
  }
  const imei = extractSvgInner(imeiSvgStr || '<svg viewBox="0 0 100 50"></svg>');

  // 4. eID Barcode (Bottom Row)
  let eidSvgStr = '';
  try {
    eidSvgStr = bwipjs.toSVG({
      bcid: 'code128',
      text: state.eid.replace(/\D/g, '') || '00000000000000000000000000000000',
      includetext: false,
      scale: 2,
      height: 8,
      barcolor: barColor.replace('#', ''),
    });
  } catch (e) {
    console.warn('eID SVG error:', e);
  }
  const eid = extractSvgInner(eidSvgStr || '<svg viewBox="0 0 100 50"></svg>');

  // 5. QR Code (Right Side)
  let qrSvgStr = '';
  try {
    qrSvgStr = bwipjs.toSVG({
      bcid: 'qrcode',
      text: state.qrPayload || `${state.sku};${state.imei1};${state.imei2};${state.eid}`,
      scale: 2,
      barcolor: barColor.replace('#', ''),
    });
  } catch (e) {
    console.warn('QR SVG error:', e);
  }
  const qr = extractSvgInner(qrSvgStr || '<svg viewBox="0 0 100 100"></svg>');

  const rx = state.borderStyle === 'rounded' ? 14 : state.borderStyle === 'square' ? 0 : 0;
  const strokeColor = state.borderStyle === 'none' || isTrans ? 'none' : '#cbd5e1';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 350" width="1024" height="350">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&amp;display=swap');
      .pkg-text { font-family: ${cssFont}; fill: ${barColor}; }
      .pkg-batch { font-family: ${cssFont}; font-weight: 700; font-size: 16.5px; fill: #475569; letter-spacing: 0.5px; }
      .pkg-sku { font-family: ${cssFont}; font-weight: 700; font-size: 15px; fill: ${barColor}; letter-spacing: 0.5px; }
      .pkg-info { font-family: ${cssFont}; font-weight: 700; font-size: 15px; fill: ${barColor}; letter-spacing: 0.25px; }
    </style>
  </defs>

  <!-- Label background & border -->
  <rect x="1" y="1" width="1022" height="348" rx="${rx}" fill="${bgColor}" stroke="${strokeColor}" stroke-width="1.5" />

  <!-- TOP-LEFT: EAN-13 (Guard Bars + Pockets) -->
  <svg x="22" y="20" width="290" height="84" viewBox="${ean.viewBox}" preserveAspectRatio="xMidYMid meet">
    ${ean.inner}
  </svg>

  <!-- TOP-MIDDLE: SKU Barcode & Label -->
  <svg x="370" y="24" width="265" height="42" viewBox="${sku.viewBox}" preserveAspectRatio="none">
    ${sku.inner}
  </svg>
  <text x="502" y="86" text-anchor="middle" class="pkg-sku">SKU: ${state.sku}</text>

  <!-- TOP-RIGHT: Factory Batch Code -->
  <text x="888" y="52" text-anchor="middle" class="pkg-batch">${state.batchCode || '4302'}</text>

  <!-- RIGHT: 2D QR Code -->
  <svg x="808" y="78" width="160" height="160" viewBox="${qr.viewBox}" preserveAspectRatio="xMidYMid meet">
    ${qr.inner}
  </svg>

  <!-- MIDDLE: IMEI Barcode & Dual IMEI Labels -->
  <svg x="22" y="112" width="745" height="44" viewBox="${imei.viewBox}" preserveAspectRatio="none">
    ${imei.inner}
  </svg>
  <text x="25" y="180" text-anchor="start" class="pkg-info">IMEI1: ${state.imei1} / IMEI2:${state.imei2}</text>

  <!-- BOTTOM: eID Barcode & 32-Digit eSIM Label -->
  <svg x="22" y="200" width="745" height="44" viewBox="${eid.viewBox}" preserveAspectRatio="none">
    ${eid.inner}
  </svg>
  <text x="25" y="268" text-anchor="start" class="pkg-info">eID: ${state.eid}</text>
</svg>`;
}

/**
 * Renders the packaging label onto an HTMLCanvasElement with crisp retina DPR scaling.
 */
export function renderPackageLabelToCanvas(
  canvas: HTMLCanvasElement,
  state: PackageLabelState
): void {
  const dpr = state.scale || 2;
  const baseW = 1024;
  const baseH = 350;

  canvas.width = baseW * dpr;
  canvas.height = baseH * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, baseW, baseH);

  // Background
  const isTrans = state.isTransparent;
  const bgColor = isTrans ? 'rgba(0,0,0,0)' : (state.backgroundColor || '#ffffff');
  const barColor = state.barColor || '#000000';
  const rx = state.borderStyle === 'rounded' ? 14 : 0;

  if (!isTrans) {
    ctx.fillStyle = bgColor;
    if (rx > 0 && ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(1, 1, baseW - 2, baseH - 2, rx);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, baseW, baseH);
    }
  }

  // Border
  if (state.borderStyle !== 'none' && !isTrans) {
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    if (rx > 0 && ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(1, 1, baseW - 2, baseH - 2, rx);
      ctx.stroke();
    } else {
      ctx.strokeRect(1, 1, baseW - 2, baseH - 2);
    }
  }

  const bwipFont = resolveBwipFont(state.font);
  const cssFont = resolveFontFamily(state.font);

  // 1. EAN-13
  const eanCanvas = document.createElement('canvas');
  try {
    bwipjs.toCanvas(eanCanvas, {
      bcid: 'ean13',
      text: state.ean.replace(/\D/g, '').padEnd(12, '0').slice(0, 13),
      includetext: true,
      textfont: bwipFont,
      textsize: 8.5,
      scale: 2,
      height: 14,
      barcolor: barColor.replace('#', ''),
    });
    ctx.drawImage(eanCanvas, 22, 20, 290, 84);
  } catch (e) {
    console.warn('Canvas EAN error:', e);
  }

  // 2. SKU Barcode
  const skuCanvas = document.createElement('canvas');
  try {
    bwipjs.toCanvas(skuCanvas, {
      bcid: 'code128',
      text: state.sku || 'SKU',
      includetext: false,
      scale: 2,
      height: 9,
      barcolor: barColor.replace('#', ''),
    });
    ctx.drawImage(skuCanvas, 370, 24, 265, 42);
  } catch (e) {
    console.warn('Canvas SKU error:', e);
  }

  // SKU Text
  ctx.fillStyle = barColor;
  ctx.font = `bold 15px ${cssFont}`;
  ctx.textAlign = 'center';
  ctx.fillText(`SKU: ${state.sku}`, 502, 86);

  // 3. Batch Code
  ctx.fillStyle = '#475569';
  ctx.font = `bold 16.5px ${cssFont}`;
  ctx.textAlign = 'center';
  ctx.fillText(state.batchCode || '4302', 888, 52);

  // 4. QR Code
  const qrCanvas = document.createElement('canvas');
  try {
    bwipjs.toCanvas(qrCanvas, {
      bcid: 'qrcode',
      text: state.qrPayload || `${state.sku};${state.imei1};${state.imei2};${state.eid}`,
      scale: 2,
      barcolor: barColor.replace('#', ''),
    });
    ctx.drawImage(qrCanvas, 808, 78, 160, 160);
  } catch (e) {
    console.warn('Canvas QR error:', e);
  }

  // 5. IMEI Barcode
  const imeiCanvas = document.createElement('canvas');
  try {
    bwipjs.toCanvas(imeiCanvas, {
      bcid: 'code128',
      text: state.imei1.replace(/\D/g, '') || '000000000000000',
      includetext: false,
      scale: 2,
      height: 8,
      barcolor: barColor.replace('#', ''),
    });
    ctx.drawImage(imeiCanvas, 22, 112, 745, 44);
  } catch (e) {
    console.warn('Canvas IMEI error:', e);
  }

  // IMEI Text
  ctx.fillStyle = barColor;
  ctx.font = `bold 15px ${cssFont}`;
  ctx.textAlign = 'left';
  ctx.fillText(`IMEI1: ${state.imei1} / IMEI2:${state.imei2}`, 25, 180);

  // 6. eID Barcode
  const eidCanvas = document.createElement('canvas');
  try {
    bwipjs.toCanvas(eidCanvas, {
      bcid: 'code128',
      text: state.eid.replace(/\D/g, '') || '00000000000000000000000000000000',
      includetext: false,
      scale: 2,
      height: 8,
      barcolor: barColor.replace('#', ''),
    });
    ctx.drawImage(eidCanvas, 22, 200, 745, 44);
  } catch (e) {
    console.warn('Canvas eID error:', e);
  }

  // eID Text
  ctx.fillStyle = barColor;
  ctx.font = `bold 15px ${cssFont}`;
  ctx.textAlign = 'left';
  ctx.fillText(`eID: ${state.eid}`, 25, 268);

  ctx.restore();
}
