import React from 'react';
import { QRState } from '../types';
import { 
  Globe, 
  FileText, 
  Wifi, 
  User, 
  Mail, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

interface QRCodeEditorProps {
  state: QRState;
  onChange: (updates: Partial<QRState>) => void;
}

const QR_TYPES = [
  { id: 'url', name: 'Website', icon: Globe },
  { id: 'text', name: 'Text', icon: FileText },
  { id: 'wifi', name: 'Wi-Fi', icon: Wifi },
  { id: 'vcard', name: 'Contact', icon: User },
  { id: 'email', name: 'Email', icon: Mail },
  { id: 'sms', name: 'SMS', icon: MessageSquare },
] as const;

const EC_LEVELS = [
  { id: 'L', name: 'Low (7%)', desc: 'Highest data capacity' },
  { id: 'M', name: 'Medium (15%)', desc: 'Standard default' },
  { id: 'Q', name: 'Quartile (25%)', desc: 'Better durability' },
  { id: 'H', name: 'High (30%)', desc: 'Best for print / scanning' },
] as const;

export const QRCodeEditor: React.FC<QRCodeEditorProps> = ({
  state,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      
      {/* 1. QR Type Selection Pills */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          QR Code Content Type
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {QR_TYPES.map((t) => {
            const Icon = t.icon;
            const isSelected = state.qrType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChange({ qrType: t.id })}
                className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/80 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 shadow-xs ring-1 ring-orange-500/50'
                    : 'border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="whitespace-nowrap">{t.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. QR Content Inputs Based on Type */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Enter QR Data
        </label>

        {/* URL Mode */}
        {state.qrType === 'url' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Target Website URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={state.url}
                onChange={(e) => onChange({ url: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="w-full pl-10 pr-12 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs transition-all"
              />
              {state.url && (
                <button
                  onClick={() => onChange({ url: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Plain Text Mode */}
        {state.qrType === 'text' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Plain Text or Message
            </label>
            <textarea
              rows={4}
              value={state.text}
              onChange={(e) => onChange({ text: e.target.value })}
              placeholder="Type any message, notes, or raw serial data..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        )}

        {/* Wi-Fi Mode */}
        {state.qrType === 'wifi' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Network Name (SSID)
              </label>
              <input
                type="text"
                value={state.wifi.ssid}
                onChange={(e) =>
                  onChange({ wifi: { ...state.wifi, ssid: e.target.value } })
                }
                placeholder="Home_WiFi"
                className="mt-1 w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                type="text"
                value={state.wifi.password}
                onChange={(e) =>
                  onChange({ wifi: { ...state.wifi, password: e.target.value } })
                }
                placeholder="Wi-Fi Password"
                className="mt-1 w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Encryption
                </label>
                <select
                  value={state.wifi.encryption}
                  onChange={(e) =>
                    onChange({
                      wifi: { ...state.wifi, encryption: e.target.value as any },
                    })
                  }
                  className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None (Open Network)</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.wifi.hidden}
                    onChange={(e) =>
                      onChange({
                        wifi: { ...state.wifi, hidden: e.target.checked },
                      })
                    }
                    className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Hidden Network</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* vCard Contact Mode */}
        {state.qrType === 'vcard' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  First Name
                </label>
                <input
                  type="text"
                  value={state.vcard.firstName}
                  onChange={(e) =>
                    onChange({ vcard: { ...state.vcard, firstName: e.target.value } })
                  }
                  placeholder="John"
                  className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Last Name
                </label>
                <input
                  type="text"
                  value={state.vcard.lastName}
                  onChange={(e) =>
                    onChange({ vcard: { ...state.vcard, lastName: e.target.value } })
                  }
                  placeholder="Doe"
                  className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Organization / Company
                </label>
                <input
                  type="text"
                  value={state.vcard.organization}
                  onChange={(e) =>
                    onChange({
                      vcard: { ...state.vcard, organization: e.target.value },
                    })
                  }
                  placeholder="Acme Corp"
                  className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={state.vcard.phone}
                  onChange={(e) =>
                    onChange({ vcard: { ...state.vcard, phone: e.target.value } })
                  }
                  placeholder="+1 (555) 000-0000"
                  className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                value={state.vcard.email}
                onChange={(e) =>
                  onChange({ vcard: { ...state.vcard, email: e.target.value } })
                }
                placeholder="john.doe@example.com"
                className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Email Mode */}
        {state.qrType === 'email' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Recipient Email
              </label>
              <input
                type="email"
                value={state.email.address}
                onChange={(e) =>
                  onChange({ email: { ...state.email, address: e.target.value } })
                }
                placeholder="contact@company.com"
                className="mt-1 w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Email Subject
              </label>
              <input
                type="text"
                value={state.email.subject}
                onChange={(e) =>
                  onChange({ email: { ...state.email, subject: e.target.value } })
                }
                placeholder="Inquiry about services"
                className="mt-1 w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Message Body
              </label>
              <textarea
                rows={2}
                value={state.email.body}
                onChange={(e) =>
                  onChange({ email: { ...state.email, body: e.target.value } })
                }
                placeholder="Hello, I would like to get more information..."
                className="mt-1 w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* SMS Mode */}
        {state.qrType === 'sms' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <input
                type="tel"
                value={state.sms.phone}
                onChange={(e) =>
                  onChange({ sms: { ...state.sms, phone: e.target.value } })
                }
                placeholder="+15551234567"
                className="mt-1 w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Pre-filled SMS Message
              </label>
              <textarea
                rows={2}
                value={state.sms.message}
                onChange={(e) =>
                  onChange({ sms: { ...state.sms, message: e.target.value } })
                }
                placeholder="START or your message"
                className="mt-1 w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Error Correction & Customization */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-1.5 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
            <span>Error Correction Level</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EC_LEVELS.map((ec) => (
              <button
                key={ec.id}
                onClick={() => onChange({ ecLevel: ec.id })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  state.ecLevel === ec.id
                    ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-bold">{ec.name}</div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">{ec.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Transparent Background Switch */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-800/40">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Transparent Background PNG</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-600 text-white font-bold">
                Alpha
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Only exports the QR modules with transparent background
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

        {/* Colors and Scale */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              QR Color
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
                className="w-20 px-2 py-1.5 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
              <span>Size / Scale</span>
              <span className="font-mono font-medium">{state.scale}x</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              value={state.scale}
              onChange={(e) => onChange({ scale: parseInt(e.target.value) })}
              className="w-full accent-orange-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
              <span>Quiet Zone</span>
              <span className="font-mono font-medium">{state.padding}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={state.padding}
              onChange={(e) => onChange({ padding: parseInt(e.target.value) })}
              className="w-full accent-orange-600 cursor-pointer"
            />
          </div>
        </div>

      </div>

    </div>
  );
};
