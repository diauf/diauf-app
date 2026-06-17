"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../component/Sidebar";

import {
  Receipt,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Calendar,
  CheckCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
} from "lucide-react";

type PajakType = {
  id: string;
  kode: string;
  nama: string;
  persen: number;
  jenis: string; // UMKM, PPh, PPN, PBB, Lainnya
  keterangan?: string;
};

type TransaksiPajak = {
  id: string;
  tanggal: string;
  no_trans: string;
  pajak_id: string;
  pajak_nama: string;
  dasar_pajak: number;
  tarif: number;
  jumlah_pajak: number;
  jatuh_tempo: string;
  status: string; // Belum Bayar, Sudah Bayar, Terlambat
  ref_dokumen?: string;
  catatan?: string;
};

export default function PajakPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "ringkasan" | "konfigurasi" | "transaksi" | "laporan"
  >("ringkasan");

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "konfigurasi", label: "Konfigurasi Pajak" },
    { id: "transaksi", label: "Transaksi & Pembayaran" },
    { id: "laporan", label: "Laporan Pajak" },
  ] as const;

  // Demo data - pajak types (bisa diedit)
  const [pajakTypes, setPajakTypes] = useState<PajakType[]>([
    {
      id: "p1",
      kode: "PPN",
      nama: "Pajak Pertambahan Nilai",
      persen: 11,
      jenis: "PPN",
      keterangan: "Pajak atas nilai tambah barang/jasa",
    },
    {
      id: "p2",
      kode: "PPh21",
      nama: "PPh Pasal 21",
      persen: 5,
      jenis: "PPh",
      keterangan: "Pajak penghasilan atas gaji karyawan",
    },
    {
      id: "p3",
      kode: "PPh22",
      nama: "PPh Pasal 22",
      persen: 1.5,
      jenis: "PPh",
      keterangan: "Pajak atas impor barang",
    },
    {
      id: "p4",
      kode: "UMKM",
      nama: "Pajak UMKM",
      persen: 0.5,
      jenis: "UMKM",
      keterangan: "Pajak final untuk UMKM (omzet s/d 4.8M/tahun)",
    },
    {
      id: "p5",
      kode: "PBB",
      nama: "Pajak Bumi dan Bangunan",
      persen: 0.5,
      jenis: "PBB",
      keterangan: "Pajak atas kepemilikan tanah dan bangunan",
    },
  ]);

  // Transaksi pajak
  const [transaksiList, setTransaksiList] = useState<TransaksiPajak[]>([
    {
      id: "tp1",
      tanggal: "2026-06-01",
      no_trans: "PPN-202606-001",
      pajak_id: "p1",
      pajak_nama: "Pajak Pertambahan Nilai",
      dasar_pajak: 250000000,
      tarif: 11,
      jumlah_pajak: 27500000,
      jatuh_tempo: "2026-07-15",
      status: "Belum Bayar",
      ref_dokumen: "INV-2026-0456",
    },
    {
      id: "tp2",
      tanggal: "2026-05-20",
      no_trans: "UMKM-202605-001",
      pajak_id: "p4",
      pajak_nama: "Pajak UMKM",
      dasar_pajak: 320000000,
      tarif: 0.5,
      jumlah_pajak: 1600000,
      jatuh_tempo: "2026-06-10",
      status: "Sudah Bayar",
      ref_dokumen: "OMZ-2026-Q2",
    },
    {
      id: "tp3",
      tanggal: "2026-06-05",
      no_trans: "PPh21-202606-001",
      pajak_id: "p2",
      pajak_nama: "PPh Pasal 21",
      dasar_pajak: 85000000,
      tarif: 5,
      jumlah_pajak: 4250000,
      jatuh_tempo: "2026-06-25",
      status: "Belum Bayar",
      ref_dokumen: "PAY-2026-06",
    },
  ]);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jenisFilter, setJenisFilter] = useState("all");

  // Modals
  const [showPajakModal, setShowPajakModal] = useState(false);
  const [showTransaksiModal, setShowTransaksiModal] = useState(false);
  const [editingPajakId, setEditingPajakId] = useState<string | null>(null);
  const [editingTransaksiId, setEditingTransaksiId] = useState<string | null>(null);

  // Forms
  const [pajakForm, setPajakForm] = useState({
    kode: "",
    nama: "",
    persen: 0,
    jenis: "PPN",
    keterangan: "",
  });

  const [transaksiForm, setTransaksiForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    pajak_id: "",
    pajak_nama: "",
    dasar_pajak: 0,
    jatuh_tempo: "",
    ref_dokumen: "",
    catatan: "",
  });

  // Load profile (demo)
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

  // Filtered lists
  const filteredTransaksi = transaksiList.filter((t) => {
    const matchSearch =
      t.no_trans.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.pajak_nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.ref_dokumen || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchJenis =
      jenisFilter === "all" ||
      pajakTypes.find((p) => p.id === t.pajak_id)?.jenis === jenisFilter;
    return matchSearch && matchStatus && matchJenis;
  });

  const filteredPajak = pajakTypes.filter((p) =>
    (p.nama + p.kode).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const openAddPajakModal = () => {
    setPajakForm({
      kode: "",
      nama: "",
      persen: 11,
      jenis: "PPN",
      keterangan: "",
    });
    setEditingPajakId(null);
    setShowPajakModal(true);
  };

  const openEditPajakModal = (pajak: PajakType) => {
    setPajakForm({
      kode: pajak.kode,
      nama: pajak.nama,
      persen: pajak.persen,
      jenis: pajak.jenis,
      keterangan: pajak.keterangan || "",
    });
    setEditingPajakId(pajak.id);
    setShowPajakModal(true);
  };

  const savePajak = () => {
    if (!pajakForm.kode || !pajakForm.nama) return;

    if (editingPajakId) {
      setPajakTypes((prev) =>
        prev.map((p) =>
          p.id === editingPajakId ? { ...p, ...pajakForm } : p
        )
      );
    } else {
      const newPajak: PajakType = {
        id: "p" + Date.now(),
        ...pajakForm,
      };
      setPajakTypes((prev) => [...prev, newPajak]);
    }
    setShowPajakModal(false);
    setEditingPajakId(null);
  };

  const deletePajak = (id: string) => {
    if (!confirm("Hapus jenis pajak ini? Data transaksi terkait tidak akan terhapus.")) return;
    setPajakTypes((prev) => prev.filter((p) => p.id !== id));
  };

  const openAddTransaksiModal = () => {
    const firstPajak = pajakTypes[0];
    setTransaksiForm({
      tanggal: new Date().toISOString().split("T")[0],
      pajak_id: firstPajak?.id || "",
      pajak_nama: firstPajak?.nama || "",
      dasar_pajak: 100000000,
      jatuh_tempo: "",
      ref_dokumen: "",
      catatan: "",
    });
    setEditingTransaksiId(null);
    setShowTransaksiModal(true);
  };

  const openEditTransaksiModal = (trx: TransaksiPajak) => {
    setTransaksiForm({
      tanggal: trx.tanggal,
      pajak_id: trx.pajak_id,
      pajak_nama: trx.pajak_nama,
      dasar_pajak: trx.dasar_pajak,
      jatuh_tempo: trx.jatuh_tempo,
      ref_dokumen: trx.ref_dokumen || "",
      catatan: trx.catatan || "",
    });
    setEditingTransaksiId(trx.id);
    setShowTransaksiModal(true);
  };

  const saveTransaksi = () => {
    const pajak = pajakTypes.find((p) => p.id === transaksiForm.pajak_id);
    if (!pajak || !transaksiForm.jatuh_tempo) return;

    const jumlah_pajak = Math.round(
      (transaksiForm.dasar_pajak * pajak.persen) / 100
    );

    if (editingTransaksiId) {
      setTransaksiList((prev) =>
        prev.map((t) =>
          t.id === editingTransaksiId
            ? {
                ...t,
                ...transaksiForm,
                pajak_nama: pajak.nama,
                tarif: pajak.persen,
                jumlah_pajak,
              }
            : t
        )
      );
    } else {
      const newTrx: TransaksiPajak = {
        id: "tp" + Date.now(),
        no_trans: `PAJAK-${new Date().getFullYear()}${String(Date.now()).slice(-4)}`,
        pajak_nama: pajak.nama,
        tarif: pajak.persen,
        jumlah_pajak,
        status: "Belum Bayar",
        ...transaksiForm,
      };
      setTransaksiList((prev) => [newTrx, ...prev]);
    }
    setShowTransaksiModal(false);
    setEditingTransaksiId(null);
  };

  const deleteTransaksi = (id: string) => {
    if (!confirm("Hapus transaksi pajak ini?")) return;
    setTransaksiList((prev) => prev.filter((t) => t.id !== id));
  };

  const updateStatus = (id: string, newStatus: string) => {
    setTransaksiList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  // Helper for pajak select in transaksi form
  const handlePajakChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = pajakTypes.find((p) => p.id === e.target.value);
    if (selected) {
      setTransaksiForm((prev) => ({
        ...prev,
        pajak_id: selected.id,
        pajak_nama: selected.nama,
      }));
    }
  };

  // Auto calc helper (display only)
  const calculatedTax = () => {
    const pajak = pajakTypes.find((p) => p.id === transaksiForm.pajak_id);
    if (!pajak || transaksiForm.dasar_pajak <= 0) return 0;
    return Math.round((transaksiForm.dasar_pajak * pajak.persen) / 100);
  };

  // Stats
  const totalBelumBayar = transaksiList
    .filter((t) => t.status === "Belum Bayar")
    .reduce((sum, t) => sum + t.jumlah_pajak, 0);

  const totalSudahBayar = transaksiList
    .filter((t) => t.status === "Sudah Bayar")
    .reduce((sum, t) => sum + t.jumlah_pajak, 0);

  const jatuhTempoBulanIni = transaksiList.filter((t) => {
    const due = new Date(t.jatuh_tempo);
    const now = new Date();
    return (
      t.status === "Belum Bayar" &&
      due.getMonth() === now.getMonth() &&
      due.getFullYear() === now.getFullYear()
    );
  }).length;

  const totalTransaksi = transaksiList.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-900">Memuat Modul Pajak...</div>
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
                <Receipt size={26} className="text-emerald-600" /> Modul Pajak
              </h1>
              <p className="mt-1 text-sm text-slate-800">
                Manajemen pajak UMKM, PPh, PPN, PBB, dan lainnya. Siap integrasi dengan CoreTax DJP.
              </p>
            </div>
            <button
              onClick={() => {
                if (activeTab === "konfigurasi") openAddPajakModal();
                else if (activeTab === "transaksi") openAddTransaksiModal();
                else setActiveTab("transaksi");
              }}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm"
            >
              <Plus size={16} /> Tambah Data
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

        {/* Search & Filter */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input
              type="text"
              placeholder="Cari transaksi atau jenis pajak..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          {activeTab === "transaksi" && (
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="Belum Bayar">Belum Bayar</option>
                <option value="Sudah Bayar">Sudah Bayar</option>
                <option value="Terlambat">Terlambat</option>
              </select>
              <select
                value={jenisFilter}
                onChange={(e) => setJenisFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="all">Semua Jenis</option>
                <option value="UMKM">UMKM</option>
                <option value="PPh">PPh</option>
                <option value="PPN">PPN</option>
                <option value="PBB">PBB</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </>
          )}
        </div>

        {/* RINGKASAN */}
        {activeTab === "ringkasan" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Kewajiban Pajak</div>
                <div className="text-3xl font-semibold text-red-700 mt-1">
                  Rp {totalBelumBayar.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Sudah Dibayar</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">
                  Rp {totalSudahBayar.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Jatuh Tempo Bulan Ini</div>
                <div className="text-3xl font-semibold text-amber-700 mt-1">{jatuhTempoBulanIni}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Transaksi</div>
                <div className="text-3xl font-semibold text-slate-900 mt-1">{totalTransaksi}</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                <AlertTriangle size={20} /> Kewajiban Pajak yang Perlu Perhatian
              </h3>
              <div className="space-y-3">
                {transaksiList.filter((t) => t.status === "Belum Bayar").length > 0 ? (
                  transaksiList
                    .filter((t) => t.status === "Belum Bayar")
                    .slice(0, 4)
                    .map((trx) => (
                      <div key={trx.id} className="flex justify-between items-center p-4 border border-amber-200 bg-amber-50 rounded-2xl">
                        <div>
                          <div className="font-medium text-slate-900">{trx.no_trans} - {trx.pajak_nama}</div>
                          <div className="text-sm text-slate-800">Jatuh tempo: {trx.jatuh_tempo} • Ref: {trx.ref_dokumen || "-"}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-red-700">Rp {trx.jumlah_pajak.toLocaleString("id-ID")}</div>
                          <button
                            onClick={() => updateStatus(trx.id, "Sudah Bayar")}
                            className="text-xs text-emerald-700 hover:underline mt-1"
                          >
                            Tandai Sudah Bayar
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-slate-800">Tidak ada kewajiban pajak yang belum dibayar.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* KONFIGURASI PAJAK */}
        {activeTab === "konfigurasi" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddPajakModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Tambah Jenis Pajak Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Kode</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Nama Pajak</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Tarif (%)</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Jenis</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Keterangan</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPajak.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-800">Belum ada jenis pajak.</td>
                      </tr>
                    ) : (
                      filteredPajak.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono text-sm text-slate-900">{p.kode}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">{p.nama}</td>
                          <td className="px-5 py-4 text-center font-semibold text-emerald-700">{p.persen}%</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{p.jenis}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{p.keterangan || "-"}</td>
                          <td className="px-5 py-4 text-right space-x-1">
                            <button onClick={() => openEditPajakModal(p)} className="p-2 text-blue-700 hover:bg-blue-50 rounded-xl" title="Edit">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => deletePajak(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl" title="Hapus">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <strong>Catatan:</strong> Tarif di atas adalah default untuk demo. Di production, pastikan sesuai regulasi terbaru DJP. Integrasi CoreTax akan menggunakan API untuk validasi & pelaporan otomatis.
            </div>
          </div>
        )}

        {/* TRANSAKSI & PEMBAYARAN */}
        {activeTab === "transaksi" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddTransaksiModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Catat Transaksi Pajak Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. Trans</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Tanggal</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Jenis Pajak</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Dasar Pajak</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Jumlah Pajak</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Jatuh Tempo</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransaksi.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-slate-800">Belum ada transaksi pajak.</td>
                      </tr>
                    ) : (
                      filteredTransaksi.map((trx) => (
                        <tr key={trx.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono text-sm text-slate-900">{trx.no_trans}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{trx.tanggal}</td>
                          <td className="px-5 py-4 text-sm text-slate-900">{trx.pajak_nama}</td>
                          <td className="px-5 py-4 text-right text-sm text-slate-800">
                            Rp {trx.dasar_pajak.toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                            Rp {trx.jumlah_pajak.toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-800">{trx.jatuh_tempo}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              trx.status === "Sudah Bayar" ? "bg-emerald-100 text-emerald-800" :
                              trx.status === "Terlambat" ? "bg-red-100 text-red-800" :
                              "bg-amber-100 text-amber-800"
                            }`}>
                              {trx.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right space-x-1">
                            {trx.status === "Belum Bayar" && (
                              <button onClick={() => updateStatus(trx.id, "Sudah Bayar")} className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl" title="Tandai Sudah Bayar">
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button onClick={() => openEditTransaksiModal(trx)} className="p-2 text-blue-700 hover:bg-blue-50 rounded-xl" title="Edit">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => deleteTransaksi(trx.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl" title="Hapus">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <strong>Catatan:</strong> Saat simpan transaksi, jumlah pajak dihitung otomatis (Dasar × Tarif). Nanti saat integrasi CoreTax, data ini akan dikirim via API untuk pelaporan & validasi e-Faktur/e-Bupot.
            </div>
          </div>
        )}

        {/* LAPORAN PAJAK */}
        {activeTab === "laporan" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                <TrendingUp size={20} /> Ringkasan Kewajiban Pajak
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Jenis Pajak</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Total Kewajiban</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Sudah Dibayar</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Belum Dibayar</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Jumlah Transaksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pajakTypes.map((pajak) => {
                      const related = transaksiList.filter((t) => t.pajak_id === pajak.id);
                      const totalKew = related.reduce((sum, t) => sum + t.jumlah_pajak, 0);
                      const sudah = related.filter((t) => t.status === "Sudah Bayar").reduce((sum, t) => sum + t.jumlah_pajak, 0);
                      const belum = totalKew - sudah;
                      return (
                        <tr key={pajak.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-medium text-slate-900">{pajak.nama}</td>
                          <td className="px-5 py-4 text-right font-semibold text-slate-900">Rp {totalKew.toLocaleString("id-ID")}</td>
                          <td className="px-5 py-4 text-right text-emerald-700">Rp {sudah.toLocaleString("id-ID")}</td>
                          <td className="px-5 py-4 text-right font-semibold text-red-700">Rp {belum.toLocaleString("id-ID")}</td>
                          <td className="px-5 py-4 text-center text-sm text-slate-800">{related.length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 text-slate-900">Siap untuk CoreTax</h3>
              <div className="text-sm text-slate-800 space-y-2">
                <p>Modul ini sudah dirancang untuk integrasi API dengan <strong>CoreTax DJP</strong>:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Kirim data transaksi pajak untuk pelaporan e-Faktur / e-Bupot otomatis</li>
                  <li>Validasi NPWP & status wajib pajak secara real-time</li>
                  <li>Download bukti pembayaran & SPT dari CoreTax</li>
                  <li>Alert jatuh tempo & denda otomatis</li>
                </ul>
                <p className="mt-3 text-xs text-slate-700">* Fitur API akan diaktifkan setelah kredensial CoreTax tersedia.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pajak Config Modal */}
      {showPajakModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">{editingPajakId ? "Edit Jenis Pajak" : "Tambah Jenis Pajak Baru"}</h3>
              <button onClick={() => setShowPajakModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Kode Pajak</label>
                  <input value={pajakForm.kode} onChange={(e) => setPajakForm({ ...pajakForm, kode: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Tarif (%)</label>
                  <input type="number" step="0.1" value={pajakForm.persen} onChange={(e) => setPajakForm({ ...pajakForm, persen: parseFloat(e.target.value) || 0 })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Nama Pajak</label>
                <input value={pajakForm.nama} onChange={(e) => setPajakForm({ ...pajakForm, nama: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Jenis</label>
                <select value={pajakForm.jenis} onChange={(e) => setPajakForm({ ...pajakForm, jenis: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  <option value="UMKM">UMKM</option>
                  <option value="PPh">PPh</option>
                  <option value="PPN">PPN</option>
                  <option value="PBB">PBB</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Keterangan</label>
                <textarea value={pajakForm.keterangan} onChange={(e) => setPajakForm({ ...pajakForm, keterangan: e.target.value })} rows={2} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPajakModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={savePajak} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Transaksi Pajak Modal */}
      {showTransaksiModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">{editingTransaksiId ? "Edit Transaksi Pajak" : "Catat Transaksi Pajak Baru"}</h3>
              <button onClick={() => setShowTransaksiModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Jenis Pajak</label>
                <select value={transaksiForm.pajak_id} onChange={handlePajakChange} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  {pajakTypes.map((p) => (
                    <option key={p.id} value={p.id}>{p.nama} ({p.persen}%)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal</label>
                  <input type="date" value={transaksiForm.tanggal} onChange={(e) => setTransaksiForm({ ...transaksiForm, tanggal: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Jatuh Tempo</label>
                  <input type="date" value={transaksiForm.jatuh_tempo} onChange={(e) => setTransaksiForm({ ...transaksiForm, jatuh_tempo: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Dasar Pengenaan Pajak (Rp)</label>
                <input type="number" value={transaksiForm.dasar_pajak} onChange={(e) => setTransaksiForm({ ...transaksiForm, dasar_pajak: parseInt(e.target.value) || 0 })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <div className="text-xs text-slate-700">Jumlah Pajak yang Akan Dibayar:</div>
                <div className="text-2xl font-semibold text-emerald-700">
                  Rp {calculatedTax().toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-slate-600">Otomatis dihitung dari Dasar × Tarif</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Referensi Dokumen</label>
                <input value={transaksiForm.ref_dokumen} onChange={(e) => setTransaksiForm({ ...transaksiForm, ref_dokumen: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" placeholder="Contoh: INV-2026-0456" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Catatan</label>
                <textarea value={transaksiForm.catatan} onChange={(e) => setTransaksiForm({ ...transaksiForm, catatan: e.target.value })} rows={2} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowTransaksiModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveTransaksi} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan Transaksi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
