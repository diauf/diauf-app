"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  ExternalLink, 
  Upload, 
  Palette, 
  CreditCard, 
  Truck, 
  Save, 
  CheckCircle 
} from "lucide-react";

export default function DiaufGoPage() {
  // Config states
  const [storeName, setStoreName] = useState("TOKO SASA");
  const [themeColor, setThemeColor] = useState("#041833");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([
    "Transfer Bank", "COD (Bayar di Tempat)", "E-Wallet (OVO/GoPay)"
  ]);
  const [shippingMethods, setShippingMethods] = useState<string[]>([
    "JNE", "J&T Express", "SiCepat", "GoSend"
  ]);

  const [saveMessage, setSaveMessage] = useState("");

  // Load saved config from localStorage (for sharing with the actual store)
  useEffect(() => {
    const saved = localStorage.getItem('diauf_go_config');
    if (saved) {
      try {
        const cfg = JSON.parse(saved);
        if (cfg.storeName) setStoreName(cfg.storeName);
        if (cfg.themeColor) setThemeColor(cfg.themeColor);
        if (cfg.logoUrl) setLogoUrl(cfg.logoUrl);
        if (cfg.paymentMethods) setPaymentMethods(cfg.paymentMethods);
        if (cfg.shippingMethods) setShippingMethods(cfg.shippingMethods);
      } catch {}
    }
  }, []);

  // Available options
  const availablePayments = [
    "Transfer Bank", 
    "COD (Bayar di Tempat)", 
    "E-Wallet (OVO/GoPay)", 
    "Kartu Kredit/Debit"
  ];
  const availableShippings = [
    "JNE", "J&T Express", "SiCepat", "GoSend", "Ninja Van"
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

  const togglePayment = (method: string) => {
    setPaymentMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const toggleShipping = (method: string) => {
    setShippingMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const handleSave = () => {
    const config = {storeName, themeColor, logoUrl, paymentMethods, shippingMethods};
    localStorage.setItem('diauf_go_config', JSON.stringify(config));
    setSaveMessage("Pengaturan berhasil disimpan! (demo)");
    setTimeout(() => setSaveMessage(""), 2500);
    // In real app: save to backend / DIAUF.ID
  };

  // Preview header style based on config
  const previewHeaderStyle = {
    backgroundColor: themeColor,
    color: "#ffffff",
  };

  const storeInitials = storeName
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation - Navy Theme */}
      <nav className="bg-[#041833] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">DG</span>
              </div>
              <div>
                <div className="font-bold text-xl tracking-tight">DIAUF Go</div>
                <div className="text-[10px] text-slate-400 -mt-1">DIAUF-GO.ID</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/penjualan" 
              className="text-sm px-4 py-2 rounded-xl border border-white/30 hover:bg-white/10 transition flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Kembali ke Pesanan Penjualan
            </Link>

            <Link 
              href="/penjualan" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 rounded-xl bg-white text-[#041833] hover:bg-emerald-100 transition flex items-center gap-2 font-medium"
            >
              <ExternalLink size={16} />
              Buka Portal Penjualan
            </Link>

            <Link 
              href="/diauf-go/toko" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition flex items-center gap-2 font-medium"
            >
              <ExternalLink size={16} />
              Buka Toko (Portal Pelanggan)
            </Link>

            <div className="text-xs text-emerald-400 px-2">
              Setelah simpan pengaturan, buka toko untuk coba belanja
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-medium">
                TS
              </div>
              <span>TOKO SASA • Admin</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
              PORTAL PENJUALAN
            </div>
            <h1 className="text-4xl font-bold tracking-tighter text-[#041833] mb-2">
              DIAUF-GO.ID
            </h1>
            <p className="text-lg text-slate-600">
              Atur tema dan pengaturan portal penjualan Anda. 
              Klien dapat mengakses toko online dengan branding sendiri.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* LIVE PREVIEW */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-xl text-slate-900">Preview Header Toko</h2>
              <span className="text-xs text-slate-500">Tampilan di portal pelanggan</span>
            </div>

            {/* Mock Store Header - as specified: pojok kanan atas logo + nama + by DIAUF-GO.ID */}
            <div 
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
              style={{ borderColor: themeColor }}
            >
              <div className="flex items-start justify-between">
                {/* Left: Logo + Store Info (pojok kanan atas as per example) */}
                <div className="flex items-center gap-4">
                  {/* Logo area */}
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border-2"
                    style={{ borderColor: themeColor }}
                  >
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Toko" className="w-full h-full object-cover" />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: themeColor }}
                      >
                        {storeInitials}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="font-bold text-2xl tracking-tight" style={{ color: themeColor }}>
                      {storeName}
                    </div>
                    <div className="text-xs text-slate-500 -mt-1">
                      by DIAUF-GO.ID
                    </div>
                  </div>
                </div>

                {/* Right side mock actions */}
                <div className="text-right text-xs text-slate-400">
                  <div>Belanja Online</div>
                  <div className="text-emerald-600 font-medium">Buka Toko →</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t text-xs text-slate-500">
                Contoh tampilan header di portal pelanggan Anda (akan update otomatis saat disimpan).
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              * Preview ini mencerminkan tampilan yang akan dilihat pelanggan di DIAUF-GO.ID
            </div>
          </div>

          {/* SETTINGS FORM */}
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-xl text-slate-900 mb-1">Pengaturan Portal Penjualan</h2>
              <p className="text-sm text-slate-600">Atur branding toko Anda. Perubahan akan langsung terlihat di preview.</p>
            </div>

            {/* Store Info */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4 text-[#041833]">
                <Palette size={18} />
                <span className="font-semibold">Informasi Toko</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Toko</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#041833]"
                    placeholder="Contoh: TOKO SASA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tema Warna Utama</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-12 h-10 border border-slate-300 rounded-xl cursor-pointer"
                    />
                    <div className="text-sm text-slate-600 font-mono">{themeColor}</div>
                    <div className="flex gap-2 ml-2">
                      {["#041833", "#10b981", "#3b82f6", "#f59e0b", "#ef4444"].map((c) => (
                        <button
                          key={c}
                          onClick={() => setThemeColor(c)}
                          className="w-6 h-6 rounded-full border border-slate-200"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Warna ini akan digunakan untuk header, tombol, dan aksen di portal pelanggan.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Logo Toko</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-2xl text-sm hover:bg-slate-50 transition">
                      <Upload size={16} />
                      Upload Logo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                      />
                    </label>
                    {logoUrl && (
                      <button 
                        onClick={() => setLogoUrl(null)} 
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Rekomendasi: PNG transparan, ukuran 200x200 px. (Demo hanya)</p>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4 text-[#041833]">
                <CreditCard size={18} />
                <span className="font-semibold">Metode Pembayaran</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">Pilih metode yang tersedia untuk pelanggan. (Akan terhubung penuh ke DIAUF.ID nanti)</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availablePayments.map((method) => (
                  <label key={method} className="flex items-center gap-2 p-2 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={paymentMethods.includes(method)}
                      onChange={() => togglePayment(method)}
                      className="accent-[#041833]"
                    />
                    <span className="text-sm">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Shipping Methods */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4 text-[#041833]">
                <Truck size={18} />
                <span className="font-semibold">Metode Pengiriman</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">Pilih kurir/ekspedisi yang didukung. (Akan terhubung penuh ke DIAUF.ID nanti)</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableShippings.map((method) => (
                  <label key={method} className="flex items-center gap-2 p-2 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={shippingMethods.includes(method)}
                      onChange={() => toggleShipping(method)}
                      className="accent-[#041833]"
                    />
                    <span className="text-sm">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold transition"
              >
                <Save size={18} /> Simpan Pengaturan
              </button>

              {saveMessage && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm">
                  <CheckCircle size={16} /> {saveMessage}
                </div>
              )}
            </div>

            <div className="text-xs text-slate-500 border-t pt-4">
              Pengaturan ini akan diterapkan di portal pelanggan DIAUF-GO.ID. 
              Integrasi penuh dengan metode pembayaran & pengiriman dari DIAUF.ID akan tersedia di update berikutnya.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-6 py-8 text-xs text-center text-slate-500 border-t mt-8">
        DIAUF-GO.ID • Platform Portal Penjualan • Terintegrasi dengan DIAUF ID
      </div>
    </div>
  );
}
