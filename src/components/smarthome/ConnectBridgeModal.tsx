'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Radio,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  Key,
  Globe,
  Trash2,
} from 'lucide-react';
import { useSmartHomeStore } from '@/stores/useSmartHomeStore';
import { Button } from '@/components/ui/Button';

interface ConnectBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectBridgeModal({ isOpen, onClose }: ConnectBridgeModalProps) {
  const { home, connectBridge, disconnectBridge, isActionLoading } = useSmartHomeStore();
  const [url, setUrl] = useState('http://homeassistant.local:8123');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!url.trim() || !token.trim()) {
      setError('Lütfen Home Assistant sunucu adresini ve erişim belirtecini giriniz.');
      return;
    }

    const res = await connectBridge(url.trim(), token.trim());
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1500);
    } else {
      setError(res.message);
    }
  };

  const handleDisconnect = async () => {
    if (confirm('Akıllı ev köprüsünü ayırmak istediğinize emin misiniz? Cihaz listesi temizlenecektir.')) {
      const res = await disconnectBridge();
      setSuccessMessage(res.message);
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1200);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/70 bg-muted/40">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Radio className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Akıllı Ev Köprüsü Bağlantısı</h2>
                <p className="text-[11px] text-muted-foreground">Home Assistant & Matter Entegrasyonu</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5 space-y-4 overflow-y-auto">
            {/* Status Card if already connected */}
            {home?.isBridgeConnected ? (
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      Home Assistant Bağlı
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    {home.deviceCount} Cihaz Senkronize
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Cihazlarınız ve odalarınız yerel Home Assistant köprüsü üzerinden gerçek zamanlı kontrol edilmektedir.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={isActionLoading}
                  className="w-full text-xs font-bold h-9"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Köprü Bağlantısını Kes
                </Button>
              </div>
            ) : (
              <form onSubmit={handleConnect} className="space-y-4">
                {/* Information Card */}
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
                    <span>Güvenli Yerel Bağlantı</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    LifeOS, cihaz markalarına tek tek bağlanmak yerine Home Assistant REST API ve Matter
                    köprüsünü kullanır. Erişim anahtarlarınız yalnızca sunucu tarafında güvenle saklanır.
                  </p>
                </div>

                {/* URL Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    <span>Home Assistant Sunucu Adresi *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="http://homeassistant.local:8123 veya IP"
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Token Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-primary" />
                      <span>Uzun Ömürlü Erişim Belirteci (Token) *</span>
                    </label>
                  </div>
                  <input
                    type="password"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3.5 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Home Assistant arayüzünde Profil ➔ Güvenlik ➔ &ldquo;Uzun Ömürlü Erişim Belirteçleri&rdquo; bölümünden oluşturabilirsiniz.
                  </p>
                </div>

                {/* Error / Success Messages */}
                {error && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Submit */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isActionLoading || !url.trim() || !token.trim()}
                    className="w-full h-11 rounded-2xl text-xs font-bold shadow-xs"
                  >
                    {isActionLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        <span>Bağlanıyor ve Senkronize Ediliyor...</span>
                      </>
                    ) : (
                      <span>Bağlantıyı Doğrula & Cihazları Getir</span>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
