"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../component/Sidebar";

import {
  Building2,
  Plus,
  Search,
  Pencil,
  X,
  Calendar,
  DollarSign,
  BarChart3,
  Wrench,
  FileText,
  Trash2,
} from "lucide-react";

type Asset = {
  id: number;
  nama: string;
  kategori: string;
  tanggalPerolehan: string; // YYYY-MM-DD
  hargaPerolehan: number;
  umurEkonomis: number; // tahun
  nilaiSisa: number;
  lokasi: string;
  status: "Aktif" | "Nonaktif" | "Dijual";
  keterangan?: string;
};

type Maintenance = {
  id: number;
  assetId: number;
  tanggal: string;
  deskripsi: string;
  biaya: number;
};

type AssetWithCalc = Asset & {
  penyusutanTahunan: number;
  penyusutanBulanan: number;
  akumulasiPenyusutan: number;
  nilaiBuku: number;
};

const ASSET_CATEGORIES = [
  "Tanah",
  "Bangunan",
  "Kendaraan",
  "Mesin & Peralatan",
  "Peralatan Kantor",
  "Lain-lain",
] as const;

const ASSET_STATUSES = ["Aktif", "Nonaktif", "Dijual"] as const;

export default function AsetPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "ringkasan" | "daftar" | "penyusutan" | "pemeliharaan" | "laporan"
  >("ringkasan");

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "daftar", label: "Daftar Aset" },
    { id: "penyusutan", label: "Penyusutan" },
    { id: "pemeliharaan", label: "Pemeliharaan" },
    { id: "laporan", label: "Laporan" },
  ] as const;

  // Data
  const [assets, setAssets] = useState<Asset[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);

  // UI
  const [searchTerm, setSearchTerm] = useState("");

  // Asset form modal
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<number | null>(null);
  const [assetForm, setAssetForm] = useState<{
    nama: string;
    kategori: string;
    tanggalPerolehan: string;
    hargaPerolehan: number;
    umurEkonomis: number;
    nilaiSisa: number;
    lokasi: string;
    status: "Aktif" | "Nonaktif" | "Dijual";
    keterangan: string;
  }>({
    nama: "",
    kategori: ASSET_CATEGORIES[0],
    tanggalPerolehan: "2024-01-15",
    hargaPerolehan: 0,
    umurEkonomis: 5,
    nilaiSisa: 0,
    lokasi: "",
    status: "Aktif",
    keterangan: "",
  });

  // Maintenance modal
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [maintForm, setMaintForm] = useState({
    assetId: 0,
    tanggal: "2026-06-01",
    deskripsi: "",
    biaya: 0,
  });

  // Load profile + demo data (with localStorage persistence)
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

    // Load from localStorage or seed demo
    const savedAssets = localStorage.getItem("aset_demo_assets");
    const savedMaint = localStorage.getItem("aset_demo_maintenances");

    if (savedAssets) {
      setAssets(JSON.parse(savedAssets));
    } else {
      const demoAssets: Asset[] = [
        {
          id: 1,
          nama: "Gudang Utama DIAUF",
          kategori: "Bangunan",
          tanggalPerolehan: "2022-03-10",
          hargaPerolehan: 1250000000,
          umurEkonomis: 20,
          nilaiSisa: 250000000,
          lokasi: "Jl. Industri No. 45, Bekasi",
          status: "Aktif",
          keterangan: "Bangunan utama + gudang penyimpanan",
        },
        {
          id: 2,
          nama: "Truk Mitsubishi Fuso",
          kategori: "Kendaraan",
          tanggalPerolehan: "2023-07-22",
          hargaPerolehan: 385000000,
          umurEkonomis: 8,
          nilaiSisa: 85000000,
          lokasi: "Pool Armada - Bekasi",
          status: "Aktif",
        },
        {
          id: 3,
          nama: "Mesin Press Otomatis Line 2",
          kategori: "Mesin & Peralatan",
          tanggalPerolehan: "2021-11-05",
          hargaPerolehan: 920000000,
          umurEkonomis: 10,
          nilaiSisa: 120000000,
          lokasi: "Workshop Produksi",
          status: "Aktif",
          keterangan: "Mesin utama produksi kemasan",
        },
        {
          id: 4,
          nama: "Tanah Kavling Cikarang",
          kategori: "Tanah",
          tanggalPerolehan: "2020-02-28",
          hargaPerolehan: 1450000000,
          umurEkonomis: 0,
          nilaiSisa: 1450000000,
          lokasi: "Cikarang, Jawa Barat",
          status: "Aktif",
          keterangan: "Tanah cadangan ekspansi",
        },
        {
          id: 5,
          nama: "Toyota Hiace Commuter",
          kategori: "Kendaraan",
          tanggalPerolehan: "2024-09-12",
          hargaPerolehan: 295000000,
          umurEkonomis: 7,
          nilaiSisa: 65000000,
          lokasi: "Pool Armada - Bekasi",
          status: "Aktif",
        },
        {
          id: 6,
          nama: "Sistem Rak Gudang Otomatis",
          kategori: "Peralatan Kantor",
          tanggalPerolehan: "2023-01-30",
          hargaPerolehan: 178000000,
          umurEkonomis: 12,
          nilaiSisa: 25000000,
          lokasi: "Gudang Utama",
          status: "Aktif",
        },
        {
          id: 7,
          nama: "Mesin Laser Cutting Lama",
          kategori: "Mesin & Peralatan",
          tanggalPerolehan: "2019-05-18",
          hargaPerolehan: 340000000,
          umurEkonomis: 7,
          nilaiSisa: 30000000,
          lokasi: "Workshop Produksi",
          status: "Nonaktif",
          keterangan: "Sudah diganti dengan unit baru",
        },
      ];
      setAssets(demoAssets);
      localStorage.setItem("aset_demo_assets", JSON.stringify(demoAssets));
    }

    if (savedMaint) {
      setMaintenances(JSON.parse(savedMaint));
    } else {
      const demoMaint: Maintenance[] = [
        { id: 101, assetId: 2, tanggal: "2025-11-03", deskripsi: "Service berkala + ganti ban", biaya: 12500000 },
        { id: 102, assetId: 3, tanggal: "2026-02-14", deskripsi: "Penggantian komponen hidrolik", biaya: 28500000 },
        { id: 103, assetId: 1, tanggal: "2026-04-20", deskripsi: "Repaint dinding gudang + perbaikan atap", biaya: 18750000 },
        { id: 104, assetId: 5, tanggal: "2026-05-28", deskripsi: "Service AC + oli rutin", biaya: 4750000 },
        { id: 105, assetId: 3, tanggal: "2026-06-05", deskripsi: "Kalibrasi sensor & preventive maintenance", biaya: 8500000 },
      ];
      setMaintenances(demoMaint);
      localStorage.setItem("aset_demo_maintenances", JSON.stringify(demoMaint));
    }
  }, []);

  // Persist on change
  useEffect(() => {
    if (assets.length > 0) {
      localStorage.setItem("aset_demo_assets", JSON.stringify(assets));
    }
  }, [assets]);

  useEffect(() => {
    if (maintenances.length > 0) {
      localStorage.setItem("aset_demo_maintenances", JSON.stringify(maintenances));
    }
  }, [maintenances]);

  // Reference date for calculations (today in context)
  const referenceDate = new Date("2026-06-16");

  // Calculation helper
  const calculateAsset = (asset: Asset): { penyusutanTahunan: number; penyusutanBulanan: number; akumulasiPenyusutan: number; nilaiBuku: number } => {
    const cost = asset.hargaPerolehan;
    const residual = asset.nilaiSisa || 0;
    const life = asset.umurEkonomis || 1;

    if (asset.kategori === "Tanah" || life <= 0) {
      return {
        penyusutanTahunan: 0,
        penyusutanBulanan: 0,
        akumulasiPenyusutan: 0,
        nilaiBuku: cost,
      };
    }

    const depreciable = Math.max(0, cost - residual);
    const annual = Math.round(depreciable / life);
    const monthly = Math.round(annual / 12);

    const acq = new Date(asset.tanggalPerolehan);
    let months = (referenceDate.getFullYear() - acq.getFullYear()) * 12 + (referenceDate.getMonth() - acq.getMonth());
    months = Math.max(0, months);

    let accum = Math.round(monthly * months);
    accum = Math.min(accum, depreciable);

    const book = Math.round(cost - accum);

    return {
      penyusutanTahunan: annual,
      penyusutanBulanan: monthly,
      akumulasiPenyusutan: accum,
      nilaiBuku: book,
    };
  };

  // Enriched assets
  const assetsWithCalc: AssetWithCalc[] = assets.map((a) => {
    const calc = calculateAsset(a);
    return { ...a, ...calc };
  });

  // Filtered for tables
  const filteredAssets = assetsWithCalc.filter((a) =>
    a.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.lokasi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMaintenances = maintenances
    .map((m) => {
      const asset = assets.find((a) => a.id === m.assetId);
      return { ...m, assetNama: asset?.nama || "Aset Dihapus" };
    })
    .filter((m) =>
      (m.assetNama || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (b.tanggal > a.tanggal ? 1 : -1));

  // Stats
  const totalPerolehan = assets.reduce((sum, a) => sum + a.hargaPerolehan, 0);
  const totalNilaiBuku = assetsWithCalc.reduce((sum, a) => sum + a.nilaiBuku, 0);
  const totalAkumulasi = assetsWithCalc.reduce((sum, a) => sum + a.akumulasiPenyusutan, 0);
  const totalMaintenance = maintenances.reduce((sum, m) => sum + m.biaya, 0);
  const jumlahAktif = assets.filter((a) => a.status === "Aktif").length;

  // Group by kategori for laporan
  const byKategori = ASSET_CATEGORIES.map((cat) => {
    const inCat = assetsWithCalc.filter((a) => a.kategori === cat);
    const perolehan = inCat.reduce((s, a) => s + a.hargaPerolehan, 0);
    const buku = inCat.reduce((s, a) => s + a.nilaiBuku, 0);
    const susut = inCat.reduce((s, a) => s + a.akumulasiPenyusutan, 0);
    return { kategori: cat, jumlah: inCat.length, perolehan, buku, susut };
  }).filter((g) => g.jumlah > 0);

  // Handlers - Asset
  const openAddAsset = () => {
    setEditingAssetId(null);
    setAssetForm({
      nama: "",
      kategori: ASSET_CATEGORIES[0],
      tanggalPerolehan: "2025-01-10",
      hargaPerolehan: 150000000,
      umurEkonomis: 5,
      nilaiSisa: 20000000,
      lokasi: "",
      status: "Aktif",
      keterangan: "",
    });
    setShowAssetModal(true);
  };

  const openEditAsset = (asset: Asset) => {
    setEditingAssetId(asset.id);
    setAssetForm({
      nama: asset.nama,
      kategori: asset.kategori,
      tanggalPerolehan: asset.tanggalPerolehan,
      hargaPerolehan: asset.hargaPerolehan,
      umurEkonomis: asset.umurEkonomis,
      nilaiSisa: asset.nilaiSisa,
      lokasi: asset.lokasi,
      status: asset.status,
      keterangan: asset.keterangan || "",
    });
    setShowAssetModal(true);
  };

  const closeAssetModal = () => {
    setShowAssetModal(false);
    setEditingAssetId(null);
  };

  const saveAsset = () => {
    if (!assetForm.nama.trim() || !assetForm.lokasi.trim() || assetForm.hargaPerolehan <= 0) {
      alert("Nama, Lokasi, dan Harga Perolehan wajib diisi dengan benar.");
      return;
    }

    if (editingAssetId !== null) {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === editingAssetId
            ? {
                ...a,
                nama: assetForm.nama.trim(),
                kategori: assetForm.kategori,
                tanggalPerolehan: assetForm.tanggalPerolehan,
                hargaPerolehan: assetForm.hargaPerolehan,
                umurEkonomis: assetForm.umurEkonomis,
                nilaiSisa: assetForm.nilaiSisa,
                lokasi: assetForm.lokasi.trim(),
                status: assetForm.status,
                keterangan: assetForm.keterangan.trim() || undefined,
              }
            : a
        )
      );
    } else {
      const newId = Math.max(0, ...assets.map((a) => a.id)) + 1;
      const newAsset: Asset = {
        id: newId,
        nama: assetForm.nama.trim(),
        kategori: assetForm.kategori,
        tanggalPerolehan: assetForm.tanggalPerolehan,
        hargaPerolehan: assetForm.hargaPerolehan,
        umurEkonomis: assetForm.umurEkonomis,
        nilaiSisa: assetForm.nilaiSisa,
        lokasi: assetForm.lokasi.trim(),
        status: assetForm.status,
        keterangan: assetForm.keterangan.trim() || undefined,
      };
      setAssets((prev) => [...prev, newAsset]);
    }
    closeAssetModal();
  };

  const deleteAsset = (id: number) => {
    if (!confirm("Hapus aset ini? Data pemeliharaan terkait akan tetap ada (tapi nama aset hilang).")) return;
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  // Handlers - Maintenance
  const openAddMaintenance = () => {
    const firstActive = assets.find((a) => a.status === "Aktif");
    setMaintForm({
      assetId: firstActive?.id || (assets[0]?.id ?? 0),
      tanggal: "2026-06-16",
      deskripsi: "",
      biaya: 5000000,
    });
    setShowMaintModal(true);
  };

  const closeMaintModal = () => {
    setShowMaintModal(false);
  };

  const saveMaintenance = () => {
    if (!maintForm.assetId || !maintForm.deskripsi.trim() || maintForm.biaya <= 0) {
      alert("Pilih aset, isi deskripsi, dan biaya pemeliharaan.");
      return;
    }
    const newId = Math.max(0, ...maintenances.map((m) => m.id)) + 1;
    const newMaint: Maintenance = {
      id: newId,
      assetId: maintForm.assetId,
      tanggal: maintForm.tanggal,
      deskripsi: maintForm.deskripsi.trim(),
      biaya: maintForm.biaya,
    };
    setMaintenances((prev) => [...prev, newMaint]);
    closeMaintModal();
  };

  const deleteMaintenance = (id: number) => {
    if (!confirm("Hapus catatan pemeliharaan ini?")) return;
    setMaintenances((prev) => prev.filter((m) => m.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-900">Memuat Modul Aset...</div>
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
                <Building2 size={26} className="text-emerald-600" /> Modul Aset
              </h1>
              <p className="mt-1 text-sm text-slate-800">
                Manajemen Aset Tetap, perhitungan penyusutan otomatis, dan pencatatan pemeliharaan. Terintegrasi dengan data master dan keuangan.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openAddAsset}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm"
              >
                <Plus size={16} /> Tambah Aset
              </button>
              <button
                onClick={openAddMaintenance}
                className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 px-4 py-2 text-sm font-medium rounded-2xl transition"
              >
                <Wrench size={16} /> Catat Pemeliharaan
              </button>
            </div>
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

        {/* Search */}
        {(activeTab === "daftar" || activeTab === "penyusutan" || activeTab === "pemeliharaan") && (
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
              <input
                type="text"
                placeholder={
                  activeTab === "pemeliharaan"
                    ? "Cari nama aset atau deskripsi..."
                    : "Cari nama aset, kategori, atau lokasi..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
              />
            </div>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-sm text-slate-700 hover:text-slate-900">
                Clear
              </button>
            )}
          </div>
        )}

        {/* RINGKASAN */}
        {activeTab === "ringkasan" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Jumlah Aset Aktif</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{jumlahAktif}</div>
                <div className="text-xs text-slate-700 mt-1">dari {assets.length} total aset</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Harga Perolehan</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">
                  Rp {(totalPerolehan / 1000000000).toFixed(1)}M
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Nilai Buku</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">
                  Rp {(totalNilaiBuku / 1000000).toFixed(0)}jt
                </div>
                <div className="text-xs text-slate-700 mt-0.5">
                  {((totalNilaiBuku / Math.max(totalPerolehan, 1)) * 100).toFixed(1)}% dari perolehan
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Akumulasi Penyusutan</div>
                <div className="text-3xl font-semibold text-red-700 mt-1">
                  Rp {(totalAkumulasi / 1000000).toFixed(0)}jt
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Biaya Pemeliharaan</div>
                <div className="text-3xl font-semibold text-blue-700 mt-1">
                  Rp {(totalMaintenance / 1000000).toFixed(0)}jt
                </div>
                <div className="text-xs text-slate-700 mt-0.5">Semua catatan tercatat</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                  <BarChart3 size={20} /> Aset Bernilai Tertinggi
                </h3>
                <div className="space-y-3 text-sm">
                  {[...assetsWithCalc]
                    .sort((a, b) => b.hargaPerolehan - a.hargaPerolehan)
                    .slice(0, 5)
                    .map((a) => (
                      <div key={a.id} className="flex justify-between border-b border-slate-100 pb-2">
                        <div>
                          <div className="font-medium text-slate-900">{a.nama}</div>
                          <div className="text-xs text-slate-700">{a.kategori} • {a.lokasi}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-emerald-700">Rp {a.hargaPerolehan.toLocaleString("id-ID")}</div>
                          <div className="text-xs text-slate-700">Buku: Rp {a.nilaiBuku.toLocaleString("id-ID")}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <h3 className="font-semibold text-lg mb-4 text-slate-900">Catatan Penting</h3>
                <div className="text-sm text-slate-800 space-y-2">
                  <p>• Penyusutan dihitung otomatis menggunakan metode garis lurus (straight-line).</p>
                  <p>• Tanah tidak disusutkan (nilai buku = harga perolehan).</p>
                  <p>• Data pemeliharaan memengaruhi biaya operasional dan dapat dilaporkan ke modul Pajak.</p>
                  <p>• Aset dari pembelian modal (Pembelian) akan otomatis masuk ke daftar ini (coming soon).</p>
                  <p>• Nilai buku digunakan untuk laporan keuangan dan perhitungan pajak penghasilan.</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Reset semua data aset & pemeliharaan ke demo awal?")) {
                      localStorage.removeItem("aset_demo_assets");
                      localStorage.removeItem("aset_demo_maintenances");
                      window.location.reload();
                    }
                  }}
                  className="mt-4 text-xs text-slate-700 hover:text-red-600 underline"
                >
                  Reset data demo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DAFTAR ASET */}
        {activeTab === "daftar" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Nama Aset</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Kategori</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Tgl Perolehan</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Harga Perolehan</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Nilai Buku</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Lokasi</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-slate-800">Tidak ada aset ditemukan.</td>
                    </tr>
                  ) : (
                    filteredAssets.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-4 font-medium text-slate-900">
                          {a.nama}
                          {a.keterangan && <div className="text-xs text-slate-700 mt-0.5">{a.keterangan}</div>}
                        </td>
                        <td className="px-5 py-4 text-slate-800">{a.kategori}</td>
                        <td className="px-5 py-4 text-slate-800">{new Date(a.tanggalPerolehan).toLocaleDateString("id-ID")}</td>
                        <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                          Rp {a.hargaPerolehan.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-slate-900">
                          Rp {a.nilaiBuku.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-block px-3 py-0.5 rounded-full text-xs font-medium ${
                              a.status === "Aktif"
                                ? "bg-emerald-100 text-emerald-700"
                                : a.status === "Nonaktif"
                                ? "bg-slate-200 text-slate-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center text-slate-800">{a.lokasi}</td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => openEditAsset(a)}
                              className="p-2 rounded-xl hover:bg-slate-100 text-slate-700"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => deleteAsset(a.id)}
                              className="p-2 rounded-xl hover:bg-red-50 text-red-600"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PENYUSUTAN */}
        {activeTab === "penyusutan" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Aset</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Penyusutan / Tahun</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Penyusutan / Bulan</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-red-700">Akumulasi Penyusutan</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-emerald-700">Nilai Buku Saat Ini</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">% Tersusut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-800">Tidak ada data.</td>
                    </tr>
                  ) : (
                    filteredAssets.map((a) => {
                      const depreciable = Math.max(0, a.hargaPerolehan - a.nilaiSisa);
                      const pct = depreciable > 0 ? Math.min(100, Math.round((a.akumulasiPenyusutan / depreciable) * 100)) : 0;
                      return (
                        <tr key={a.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-medium text-slate-900">
                            {a.nama}
                            <div className="text-xs text-slate-700">{a.kategori}</div>
                          </td>
                          <td className="px-5 py-4 text-right text-slate-900">
                            {a.penyusutanTahunan > 0 ? `Rp ${a.penyusutanTahunan.toLocaleString("id-ID")}` : "-"}
                          </td>
                          <td className="px-5 py-4 text-right text-slate-800">
                            {a.penyusutanBulanan > 0 ? `Rp ${a.penyusutanBulanan.toLocaleString("id-ID")}` : "-"}
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-red-700">
                            Rp {a.akumulasiPenyusutan.toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                            Rp {a.nilaiBuku.toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-4 text-center font-medium text-slate-900">
                            {pct}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 text-xs text-slate-700 bg-slate-50 border-t border-slate-200">
              Perhitungan menggunakan metode garis lurus. Tanggal acuan: 16 Juni 2026. Tanah &amp; aset dengan umur ekonomis 0 tidak disusutkan.
            </div>
          </div>
        )}

        {/* PEMELIHARAAN */}
        {activeTab === "pemeliharaan" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Tanggal</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Aset</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Deskripsi</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Biaya</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMaintenances.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-800">Belum ada catatan pemeliharaan.</td>
                    </tr>
                  ) : (
                    filteredMaintenances.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-4 text-slate-800">{new Date(m.tanggal).toLocaleDateString("id-ID")}</td>
                        <td className="px-5 py-4 font-medium text-slate-900">{m.assetNama}</td>
                        <td className="px-5 py-4 text-slate-800">{m.deskripsi}</td>
                        <td className="px-5 py-4 text-right font-semibold text-blue-700">
                          Rp {m.biaya.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => deleteMaintenance(m.id)}
                            className="p-2 rounded-xl hover:bg-red-50 text-red-600"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-200 text-xs text-slate-700">
              Total biaya pemeliharaan tercatat: <span className="font-semibold text-slate-900">Rp {totalMaintenance.toLocaleString("id-ID")}</span>
            </div>
          </div>
        )}

        {/* LAPORAN */}
        {activeTab === "laporan" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <FileText size={18} /> Ringkasan per Kategori Aset
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Kategori</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Jumlah</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Total Perolehan</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-red-700">Akumulasi Penyusutan</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-emerald-700">Nilai Buku</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {byKategori.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-slate-800">Tidak ada data.</td>
                      </tr>
                    ) : (
                      byKategori.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-medium text-slate-900">{row.kategori}</td>
                          <td className="px-5 py-4 text-center text-slate-800">{row.jumlah}</td>
                          <td className="px-5 py-4 text-right text-emerald-700 font-semibold">
                            Rp {row.perolehan.toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-4 text-right text-red-700 font-semibold">
                            Rp {row.susut.toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-4 text-right text-emerald-700 font-semibold">
                            Rp {row.buku.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 font-semibold">
                    <tr>
                      <td className="px-5 py-3.5 text-slate-900">TOTAL</td>
                      <td className="px-5 py-3.5 text-center text-slate-900">{assets.length}</td>
                      <td className="px-5 py-3.5 text-right text-emerald-700">Rp {totalPerolehan.toLocaleString("id-ID")}</td>
                      <td className="px-5 py-3.5 text-right text-red-700">Rp {totalAkumulasi.toLocaleString("id-ID")}</td>
                      <td className="px-5 py-3.5 text-right text-emerald-700">Rp {totalNilaiBuku.toLocaleString("id-ID")}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-sm text-slate-800">
              <h3 className="font-semibold text-slate-900 mb-3">Integrasi &amp; Catatan Laporan</h3>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>Nilai buku dan akumulasi penyusutan dapat digunakan langsung untuk laporan neraca di modul Keuangan.</li>
                <li>Biaya pemeliharaan &amp; penyusutan fiskal dapat diekspor ke modul Pajak untuk pelaporan SPT &amp; CoreTax.</li>
                <li>Disarankan review umur ekonomis dan nilai sisa secara berkala (minimal 1x setahun).</li>
                <li>Aset yang dijual atau di-nonaktifkan sebaiknya di-update statusnya agar tidak lagi disusutkan.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Asset Modal (Add / Edit) */}
      {showAssetModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">
                {editingAssetId !== null ? "Edit Aset" : "Tambah Aset Baru"}
              </h3>
              <button onClick={closeAssetModal}><X size={22} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-800 mb-1">Nama Aset</label>
                <input
                  type="text"
                  value={assetForm.nama}
                  onChange={(e) => setAssetForm({ ...assetForm, nama: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                  placeholder="Contoh: Truk Mitsubishi Fuso"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Kategori</label>
                <select
                  value={assetForm.kategori}
                  onChange={(e) => setAssetForm({ ...assetForm, kategori: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 bg-white"
                >
                  {ASSET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal Perolehan</label>
                <input
                  type="date"
                  value={assetForm.tanggalPerolehan}
                  onChange={(e) => setAssetForm({ ...assetForm, tanggalPerolehan: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Harga Perolehan (Rp)</label>
                <input
                  type="number"
                  value={assetForm.hargaPerolehan}
                  onChange={(e) => setAssetForm({ ...assetForm, hargaPerolehan: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Umur Ekonomis (Tahun)</label>
                <input
                  type="number"
                  value={assetForm.umurEkonomis}
                  onChange={(e) => setAssetForm({ ...assetForm, umurEkonomis: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                />
                <p className="text-[10px] text-slate-700 mt-0.5">Isi 0 untuk Tanah / tidak disusutkan</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Nilai Sisa / Residual (Rp)</label>
                <input
                  type="number"
                  value={assetForm.nilaiSisa}
                  onChange={(e) => setAssetForm({ ...assetForm, nilaiSisa: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Lokasi</label>
                <input
                  type="text"
                  value={assetForm.lokasi}
                  onChange={(e) => setAssetForm({ ...assetForm, lokasi: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                  placeholder="Gudang / Pool / Workshop"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Status</label>
                <select
                  value={assetForm.status}
                  onChange={(e) => setAssetForm({ ...assetForm, status: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 bg-white"
                >
                  {ASSET_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-800 mb-1">Keterangan (opsional)</label>
                <textarea
                  value={assetForm.keterangan}
                  onChange={(e) => setAssetForm({ ...assetForm, keterangan: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                  placeholder="Catatan tambahan..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeAssetModal} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">
                Batal
              </button>
              <button onClick={saveAsset} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">
                {editingAssetId !== null ? "Simpan Perubahan" : "Tambah Aset"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">Catat Pemeliharaan / Perbaikan</h3>
              <button onClick={closeMaintModal}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Aset</label>
                <select
                  value={maintForm.assetId}
                  onChange={(e) => setMaintForm({ ...maintForm, assetId: parseInt(e.target.value) })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 bg-white"
                >
                  {assets.length === 0 && <option value={0}>-- Tidak ada aset --</option>}
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>{a.nama} ({a.kategori})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={maintForm.tanggal}
                  onChange={(e) => setMaintForm({ ...maintForm, tanggal: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Deskripsi Pekerjaan</label>
                <input
                  type="text"
                  value={maintForm.deskripsi}
                  onChange={(e) => setMaintForm({ ...maintForm, deskripsi: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                  placeholder="Service rutin, ganti sparepart, dll"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Biaya (Rp)</label>
                <input
                  type="number"
                  value={maintForm.biaya}
                  onChange={(e) => setMaintForm({ ...maintForm, biaya: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeMaintModal} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">
                Batal
              </button>
              <button onClick={saveMaintenance} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
