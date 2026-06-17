"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../component/Sidebar";

import {
  Wallet,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

type Rekening = {
  id: string;
  kode: string;
  nama: string;
  bank: string;
  no_rekening: string;
  jenis: "Kas" | "Bank";
  saldo: number;
  mata_uang: string;
};

type Transaksi = {
  id: string;
  tanggal: string;
  no_trans: string;
  rekening_id: string;
  rekening_nama: string;
  jenis: "Masuk" | "Keluar";
  nominal: number;
  keterangan: string;
  ref_dokumen?: string;
  rekonsiliasi?: boolean;
};

export default function KasBankPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "ringkasan" | "rekening" | "transaksi" | "transfer" | "rekonsiliasi"
  >("ringkasan");

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "rekening", label: "Rekening Kas & Bank" },
    { id: "transaksi", label: "Transaksi / Mutasi" },
    { id: "transfer", label: "Transfer Antar Rekening" },
    { id: "rekonsiliasi", label: "Rekonsiliasi Bank" },
  ] as const;

  // Data
  const [rekeningList, setRekeningList] = useState<Rekening[]>([
    {
      id: "r1",
      kode: "KAS-001",
      nama: "Kas Besar",
      bank: "-",
      no_rekening: "-",
      jenis: "Kas",
      saldo: 125000000,
      mata_uang: "IDR",
    },
    {
      id: "r2",
      kode: "BNK-001",
      nama: "Rekening Operasional",
      bank: "BCA",
      no_rekening: "1234567890",
      jenis: "Bank",
      saldo: 487500000,
      mata_uang: "IDR",
    },
    {
      id: "r3",
      kode: "BNK-002",
      nama: "Rekening Gaji",
      bank: "Mandiri",
      no_rekening: "9876543210",
      jenis: "Bank",
      saldo: 92000000,
      mata_uang: "IDR",
    },
  ]);

  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([
    {
      id: "t1",
      tanggal: "2026-06-15",
      no_trans: "TRX-20260615-001",
      rekening_id: "r2",
      rekening_nama: "Rekening Operasional",
      jenis: "Masuk",
      nominal: 125000000,
      keterangan: "Penerimaan dari Penjualan SO-2026-0142",
      ref_dokumen: "SO-2026-0142",
      rekonsiliasi: true,
    },
    {
      id: "t2",
      tanggal: "2026-06-15",
      no_trans: "TRX-20260615-002",
      rekening_id: "r1",
      rekening_nama: "Kas Besar",
      jenis: "Keluar",
      nominal: 45000000,
      keterangan: "Pembayaran gaji karyawan periode Juni 2026",
      ref_dokumen: "PAY-2026-06",
      rekonsiliasi: false,
    },
    {
      id: "t3",
      tanggal: "2026-06-14",
      no_trans: "TRX-20260614-001",
      rekening_id: "r2",
      rekening_nama: "Rekening Operasional",
      jenis: "Keluar",
      nominal: 18750000,
      keterangan: "Pembayaran ke supplier PO-2026-089",
      ref_dokumen: "PO-2026-089",
      rekonsiliasi: true,
    },
  ]);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [rekeningFilter, setRekeningFilter] = useState("all");
  const [jenisFilter, setJenisFilter] = useState("all");

  // Modals
  const [showRekeningModal, setShowRekeningModal] = useState(false);
  const [showTransaksiModal, setShowTransaksiModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingRekeningId, setEditingRekeningId] = useState<string | null>(null);
  const [editingTransaksiId, setEditingTransaksiId] = useState<string | null>(null);
  const [editingTransferId, setEditingTransferId] = useState<string | null>(null);

  const [transferList, setTransferList] = useState<any[]>([]);

  // Forms
  const [rekeningForm, setRekeningForm] = useState({
    kode: "",
    nama: "",
    bank: "",
    no_rekening: "",
    jenis: "Bank" as "Kas" | "Bank",
    mata_uang: "IDR",
  });

  const [transaksiForm, setTransaksiForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    rekening_id: "",
    jenis: "Masuk" as "Masuk" | "Keluar",
    nominal: 0,
    keterangan: "",
    ref_dokumen: "",
  });

  const [transferForm, setTransferForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    from_rekening_id: "",
    to_rekening_id: "",
    nominal: 0,
    keterangan: "",
  });

  // Load profile (simplified like other modules)
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        // Demo profile
        setProfile({ name: "Admin Demo", role: "Keuangan" });
      } catch (err) {
        console.error(err);
        setProfile({ name: "Admin Demo", role: "Keuangan" });
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  // Filtered data
  const filteredRekening = rekeningList.filter((r) =>
    r.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.bank.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransaksi = transaksiList.filter((t) => {
    const matchSearch =
      t.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.no_trans.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRekening = rekeningFilter === "all" || t.rekening_id === rekeningFilter;
    const matchJenis = jenisFilter === "all" || t.jenis === jenisFilter;
    return matchSearch && matchRekening && matchJenis;
  });

  // Stats
  const totalKas = rekeningList
    .filter((r) => r.jenis === "Kas")
    .reduce((sum, r) => sum + r.saldo, 0);
  const totalBank = rekeningList
    .filter((r) => r.jenis === "Bank")
    .reduce((sum, r) => sum + r.saldo, 0);
  const totalSaldo = totalKas + totalBank;

  const mutasiHariIni = transaksiList
    .filter((t) => t.tanggal === new Date().toISOString().split("T")[0])
    .reduce((sum, t) => (t.jenis === "Masuk" ? sum + t.nominal : sum - t.nominal), 0);

  // Handlers
  const openAddRekeningModal = () => {
    setRekeningForm({
      kode: "",
      nama: "",
      bank: "",
      no_rekening: "",
      jenis: "Bank",
      mata_uang: "IDR",
    });
    setEditingRekeningId(null);
    setShowRekeningModal(true);
  };

  const openEditRekeningModal = (rek: Rekening) => {
    setRekeningForm({
      kode: rek.kode,
      nama: rek.nama,
      bank: rek.bank,
      no_rekening: rek.no_rekening,
      jenis: rek.jenis,
      mata_uang: rek.mata_uang,
    });
    setEditingRekeningId(rek.id);
    setShowRekeningModal(true);
  };

  const saveRekening = () => {
    if (!rekeningForm.nama || !rekeningForm.kode) return;

    if (editingRekeningId) {
      setRekeningList((prev) =>
        prev.map((r) =>
          r.id === editingRekeningId
            ? { ...r, ...rekeningForm }
            : r
        )
      );
    } else {
      const newRek: Rekening = {
        id: "rek-" + Date.now(),
        ...rekeningForm,
        saldo: 0,
      };
      setRekeningList((prev) => [newRek, ...prev]);
    }
    setShowRekeningModal(false);
    setEditingRekeningId(null);
  };

  const deleteRekening = (id: string) => {
    if (!confirm("Hapus rekening ini?")) return;
    setRekeningList((prev) => prev.filter((r) => r.id !== id));
  };

  const openAddTransaksiModal = () => {
    const firstRek = rekeningList[0];
    setTransaksiForm({
      tanggal: new Date().toISOString().split("T")[0],
      rekening_id: firstRek?.id || "",
      jenis: "Masuk",
      nominal: 0,
      keterangan: "",
      ref_dokumen: "",
    });
    setEditingTransaksiId(null);
    setShowTransaksiModal(true);
  };

  const saveTransaksi = () => {
    if (!transaksiForm.keterangan || transaksiForm.nominal <= 0) return;

    const rek = rekeningList.find((r) => r.id === transaksiForm.rekening_id);
    if (!rek) return;

    if (editingTransaksiId) {
      setTransaksiList((prev) =>
        prev.map((t) =>
          t.id === editingTransaksiId ? { ...t, ...transaksiForm, rekening_nama: rek.nama } : t
        )
      );
    } else {
      const newTrx: Transaksi = {
        id: "trx-" + Date.now(),
        no_trans: `TRX-${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
        rekening_nama: rek.nama,
        rekonsiliasi: false,
        ...transaksiForm,
      };
      setTransaksiList((prev) => [newTrx, ...prev]);

      // Update saldo rekening (demo only)
      setRekeningList((prev) =>
        prev.map((r) => {
          if (r.id === transaksiForm.rekening_id) {
            const newSaldo =
              transaksiForm.jenis === "Masuk"
                ? r.saldo + transaksiForm.nominal
                : r.saldo - transaksiForm.nominal;
            return { ...r, saldo: Math.max(0, newSaldo) };
          }
          return r;
        })
      );
    }
    setShowTransaksiModal(false);
    setEditingTransaksiId(null);
  };

  const deleteTransaksi = (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    setTransaksiList((prev) => prev.filter((t) => t.id !== id));
  };

  const openAddTransferModal = () => {
    const firstRek = rekeningList[0];
    const secondRek = rekeningList[1] || rekeningList[0];
    setTransferForm({
      tanggal: new Date().toISOString().split("T")[0],
      from_rekening_id: firstRek?.id || "",
      to_rekening_id: secondRek?.id || "",
      nominal: 0,
      keterangan: "",
    });
    setEditingTransferId(null);
    setShowTransferModal(true);
  };

  const saveTransfer = () => {
    if (!transferForm.keterangan || transferForm.nominal <= 0) return;
    if (transferForm.from_rekening_id === transferForm.to_rekening_id) {
      alert("Rekening asal dan tujuan tidak boleh sama.");
      return;
    }

    const fromRek = rekeningList.find((r) => r.id === transferForm.from_rekening_id);
    const toRek = rekeningList.find((r) => r.id === transferForm.to_rekening_id);
    if (!fromRek || !toRek) return;

    const newTransfer = {
      id: "tf-" + Date.now(),
      tanggal: transferForm.tanggal,
      from_rekening_id: transferForm.from_rekening_id,
      from_rekening_nama: fromRek.nama,
      to_rekening_id: transferForm.to_rekening_id,
      to_rekening_nama: toRek.nama,
      nominal: transferForm.nominal,
      keterangan: transferForm.keterangan,
    };

    setTransferList((prev) => [newTransfer, ...prev]);

    // Update saldos
    setRekeningList((prev) =>
      prev.map((r) => {
        if (r.id === transferForm.from_rekening_id) {
          return { ...r, saldo: Math.max(0, r.saldo - transferForm.nominal) };
        }
        if (r.id === transferForm.to_rekening_id) {
          return { ...r, saldo: r.saldo + transferForm.nominal };
        }
        return r;
      })
    );

    // Also log as two transaksi for history
    const outTrx = {
      id: "trx-" + Date.now() + "-out",
      tanggal: transferForm.tanggal,
      no_trans: `TRF-${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
      rekening_id: transferForm.from_rekening_id,
      rekening_nama: fromRek.nama,
      jenis: "Keluar" as const,
      nominal: transferForm.nominal,
      keterangan: `Transfer ke ${toRek.nama} - ${transferForm.keterangan}`,
      ref_dokumen: newTransfer.id,
      rekonsiliasi: false,
    };

    const inTrx = {
      id: "trx-" + Date.now() + "-in",
      tanggal: transferForm.tanggal,
      no_trans: `TRF-${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
      rekening_id: transferForm.to_rekening_id,
      rekening_nama: toRek.nama,
      jenis: "Masuk" as const,
      nominal: transferForm.nominal,
      keterangan: `Transfer dari ${fromRek.nama} - ${transferForm.keterangan}`,
      ref_dokumen: newTransfer.id,
      rekonsiliasi: false,
    };

    setTransaksiList((prev) => [inTrx, outTrx, ...prev]);

    setShowTransferModal(false);
    setEditingTransferId(null);
  };

  const deleteTransfer = (id: string) => {
    if (!confirm("Hapus transfer ini? (Akan membatalkan efek saldo)")) return;
    // For simplicity in demo, just remove from list (saldo not reversed)
    setTransferList((prev) => prev.filter((t) => t.id !== id));
  };

  const reconcileTransaksi = (id: string) => {
    setTransaksiList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, rekonsiliasi: true } : t))
    );
  };

  // Filter rekening for select
  const availableRekening = rekeningList;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-900">Memuat Modul Kas & Bank...</div>
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
                <Wallet size={26} className="text-emerald-600" /> Modul Kas & Bank
              </h1>
              <p className="mt-1 text-sm text-slate-800">
                Kelola rekening kas dan bank, transaksi harian, serta rekonsiliasi. Terintegrasi dengan pembelian dan penjualan.
              </p>
            </div>
            <button
              onClick={() => {
                if (activeTab === "rekening") openAddRekeningModal();
                else if (activeTab === "transaksi") openAddTransaksiModal();
                else if (activeTab === "transfer") openAddTransferModal();
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

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input
              type="text"
              placeholder="Cari rekening atau transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          {activeTab === "transaksi" && (
            <>
              <select
                value={rekeningFilter}
                onChange={(e) => setRekeningFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="all">Semua Rekening</option>
                {rekeningList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama}
                  </option>
                ))}
              </select>
              <select
                value={jenisFilter}
                onChange={(e) => setJenisFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="all">Semua Jenis</option>
                <option value="Masuk">Masuk</option>
                <option value="Keluar">Keluar</option>
              </select>
            </>
          )}
        </div>

        {/* RINGKASAN */}
        {activeTab === "ringkasan" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Saldo Kas</div>
                <div className="text-3xl font-semibold text-slate-900 mt-1">
                  Rp {totalKas.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Saldo Bank</div>
                <div className="text-3xl font-semibold text-slate-900 mt-1">
                  Rp {totalBank.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Saldo Bersih</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">
                  Rp {totalSaldo.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Mutasi Hari Ini</div>
                <div className={`text-3xl font-semibold mt-1 ${mutasiHariIni >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                  {mutasiHariIni >= 0 ? "+" : ""}Rp {Math.abs(mutasiHariIni).toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                <RefreshCw size={20} /> Mutasi Terbaru
              </h3>
              <div className="space-y-3">
                {transaksiList.slice(0, 5).map((trx) => (
                  <div key={trx.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      {trx.jenis === "Masuk" ? (
                        <ArrowUpCircle className="text-emerald-600" size={20} />
                      ) : (
                        <ArrowDownCircle className="text-red-600" size={20} />
                      )}
                      <div>
                        <div className="font-medium text-slate-900">{trx.keterangan}</div>
                        <div className="text-xs text-slate-700">
                          {trx.tanggal} • {trx.rekening_nama}
                        </div>
                      </div>
                    </div>
                    <div className={`font-semibold ${trx.jenis === "Masuk" ? "text-emerald-700" : "text-red-700"}`}>
                      {trx.jenis === "Masuk" ? "+" : "-"} Rp {trx.nominal.toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
                {transaksiList.length === 0 && (
                  <div className="text-center py-8 text-slate-700">Belum ada transaksi.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REKENING */}
        {activeTab === "rekening" && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={openAddRekeningModal}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition"
              >
                <Plus size={16} /> Tambah Rekening Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Kode</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Nama Rekening</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Bank</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. Rekening</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Jenis</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Saldo</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRekening.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-700">
                          Belum ada rekening.
                        </td>
                      </tr>
                    ) : (
                      filteredRekening.map((rek) => (
                        <tr key={rek.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono text-sm text-slate-900">{rek.kode}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">{rek.nama}</td>
                          <td className="px-5 py-4 text-slate-800">{rek.bank}</td>
                          <td className="px-5 py-4 font-mono text-sm text-slate-900">{rek.no_rekening}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${rek.jenis === "Kas" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                              {rek.jenis}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                            Rp {rek.saldo.toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={() => openEditRekeningModal(rek)} className="p-2 text-blue-700 hover:bg-blue-50 rounded-xl" title="Edit">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => deleteRekening(rek.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl ml-1" title="Hapus">
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
          </div>
        )}

        {/* TRANSAKSI */}
        {activeTab === "transaksi" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddTransaksiModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Catat Transaksi Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">No. Trans</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Tanggal</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Rekening</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Keterangan</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Nominal</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransaksi.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-700">
                          Belum ada transaksi.
                        </td>
                      </tr>
                    ) : (
                      filteredTransaksi.map((trx) => (
                        <tr key={trx.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono text-sm text-slate-900">{trx.no_trans}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{trx.tanggal}</td>
                          <td className="px-5 py-4 text-sm text-slate-900">{trx.rekening_nama}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{trx.keterangan}</td>
                          <td className={`px-5 py-4 text-right font-semibold ${trx.jenis === "Masuk" ? "text-emerald-700" : "text-red-700"}`}>
                            {trx.jenis === "Masuk" ? "+" : "-"} Rp {trx.nominal.toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${trx.rekonsiliasi ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                              {trx.rekonsiliasi ? "Sudah Rekonsiliasi" : "Belum"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right space-x-1">
                            <button onClick={() => reconcileTransaksi(trx.id)} disabled={trx.rekonsiliasi} className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl disabled:opacity-50" title="Rekonsiliasi">
                              <CheckCircle size={16} />
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
          </div>
        )}

        {/* TRANSFER ANTAR REKENING */}
        {activeTab === "transfer" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddTransferModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Buat Transfer Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Tanggal</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Dari</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Ke</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Keterangan</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Nominal</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transferList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-700">
                          Belum ada transfer antar rekening.
                        </td>
                      </tr>
                    ) : (
                      transferList.map((tf) => (
                        <tr key={tf.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 text-sm text-slate-800">{tf.tanggal}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">{tf.from_rekening_nama}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">{tf.to_rekening_nama}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{tf.keterangan}</td>
                          <td className="px-5 py-4 text-right font-semibold text-blue-700">
                            Rp {tf.nominal.toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={() => deleteTransfer(tf.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl" title="Hapus">
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
          </div>
        )}

        {/* REKONSILIASI */}
        {activeTab === "rekonsiliasi" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-xl text-slate-900">Rekonsiliasi Bank</h3>
                <p className="text-sm text-slate-800 mt-1">Cocokkan transaksi bank statement dengan catatan internal.</p>
              </div>
              <button className="flex items-center gap-2 border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-2xl text-sm font-medium text-slate-900">
                <RefreshCw size={16} /> Impor Statement Bank (Demo)
              </button>
            </div>

            <div className="space-y-4">
              {transaksiList.filter((t) => !t.rekonsiliasi && t.rekening_nama.includes("Bank")).length > 0 ? (
                transaksiList
                  .filter((t) => !t.rekonsiliasi && t.rekening_nama.includes("Bank"))
                  .map((trx) => (
                    <div key={trx.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl">
                      <div>
                        <div className="font-medium text-slate-900">{trx.keterangan}</div>
                        <div className="text-sm text-slate-800">{trx.tanggal} • {trx.no_trans}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`font-semibold ${trx.jenis === "Masuk" ? "text-emerald-700" : "text-red-700"}`}>
                          {trx.jenis === "Masuk" ? "+" : "-"} Rp {trx.nominal.toLocaleString("id-ID")}
                        </div>
                        <button onClick={() => reconcileTransaksi(trx.id)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-2xl font-medium">
                          Rekonsiliasi
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-12 text-slate-800">Semua transaksi bank sudah direkonsiliasi.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rekening Modal */}
      {showRekeningModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">{editingRekeningId ? "Edit Rekening" : "Tambah Rekening Baru"}</h3>
              <button onClick={() => setShowRekeningModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Kode Rekening</label>
                  <input value={rekeningForm.kode} onChange={(e) => setRekeningForm({ ...rekeningForm, kode: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Jenis</label>
                  <select value={rekeningForm.jenis} onChange={(e) => setRekeningForm({ ...rekeningForm, jenis: e.target.value as any })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                    <option value="Kas">Kas</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Nama Rekening</label>
                <input value={rekeningForm.nama} onChange={(e) => setRekeningForm({ ...rekeningForm, nama: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Nama Bank</label>
                  <input value={rekeningForm.bank} onChange={(e) => setRekeningForm({ ...rekeningForm, bank: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">No. Rekening</label>
                  <input value={rekeningForm.no_rekening} onChange={(e) => setRekeningForm({ ...rekeningForm, no_rekening: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRekeningModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveRekening} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Transaksi Modal */}
      {showTransaksiModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">{editingTransaksiId ? "Edit Transaksi" : "Catat Transaksi Baru"}</h3>
              <button onClick={() => setShowTransaksiModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Rekening</label>
                <select value={transaksiForm.rekening_id} onChange={(e) => setTransaksiForm({ ...transaksiForm, rekening_id: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  {availableRekening.map((r) => (
                    <option key={r.id} value={r.id}>{r.nama} ({r.jenis})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Jenis</label>
                  <select value={transaksiForm.jenis} onChange={(e) => setTransaksiForm({ ...transaksiForm, jenis: e.target.value as any })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                    <option value="Masuk">Masuk</option>
                    <option value="Keluar">Keluar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal</label>
                  <input type="date" value={transaksiForm.tanggal} onChange={(e) => setTransaksiForm({ ...transaksiForm, tanggal: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Nominal</label>
                <input type="number" value={transaksiForm.nominal} onChange={(e) => setTransaksiForm({ ...transaksiForm, nominal: Number(e.target.value) })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Keterangan</label>
                <input value={transaksiForm.keterangan} onChange={(e) => setTransaksiForm({ ...transaksiForm, keterangan: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Referensi Dokumen</label>
                <input value={transaksiForm.ref_dokumen} onChange={(e) => setTransaksiForm({ ...transaksiForm, ref_dokumen: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" placeholder="Contoh: SO-2026-0142" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowTransaksiModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveTransaksi} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan Transaksi</button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">Transfer Antar Rekening</h3>
              <button onClick={() => setShowTransferModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Dari Rekening</label>
                <select value={transferForm.from_rekening_id} onChange={(e) => setTransferForm({ ...transferForm, from_rekening_id: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  {availableRekening.map((r) => (
                    <option key={r.id} value={r.id}>{r.nama} ({r.jenis})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Ke Rekening</label>
                <select value={transferForm.to_rekening_id} onChange={(e) => setTransferForm({ ...transferForm, to_rekening_id: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  {availableRekening.map((r) => (
                    <option key={r.id} value={r.id}>{r.nama} ({r.jenis})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal</label>
                  <input type="date" value={transferForm.tanggal} onChange={(e) => setTransferForm({ ...transferForm, tanggal: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Nominal</label>
                  <input type="number" value={transferForm.nominal} onChange={(e) => setTransferForm({ ...transferForm, nominal: Number(e.target.value) })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Keterangan</label>
                <input value={transferForm.keterangan} onChange={(e) => setTransferForm({ ...transferForm, keterangan: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" placeholder="Contoh: Transfer operasional bulanan" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowTransferModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveTransfer} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Proses Transfer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
