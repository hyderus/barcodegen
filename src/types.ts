import { Symbology } from './data/symbologies';

export type AppMode = 'barcode' | 'qrcode' | 'batch';

export interface BarcodeState {
  symbology: Symbology;
  text: string;
  includeText: boolean;
  textFont: string;
  textSize: number;
  textAlign: 'left' | 'center' | 'right';
  textXOffset?: number;
  textYOffset?: number;
  barColor: string;
  backgroundColor: string;
  isTransparent: boolean;
  scale: number;
  height: number;
  padding: number;
  rotate: 'N' | 'R' | 'L' | 'I';
  customFileName: string;
}

export interface QRState {
  qrType: 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'sms';
  url: string;
  text: string;
  wifi: {
    ssid: string;
    password: string;
    encryption: 'WPA' | 'WEP' | 'nopass';
    hidden: boolean;
  };
  vcard: {
    firstName: string;
    lastName: string;
    organization: string;
    phone: string;
    email: string;
    url: string;
  };
  email: {
    address: string;
    subject: string;
    body: string;
  };
  sms: {
    phone: string;
    message: string;
  };
  ecLevel: 'L' | 'M' | 'Q' | 'H';
  barColor: string;
  backgroundColor: string;
  isTransparent: boolean;
  scale: number;
  padding: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: 'barcode' | 'qrcode';
  title: string;
  bcid: string;
  text: string;
  includeText: boolean;
  isTransparent: boolean;
  dataUrl: string;
}
