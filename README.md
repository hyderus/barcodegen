# Barcode & QR Code Generator Studio 🚀

A modern, high-precision, web-based Barcode and QR Code generation studio built with React 18, TypeScript, Tailwind CSS, and `bwip-js`.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)

---

## ✨ Features

- **50+ Barcode Symbologies Supported**:
  - **Linear Codes**: Code 128, Code 39, Interleaved 2 of 5, Code 11, Codabar, MSI Plessey, Telepen, Pharmacode, etc.
  - **Retail & Point-of-Sale (EAN / UPC)**: EAN-13, EAN-8, UPC-A, UPC-E, EAN-14 / GS1-128, Composite Symbologies.
  - **Postal Codes**: USPS POSTNET, PLANET, Intelligent Mail (IMb), Royal Mail 4-State, Australia Post, KIX, Deutsche Post Identcode, etc.
  - **GS1 DataBar**: Omnidirectional, Stacked, Expanded, Limited, Composite variants.
  - **2D Formats**: QR Code, Micro QR Code, Data Matrix, Aztec Code, PDF417.

- **GS1 / ISO 15420 Compliant Text & Pocket Formatting**:
  - Authentic EAN-13, EAN-8, and UPC guard-bar descenders (`| |`) extending below data bars.
  - Strict pocket alignment (leading quiet-zone digit and dual cut-out pockets) with zero bar-text collision.
  - Preserves authentic guard-bar geometry even when text is toggled off.

- **Dedicated QR Code Studio**:
  - Quick presets: URL, Plain Text, Wi-Fi Network with auto-configuration, vCard Contact Card, Email, and SMS.
  - Error correction level adjustment (L, M, Q, H).

- **High-Resolution & Transparent Exports**:
  - 1-click **Transparent PNG (True Alpha Channel)** download.
  - Scalable vector **SVG** download.
  - Copy directly to system clipboard as transparent PNG.
  - Configurable resolution multipliers (1x, 2x, 3x, 4x).

- **Ultra-Smooth UX**:
  - Instant fuzzy search modal with categorized filters.
  - Real-time pre-cached SVG thumbnails for zero-lag symbology browsing.
  - Dark / Light mode auto-detection and manual toggle.
  - Batch generation and local history drawer.

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ installed

### Installation

```bash
git clone https://github.com/<your-username>/barcodegen.git
cd barcodegen
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 📄 License

MIT License.
