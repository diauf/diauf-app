"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../component/Sidebar";

import {
  TrendingUp,
  Plus,
  Search,
  Pencil,
  X,
  Calendar,
  DollarSign,
  BarChart3,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

type Projection = {
  bulan: string;
  penjualan: number;
  hpp: number;
  biayaOperasional: number;
  labaBersih: number;
  arusKas: number;
  saldoKas: number;
};

type Asumsi = {
  growthRate: number; // %
  inflation: number; // %
  biayaOperasionalBase: number;
  hppRatio: number; // % dari penjualan
};

export default function ProyeksiPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "ringkasan" | "penjualan" | "keuangan" | "arus-kas"
  >("ringkasan");

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "penjualan", label: "Proyeksi Penjualan" },
    { id: "keuangan", label: "Proyeksi Laba Rugi" },
    { id: "arus-kas", label: "Proyeksi Arus Kas" },
  ] as const;

  // Asumsi dasar (bisa diedit)
  const [asumsi, setAsumsi] = useState<Asumsi>({
    growthRate: 10,
    inflation: 5,
    biayaOperasionalBase: 150000000,
    hppRatio: 65,
  });

  // Base data saat ini (demo, seolah dari penjualan aktual)
  const [baseData] = useState({
    penjualan: 850000000, // per bulan rata-rata
    hpp: 552500000,
    biayaOperasional: 150000000,
    saldoKasAwal: 320000000,
  });

  // Generated projections (12 bulan ke depan)
  const [projections, setProjections] = useState<Projection[]>([]);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [editAsumsi, setEditAsumsi] = useState(false);
  const [tempAsumsi, setTempAsumsi] = useState<Asumsi>({ ...asumsi });

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        setProfile({ name: "Admin Demo", role: "Keuangan" });
      } catch (err) {
        setProfile({ name: "Admin Demo", role: "Keuangan" });
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  // Generate projections based on asumsi
  const generateProjections = (base: any, a: Asumsi): Projection[] => {
    const result: Projection[] = [];
    let penjualan = base.penjualan;
    let biayaOp = base.biayaOperasional;
    let saldoKas = base.saldoKasAwal;

    const bulan = [
      "Jul 2026", "Agu 2026", "Sep 2026", "Okt 2026", "Nov 2026", "Des 2026",
      "Jan 2027", "Feb 2027", "Mar 2027", "Apr 2027", "Mei 2027", "Jun 2027"
    ];

    for (let i = 0; i < 12; i++) {
      // Growth
      penjualan = Math.round(penjualan * (1 + a.growthRate / 100));

      // HPP
      const hpp = Math.round(penjualan * (a.hppRatio / 100));

      // Biaya operasional naik dengan inflasi
      biayaOp = Math.round(biayaOp * (1 + a.inflation / 100));

      const labaBersih = penjualan - hpp - biayaOp;

      // Arus kas sederhana (laba + non-cash, tapi untuk demo pakai laba bersih)
      const arusKas = labaBersih;

      saldoKas = saldoKas + arusKas;

      result.push({
        bulan: bulan[i],
        penjualan,
        hpp,
        biayaOperasional: biayaOp,
        labaBersih,
        arusKas,
        saldoKas: Math.max(0, Math.round(saldoKas)),
      });
    }

    return result;
  };

  // Regenerate when asumsi changes
  useEffect(() => {
    const newProj = generateProjections(baseData, asumsi);
    setProjections(newProj);
  }, [asumsi, baseData]);

  // Filtered (for search in tables)
  const filteredProjections = projections.filter((p) =>
    p.bulan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalProjectedSales = projections.reduce((sum, p) => sum + p.penjualan, 0);
  const totalProjectedProfit = projections.reduce((sum, p) => sum + p.labaBersih, 0);
  const avgMonthlyGrowth = asumsi.growthRate;
  const endingCash = projections.length > 0 ? projections[projections.length - 1].saldoKas : 0;

  // Handlers
  const saveAsumsi = () => {
    setAsumsi({ ...tempAsumsi });
    setEditAsumsi(false);
  };

  const cancelEditAsumsi = () => {
    setTempAsumsi({ ...asumsi });
    setEditAsumsi(false);
  };

  const openEditAsumsi = () => {
    setTempAsumsi({ ...asumsi });
    setEditAsumsi(true);
  };

  // Simple "apply projection to actual" demo (e.g. update penjualan target)
  const applyProjection = (index: number) => {
    const proj = projections[index];
    alert(`Proyeksi untuk ${proj.bulan} diterapkan!\n\nPenjualan target: Rp ${proj.penjualan.toLocaleString("id-ID")}\nLaba bersih: Rp ${proj.labaBersih.toLocaleString("id-ID")}\n\n(Di real app: akan update target di Penjualan & Keuangan)`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-900">Memuat Modul Proyeksi...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentRole={profile?.role} />

      <div className={`${collapsed ? "ml-20" : "ml-72"} transition-all duration-300 p-6`}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
                <TrendingUp size={26} className="text-emerald-600" /> Modul Proyeksi
              </h1>
              <p className="mt-1 text-sm text-slate-800">
                Proyeksi keuangan, penjualan, dan arus kas 12 bulan ke depan. Didasarkan pada asumsi yang bisa disesuaikan.
              </p>
            </div>
            <button
              onClick={openEditAsumsi}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm"
            >
              <Pencil size={16} /> Ubah Asumsi
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 border-b border-slate-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-2xl transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-700 bg-white"
                  : "border-transparent text-slate-800 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search (only for tables) */}
        {(activeTab === "penjualan" || activeTab === "keuangan" || activeTab === "arus-kas") && (
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input
                type="text"
                placeholder="Cari bulan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
              />
            </div>
          </div>
        )}

        {/* RINGKASAN */}
        {activeTab === "ringkasan" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Proyeksi Penjualan (12 bulan)</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">
                  Rp {(totalProjectedSales / 1000000000).toFixed(1)}M
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Proyeksi Laba Bersih</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">
                  Rp {(totalProjectedProfit / 1000000).toFixed(0)}jt
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Rata-rata Growth Bulanan</div>
                <div className="text-3xl font-semibold text-blue-700 mt-1">+{avgMonthlyGrowth}%</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Saldo Kas Akhir Periode</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">
                  Rp {(endingCash / 1000000).toFixed(0)}jt
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                <BarChart3 size={20} /> Asumsi Saat Ini
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="border border-slate-200 rounded-2xl p-4">
                  <div className="text-slate-700">Pertumbuhan Penjualan</div>
                  <div className="text-2xl font-semibold text-slate-900 mt-1">+{asumsi.growthRate}% / bulan</div>
                </div>
                <div className="border border-slate-200 rounded-2xl p-4">
                  <div className="text-slate-700">Inflasi Biaya Operasional</div>
                  <div className="text-2xl font-semibold text-slate-900 mt-1">{asumsi.inflation}% / bulan</div>
                </div>
                <div className="border border-slate-200 rounded-2xl p-4">
                  <div className="text-slate-700">HPP Ratio</div>
                  <div className="text-2xl font-semibold text-slate-900 mt-1">{asumsi.hppRatio}%</div>
                </div>
                <div className="border border-slate-200 rounded-2xl p-4">
                  <div className="text-slate-700">Biaya Operasional Dasar</div>
                  <div className="text-2xl font-semibold text-slate-900 mt-1">
                    Rp {(asumsi.biayaOperasionalBase / 1000000).toFixed(0)}jt
                  </div>
                </div>
              </div>
              <button 
                onClick={openEditAsumsi}
                className="mt-4 text-sm text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
              >
                <Pencil size={14} /> Ubah Asumsi
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 text-slate-900">Catatan Penting</h3>
              <div className="text-sm text-slate-800 space-y-2">
                <p>• Proyeksi ini bersifat estimasi berdasarkan asumsi yang Anda atur.</p>
                <p>• Data dasar diambil dari rata-rata performa Penjualan & Kas saat ini.</p>
                <p>• Untuk proyeksi yang lebih akurat, hubungkan dengan data aktual dari modul Penjualan dan Keuangan.</p>
                <p>• Fitur "Apply ke Target" akan mengupdate target di modul terkait (coming soon).</p>
              </div>
            </div>
          </div>
        )}

        {/* PROYEKSI PENJUALAN */}
        {activeTab === "penjualan" && (
          <div>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Bulan</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Proyeksi Penjualan</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Pertumbuhan</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProjections.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-12 text-center text-slate-800">Tidak ada data.</td>
                      </tr>
                    ) : (
                      filteredProjections.map((p, index) => {
                        const prev = index > 0 ? filteredProjections[index - 1].penjualan : baseData.penjualan;
                        const growth = ((p.penjualan - prev) / prev * 100);
                        return (
                          <tr key={index} className="hover:bg-slate-50/60">
                            <td className="px-5 py-4 font-medium text-slate-900">{p.bulan}</td>
                            <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                              Rp {p.penjualan.toLocaleString("id-ID")}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className={`${growth >= 0 ? "text-emerald-700" : "text-red-700"} font-medium`}>
                                {growth >= 0 ? "+" : ""}{growth.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <button 
                                onClick={() => applyProjection(projections.indexOf(p))}
                                className="px-3 py-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition"
                              >
                                Terapkan ke Target
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PROYEKSI KEUANGAN (Laba Rugi) */}
        {activeTab === "keuangan" && (
          <div>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Bulan</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Penjualan</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">HPP</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Biaya Operasional</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-emerald-700">Laba Bersih</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProjections.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-800">Tidak ada data.</td>
                      </tr>
                    ) : (
                      filteredProjections.map((p, index) => {
                        const margin = p.penjualan > 0 ? (p.labaBersih / p.penjualan * 100) : 0;
                        return (
                          <tr key={index} className="hover:bg-slate-50/60">
                            <td className="px-5 py-4 font-medium text-slate-900">{p.bulan}</td>
                            <td className="px-5 py-4 text-right text-slate-900">Rp {p.penjualan.toLocaleString("id-ID")}</td>
                            <td className="px-5 py-4 text-right text-red-700">Rp {p.hpp.toLocaleString("id-ID")}</td>
                            <td className="px-5 py-4 text-right text-red-700">Rp {p.biayaOperasional.toLocaleString("id-ID")}</td>
                            <td className="px-5 py-4 text-right font-semibold text-emerald-700">Rp {p.labaBersih.toLocaleString("id-ID")}</td>
                            <td className="px-5 py-4 text-center font-medium text-emerald-700">{margin.toFixed(1)}%</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PROYEKSI ARUS KAS */}
        {activeTab === "arus-kas" && (
          <div>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Bulan</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Arus Kas Bulanan</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-emerald-700">Saldo Kas Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProjections.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-12 text-center text-slate-800">Tidak ada data.</td>
                      </tr>
                    ) : (
                      filteredProjections.map((p, index) => (
                        <tr key={index} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-medium text-slate-900">{p.bulan}</td>
                          <td className={`px-5 py-4 text-right font-semibold ${p.arusKas >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                            {p.arusKas >= 0 ? "+" : ""}Rp {p.arusKas.toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                            Rp {p.saldoKas.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              Proyeksi arus kas ini mengasumsikan laba bersih = arus kas bersih (untuk kesederhanaan demo). Di dunia nyata akan ada penyesuaian untuk depresiasi, piutang, utang, dll.
            </div>
          </div>
        )}
      </div>

      {/* Edit Asumsi Modal */}
      {editAsumsi && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">Ubah Asumsi Proyeksi</h3>
              <button onClick={cancelEditAsumsi}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Pertumbuhan Penjualan per Bulan (%)</label>
                <input 
                  type="number" 
                  value={tempAsumsi.growthRate} 
                  onChange={(e) => setTempAsumsi({ ...tempAsumsi, growthRate: parseFloat(e.target.value) || 0 })} 
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Inflasi Biaya Operasional per Bulan (%)</label>
                <input 
                  type="number" 
                  value={tempAsumsi.inflation} 
                  onChange={(e) => setTempAsumsi({ ...tempAsumsi, inflation: parseFloat(e.target.value) || 0 })} 
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">HPP Ratio (% dari Penjualan)</label>
                <input 
                  type="number" 
                  value={tempAsumsi.hppRatio} 
                  onChange={(e) => setTempAsumsi({ ...tempAsumsi, hppRatio: parseFloat(e.target.value) || 0 })} 
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Biaya Operasional Dasar (Rp / bulan)</label>
                <input 
                  type="number" 
                  value={tempAsumsi.biayaOperasionalBase} 
                  onChange={(e) => setTempAsumsi({ ...tempAsumsi, biayaOperasionalBase: parseInt(e.target.value) || 0 })} 
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" 
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={cancelEditAsumsi} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveAsumsi} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan Asumsi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
