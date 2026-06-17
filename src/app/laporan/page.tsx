"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "../component/Sidebar";
import {
  FileBarChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  Building2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

interface Profile {
  full_name?: string;
  role?: string;
}

interface ReportFilters {
  periode: string;
  cabang: string;
  startDate: string;
  endDate: string;
}

const formatRupiah = (num: number) => {
  return "Rp " + Math.round(num).toLocaleString("id-ID");
};

const formatNumber = (num: number) => {
  return Math.round(num).toLocaleString("id-ID");
};

// Demo base data (will be adjusted by filters)
const baseSalesData = [
  { bulan: "Jan", penjualan: 245000000, pembelian: 168000000, laba: 42000000 },
  { bulan: "Feb", penjualan: 268000000, pembelian: 175000000, laba: 51000000 },
  { bulan: "Mar", penjualan: 312000000, pembelian: 198000000, laba: 68000000 },
  { bulan: "Apr", penjualan: 289000000, pembelian: 182000000, laba: 59000000 },
  { bulan: "Mei", penjualan: 335000000, pembelian: 215000000, laba: 72000000 },
  { bulan: "Jun", penjualan: 298000000, pembelian: 191000000, laba: 63000000 },
];

const baseExpenseBreakdown = [
  { name: "HPP / COGS", value: 1128000000, color: "#0f766e" },
  { name: "Gaji & Tunjangan", value: 385000000, color: "#334155" },
  { name: "Operasional", value: 142000000, color: "#64748b" },
  { name: "Marketing", value: 98000000, color: "#14b8a6" },
  { name: "Lain-lain", value: 67000000, color: "#475569" },
];

const baseAgingPiutang = [
  { kategori: "0-30 hari", jumlah: 187500000, pelanggan: 42 },
  { kategori: "31-60 hari", jumlah: 94500000, pelanggan: 28 },
  { kategori: "61-90 hari", jumlah: 41200000, pelanggan: 15 },
  { kategori: ">90 hari", jumlah: 18300000, pelanggan: 9 },
];

const baseAgingUtang = [
  { kategori: "0-30 hari", jumlah: 134200000, supplier: 31 },
  { kategori: "31-60 hari", jumlah: 87200000, supplier: 19 },
  { kategori: "61-90 hari", jumlah: 35600000, supplier: 11 },
  { kategori: ">90 hari", jumlah: 12400000, supplier: 6 },
];

const basePnL = [
  { item: "Pendapatan Penjualan", jumlah: 1747000000, type: "revenue" },
  { item: "Pendapatan Jasa", jumlah: 128000000, type: "revenue" },
  { item: "Total Pendapatan", jumlah: 1875000000, type: "total" },
  { item: "HPP / Beban Pokok Penjualan", jumlah: 1128000000, type: "expense" },
  { item: "Laba Kotor", jumlah: 747000000, type: "subtotal" },
  { item: "Beban Operasional", jumlah: 385000000, type: "expense" },
  { item: "Beban Pemasaran", jumlah: 98000000, type: "expense" },
  { item: "Beban Administrasi", jumlah: 142000000, type: "expense" },
  { item: "Total Beban Operasional", jumlah: 625000000, type: "subtotal" },
  { item: "Laba Operasional (EBIT)", jumlah: 122000000, type: "subtotal" },
  { item: "Pendapatan Lain-lain", jumlah: 18000000, type: "revenue" },
  { item: "Beban Bunga & Pajak", jumlah: 47000000, type: "expense" },
  { item: "Laba Bersih", jumlah: 93000000, type: "profit" },
];

const baseNeraca = {
  aset: [
    { item: "Kas & Setara Kas", jumlah: 456000000 },
    { item: "Piutang Usaha", jumlah: 341200000 },
    { item: "Persediaan", jumlah: 287500000 },
    { item: "Aset Lancar Lainnya", jumlah: 92000000 },
    { item: "Total Aset Lancar", jumlah: 1176700000, isTotal: true },
    { item: "Aset Tetap (Bersih)", jumlah: 892000000 },
    { item: "Aset Tidak Lancar Lainnya", jumlah: 145000000 },
    { item: "Total Aset", jumlah: 2213700000, isGrand: true },
  ],
  liabilitasEkuitas: [
    { item: "Utang Usaha", jumlah: 269400000 },
    { item: "Utang Pajak", jumlah: 58000000 },
    { item: "Utang Jangka Pendek Lainnya", jumlah: 87000000 },
    { item: "Total Liabilitas Jangka Pendek", jumlah: 414400000, isTotal: true },
    { item: "Liabilitas Jangka Panjang", jumlah: 320000000 },
    { item: "Total Liabilitas", jumlah: 734400000, isTotal: true },
    { item: "Modal Disetor", jumlah: 1200000000 },
    { item: "Laba Ditahan", jumlah: 279300000 },
    { item: "Total Ekuitas", jumlah: 1479300000, isTotal: true },
    { item: "Total Liabilitas & Ekuitas", jumlah: 2213700000, isGrand: true },
  ],
};

const baseCashflow = [
  { kategori: "Arus Kas dari Operasional", masuk: 685000000, keluar: 498000000, net: 187000000 },
  { kategori: "Arus Kas dari Investasi", masuk: 45000000, keluar: 312000000, net: -267000000 },
  { kategori: "Arus Kas dari Pendanaan", masuk: 150000000, keluar: 85000000, net: 65000000 },
  { kategori: "Kenaikan / (Penurunan) Kas Bersih", masuk: 0, keluar: 0, net: -15000000 },
];

export default function LaporanPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ringkasan" | "laba-rugi" | "neraca" | "arus-kas" | "penjualan" | "pembelian" | "piutang-utang">("ringkasan");

  const [filters, setFilters] = useState<ReportFilters>({
    periode: "bulan-ini",
    cabang: "Semua Cabang",
    startDate: "2026-06-01",
    endDate: "2026-06-17",
  });

  // Demo dynamic data (adjusted slightly by filters for demo feel)
  const [salesTrend, setSalesTrend] = useState(baseSalesData);
  const [expenseBreakdown, setExpenseBreakdown] = useState(baseExpenseBreakdown);
  const [agingPiutang, setAgingPiutang] = useState(baseAgingPiutang);
  const [agingUtang, setAgingUtang] = useState(baseAgingUtang);
  const [pnlData, setPnlData] = useState(basePnL);
  const [neracaData, setNeracaData] = useState(baseNeraca);
  const [cashflowData, setCashflowData] = useState(baseCashflow);

  // Simple multiplier based on selected period for demo variation
  const getMultiplier = () => {
    if (filters.periode === "bulan-lalu") return 0.92;
    if (filters.periode === "kuartal-ini") return 1.12;
    if (filters.periode === "tahun-ini") return 1.35;
    return 1.0;
  };

  const applyFilters = () => {
    const mult = getMultiplier();
    const branchFactor = filters.cabang === "Semua Cabang" ? 1 : 0.38; // simulate single branch

    // Sales trend
    const newTrend = baseSalesData.map((row) => ({
      ...row,
      penjualan: Math.round(row.penjualan * mult * branchFactor),
      pembelian: Math.round(row.pembelian * mult * branchFactor),
      laba: Math.round(row.laba * mult * branchFactor),
    }));
    setSalesTrend(newTrend);

    // Expense breakdown
    const newExpenses = baseExpenseBreakdown.map((item) => ({
      ...item,
      value: Math.round(item.value * mult * branchFactor),
    }));
    setExpenseBreakdown(newExpenses);

    // Aging
    const newPiutang = baseAgingPiutang.map((item) => ({
      ...item,
      jumlah: Math.round(item.jumlah * mult * branchFactor),
    }));
    setAgingPiutang(newPiutang);

    const newUtang = baseAgingUtang.map((item) => ({
      ...item,
      jumlah: Math.round(item.jumlah * mult * branchFactor),
    }));
    setAgingUtang(newUtang);

    // P&L
    const newPnl = basePnL.map((row) => {
      if (row.type === "total" || row.type === "subtotal" || row.type === "profit") {
        return { ...row, jumlah: Math.round(row.jumlah * mult * branchFactor) };
      }
      return { ...row, jumlah: Math.round(row.jumlah * mult * branchFactor) };
    });
    setPnlData(newPnl);

    // Neraca (simplified scale)
    const newAset = baseNeraca.aset.map((row) => ({
      ...row,
      jumlah: Math.round(row.jumlah * (mult * 0.95 + 0.1) * branchFactor),
    }));
    const newLiab = baseNeraca.liabilitasEkuitas.map((row) => ({
      ...row,
      jumlah: Math.round(row.jumlah * (mult * 0.95 + 0.1) * branchFactor),
    }));
    setNeracaData({ aset: newAset as any, liabilitasEkuitas: newLiab as any });

    // Cashflow
    const newCf = baseCashflow.map((row) => ({
      ...row,
      masuk: Math.round(row.masuk * mult * branchFactor),
      keluar: Math.round(row.keluar * mult * branchFactor),
      net: Math.round(row.net * mult * branchFactor),
    }));
    setCashflowData(newCf);
  };

  // Apply filters whenever they change (demo live update)
  useEffect(() => {
    applyFilters();
  }, [filters.periode, filters.cabang]);

  // Load profile for sidebar role + display
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", user.id)
            .single();
          if (profileData) setProfile(profileData);
        }
      } catch (e) {
        // Demo fallback
        setProfile({ full_name: "Admin DIAUF", role: "master_admin" });
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      periode: "bulan-ini",
      cabang: "Semua Cabang",
      startDate: "2026-06-01",
      endDate: "2026-06-17",
    });
  };

  // Export current visible table to Excel (using xlsx)
  const exportToExcel = (title: string, rows: any[], headers: string[]) => {
    import("xlsx").then((XLSX) => {
      const dataForSheet = rows.map((r) => {
        const obj: any = {};
        headers.forEach((h, i) => {
          obj[h] = r[i] ?? r[Object.keys(r)[i]];
        });
        return obj;
      });
      const ws = XLSX.utils.json_to_sheet(dataForSheet);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan");
      XLSX.writeFile(wb, `${title.replace(/\s+/g, "_")}.xlsx`);
    });
  };

  const printReport = () => {
    window.print();
  };

  const totalPendapatan = pnlData.find((r) => r.item === "Total Pendapatan")?.jumlah || 1875000000;
  const labaBersih = pnlData.find((r) => r.item === "Laba Bersih")?.jumlah || 93000000;
  const totalPiutang = agingPiutang.reduce((sum, a) => sum + a.jumlah, 0);
  const totalUtang = agingUtang.reduce((sum, a) => sum + a.jumlah, 0);

  const tabs = [
    { id: "ringkasan", label: "Ringkasan Keuangan" },
    { id: "laba-rugi", label: "Laba Rugi" },
    { id: "neraca", label: "Neraca" },
    { id: "arus-kas", label: "Arus Kas" },
    { id: "penjualan", label: "Penjualan" },
    { id: "pembelian", label: "Pembelian" },
    { id: "piutang-utang", label: "Piutang & Utang" },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-700">Memuat Modul Laporan...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        currentRole={profile?.role}
      />

      <main
        className={`p-8 transition-all duration-300 ${collapsed ? "ml-24" : "ml-72"}`}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 flex items-center gap-3">
                <FileBarChart size={30} className="text-emerald-600" />
                Laporan
              </h1>
              <p className="mt-1 text-sm text-slate-700">
                Laporan keuangan dan operasional lengkap. Data real-time berdasarkan transaksi yang tercatat.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition text-sm font-medium"
              >
                <RefreshCw size={16} /> Reset Filter
              </button>
              <button
                onClick={printReport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition text-sm font-medium"
              >
                <Printer size={16} /> Cetak
              </button>
              <button
                onClick={() => exportToExcel("Laporan_Keuangan", pnlData, ["item", "jumlah"])}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition text-sm font-semibold"
              >
                <Download size={16} /> Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Periode</label>
              <select
                value={filters.periode}
                onChange={(e) => handleFilterChange("periode", e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="bulan-ini">Bulan Ini</option>
                <option value="bulan-lalu">Bulan Lalu</option>
                <option value="kuartal-ini">Kuartal Ini</option>
                <option value="tahun-ini">Tahun Ini</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cabang</label>
              <select
                value={filters.cabang}
                onChange={(e) => handleFilterChange("cabang", e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option>Semua Cabang</option>
                <option>Kantor Pusat</option>
                <option>Cabang Jakarta</option>
                <option>Cabang Bandung</option>
                <option>Cabang Surabaya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal Akhir</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900"
              />
            </div>
            <button
              onClick={applyFilters}
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition"
            >
              Terapkan Filter
            </button>
          </div>
        </div>

        {/* KPI Summary Cards - always visible */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="text-xs text-slate-600 font-medium">Total Pendapatan</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{formatRupiah(totalPendapatan)}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
              <ArrowUpRight size={14} /> +12.4% dari periode sebelumnya
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="text-xs text-slate-600 font-medium">Laba Bersih</div>
            <div className="mt-1 text-2xl font-semibold text-emerald-700">{formatRupiah(labaBersih)}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp size={14} /> Margin {((labaBersih / totalPendapatan) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="text-xs text-slate-600 font-medium">Total Piutang</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{formatRupiah(totalPiutang)}</div>
            <div className="mt-1 text-xs text-amber-600">28 pelanggan terbuka</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="text-xs text-slate-600 font-medium">Total Utang</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{formatRupiah(totalUtang)}</div>
            <div className="mt-1 text-xs text-rose-600">67 supplier terbuka</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="text-xs text-slate-600 font-medium">Kas & Bank (Est.)</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{formatRupiah(456000000)}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
              <ArrowUpRight size={14} /> Naik dari bulan lalu
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-slate-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-2xl transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/60"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content per Tab */}
        {activeTab === "ringkasan" && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold text-slate-900">Tren Penjualan vs Pembelian</div>
                    <div className="text-xs text-slate-600">6 bulan terakhir</div>
                  </div>
                  <button
                    onClick={() => exportToExcel("Tren_Penjualan", salesTrend, ["bulan", "penjualan", "pembelian", "laba"])}
                    className="text-xs flex items-center gap-1 text-emerald-700 hover:underline"
                  >
                    <Download size={14} /> Export
                  </button>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="bulan" tick={{ fill: "#475569", fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => (v / 1000000).toFixed(0) + " jt"} tick={{ fill: "#475569", fontSize: 12 }} />
                      <Tooltip formatter={(value: any) => formatRupiah(Number(value))} />
                      <Legend />
                      <Bar dataKey="penjualan" name="Penjualan" fill="#10b981" radius={4} />
                      <Bar dataKey="pembelian" name="Pembelian" fill="#334155" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold text-slate-900">Komposisi Beban</div>
                    <div className="text-xs text-slate-600">Total beban periode ini</div>
                  </div>
                </div>
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatRupiah(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
                  {expenseBreakdown.map((e, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700">
                      <span>{e.name}</span>
                      <span className="font-medium text-slate-900">{formatRupiah(e.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="font-semibold text-slate-900 mb-4">Highlight Kinerja</div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="text-emerald-700 font-medium">Laba Kotor Tertinggi</div>
                  <div className="text-2xl font-semibold text-emerald-800 mt-1">Rp 747 jt</div>
                  <div className="text-emerald-600 mt-0.5">Margin kotor 39.8%</div>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="text-amber-700 font-medium">Piutang Jatuh Tempo</div>
                  <div className="text-2xl font-semibold text-amber-800 mt-1">{formatRupiah(agingPiutang[3].jumlah)}</div>
                  <div className="text-amber-600 mt-0.5">9 pelanggan &gt; 90 hari</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-700 font-medium">Rasio Lancar (Estimasi)</div>
                  <div className="text-2xl font-semibold text-slate-900 mt-1">2.84x</div>
                  <div className="text-slate-600 mt-0.5">Sehat — di atas 1.5</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "laba-rugi" && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <div className="font-semibold text-slate-900">Laporan Laba Rugi</div>
                <div className="text-xs text-slate-600">Periode: {filters.periode.replace("-", " ")} • {filters.cabang}</div>
              </div>
              <button
                onClick={() => exportToExcel("Laba_Rugi", pnlData, ["item", "jumlah"])}
                className="text-sm flex items-center gap-2 text-emerald-700 hover:underline font-medium"
              >
                <Download size={16} /> Export Excel
              </button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 text-left font-semibold text-slate-900">Uraian</th>
                  <th className="px-6 py-3.5 text-right font-semibold text-slate-900">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pnlData.map((row, idx) => {
                  const isTotal = row.type === "total" || row.type === "subtotal" || row.type === "profit";
                  const isProfit = row.type === "profit";
                  const isRevenue = row.type === "revenue";
                  return (
                    <tr key={idx} className={isTotal ? "bg-slate-50 font-medium" : ""}>
                      <td className={`px-6 py-3 ${isTotal ? "text-slate-900" : "text-slate-800"}`}>
                        {row.item}
                      </td>
                      <td className={`px-6 py-3 text-right font-semibold ${isProfit ? "text-emerald-700" : isRevenue ? "text-emerald-600" : "text-slate-900"}`}>
                        {formatRupiah(row.jumlah)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="p-4 text-xs text-slate-600 border-t bg-slate-50">
              Catatan: Laba bersih setelah pajak. Data dapat direkonsiliasi dengan jurnal umum di modul Kas & Bank.
            </div>
          </div>
        )}

        {activeTab === "neraca" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* ASET */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 bg-emerald-50/60 border-b border-emerald-100 font-semibold text-emerald-800">ASET</div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {neracaData.aset.map((row, idx) => (
                    <tr key={idx} className={row.isGrand ? "bg-emerald-50 font-semibold" : row.isTotal ? "bg-slate-50 font-medium" : ""}>
                      <td className="px-6 py-3 text-slate-900">{row.item}</td>
                      <td className="px-6 py-3 text-right font-semibold text-slate-900">{formatRupiah(row.jumlah)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* LIABILITAS & EKUITAS */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 bg-slate-800 text-white font-semibold">LIABILITAS &amp; EKUITAS</div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {neracaData.liabilitasEkuitas.map((row, idx) => (
                    <tr key={idx} className={row.isGrand ? "bg-slate-900 text-white font-semibold" : row.isTotal ? "bg-slate-50 font-medium" : ""}>
                      <td className={`px-6 py-3 ${row.isGrand ? "text-white" : "text-slate-900"}`}>{row.item}</td>
                      <td className={`px-6 py-3 text-right font-semibold ${row.isGrand ? "text-white" : "text-slate-900"}`}>{formatRupiah(row.jumlah)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="lg:col-span-2 text-xs text-slate-600 px-1">Neraca dalam kondisi balance. Perubahan filter akan menyesuaikan estimasi nilai.</div>
          </div>
        )}

        {activeTab === "arus-kas" && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <div className="font-semibold text-slate-900">Laporan Arus Kas</div>
              <button onClick={() => exportToExcel("Arus_Kas", cashflowData, ["kategori", "masuk", "keluar", "net"])} className="text-sm text-emerald-700 flex items-center gap-1 hover:underline">
                <Download size={15} /> Export
              </button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 text-left font-semibold text-slate-900">Aktivitas</th>
                  <th className="px-6 py-3.5 text-right font-semibold text-slate-900">Kas Masuk</th>
                  <th className="px-6 py-3.5 text-right font-semibold text-slate-900">Kas Keluar</th>
                  <th className="px-6 py-3.5 text-right font-semibold text-slate-900">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cashflowData.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-3.5 text-slate-800 font-medium">{row.kategori}</td>
                    <td className="px-6 py-3.5 text-right text-emerald-600 font-medium">{formatRupiah(row.masuk)}</td>
                    <td className="px-6 py-3.5 text-right text-rose-600 font-medium">{formatRupiah(row.keluar)}</td>
                    <td className={`px-6 py-3.5 text-right font-semibold ${row.net >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {formatRupiah(row.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-slate-50 text-xs text-slate-600">
              Arus kas bersih periode ini menunjukkan posisi likuiditas yang stabil.
            </div>
          </div>
        )}

        {activeTab === "penjualan" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex justify-between mb-4">
                <div className="font-semibold text-slate-900">Tren Penjualan per Bulan</div>
                <button onClick={() => exportToExcel("Penjualan", salesTrend, ["bulan", "penjualan"])} className="text-emerald-700 text-sm flex items-center gap-1 hover:underline">
                  <Download size={15} /> Export
                </button>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="bulan" />
                    <YAxis tickFormatter={(v) => (v / 1e6).toFixed(0) + " jt"} />
                    <Tooltip formatter={(value: any) => formatRupiah(Number(value))} />
                    <Line type="monotone" dataKey="penjualan" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b font-semibold text-slate-900">Ringkasan Penjualan per Kategori (Demo)</div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Produk / Kategori</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-900">Qty</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-900">Nilai Penjualan</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-900">Kontribusi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { nama: "Tepung Premium & Turunannya", qty: 12480, nilai: 485000000, kontribusi: "27.8%" },
                    { nama: "Roti & Bakery", qty: 8920, nilai: 312000000, kontribusi: "17.9%" },
                    { nama: "Minuman & Kopi", qty: 15600, nilai: 198000000, kontribusi: "11.3%" },
                    { nama: "Bahan Baku Lain", qty: 6750, nilai: 167000000, kontribusi: "9.6%" },
                  ].map((r, i) => (
                    <tr key={i}>
                      <td className="px-6 py-3.5 text-slate-800">{r.nama}</td>
                      <td className="px-6 py-3.5 text-right text-slate-900">{formatNumber(r.qty)}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-emerald-700">{formatRupiah(r.nilai)}</td>
                      <td className="px-6 py-3.5 text-right text-slate-700">{r.kontribusi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "pembelian" && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between">
              <div className="font-semibold text-slate-900">Laporan Pembelian</div>
              <button onClick={() => exportToExcel("Pembelian", salesTrend, ["bulan", "pembelian"])} className="text-sm text-emerald-700 flex items-center gap-1 hover:underline">
                <Download size={15} /> Export
              </button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 text-left font-semibold text-slate-900">Bulan</th>
                  <th className="px-6 py-3.5 text-right font-semibold text-slate-900">Nilai Pembelian</th>
                  <th className="px-6 py-3.5 text-right font-semibold text-slate-900">Supplier Aktif</th>
                  <th className="px-6 py-3.5 text-right font-semibold text-slate-900">Rata-rata per PO</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {salesTrend.map((row, i) => (
                  <tr key={i}>
                    <td className="px-6 py-3.5 text-slate-900 font-medium">{row.bulan} 2026</td>
                    <td className="px-6 py-3.5 text-right font-semibold text-slate-900">{formatRupiah(row.pembelian)}</td>
                    <td className="px-6 py-3.5 text-right text-slate-700">{Math.floor(18 + i * 1.6)}</td>
                    <td className="px-6 py-3.5 text-right text-slate-700">{formatRupiah(row.pembelian / 24)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "piutang-utang" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Piutang */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 bg-emerald-50 border-b font-semibold text-emerald-800 flex justify-between">
                <span>Aging Piutang Usaha</span>
                <span className="font-normal text-emerald-600 text-sm">Total: {formatRupiah(totalPiutang)}</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Umur</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-900">Jumlah</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-900">Jumlah Pelanggan</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {agingPiutang.map((row, i) => (
                    <tr key={i}>
                      <td className="px-6 py-3.5 text-slate-800">{row.kategori}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-emerald-700">{formatRupiah(row.jumlah)}</td>
                      <td className="px-6 py-3.5 text-right text-slate-700">{row.pelanggan} pelanggan</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Utang */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 bg-rose-50 border-b font-semibold text-rose-800 flex justify-between">
                <span>Aging Utang Usaha</span>
                <span className="font-normal text-rose-600 text-sm">Total: {formatRupiah(totalUtang)}</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Umur</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-900">Jumlah</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-900">Jumlah Supplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {agingUtang.map((row, i) => (
                    <tr key={i}>
                      <td className="px-6 py-3.5 text-slate-800">{row.kategori}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-rose-700">{formatRupiah(row.jumlah)}</td>
                      <td className="px-6 py-3.5 text-right text-slate-700">{row.supplier} supplier</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:col-span-2 text-xs bg-white border border-slate-200 rounded-2xl p-4 text-slate-600">
              Tindak lanjut piutang yang sudah jatuh tempo sangat disarankan untuk menjaga arus kas. Hubungi modul CRM atau Penjualan untuk follow-up.
            </div>
          </div>
        )}

        <div className="mt-8 text-xs text-slate-500">
          Data yang ditampilkan bersifat demonstrasi dan dapat direkonsiliasi dengan modul Kas &amp; Bank, Penjualan, Pembelian, serta Produksi.
        </div>
      </main>
    </div>
  );
}
