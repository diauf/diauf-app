"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Sidebar from "../component/Sidebar";

import {
  ShoppingCart,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  X,
  Calendar,
  User,
  Package,
  Settings,
  FileText,
  Receipt,
  Bell,
} from "lucide-react";

type POItem = {
  id?: string;
  item_id: string | null;
  item_kode: string;
  item_nama: string;
  qty: number;
  harga: number;
  subtotal: number;
};

type PO = {
  id: string;
  no_po: string;
  tanggal: string;
  supplier_id: string;
  supplier_kode: string;
  supplier_nama: string;
  items: POItem[];
  total: number;
  status: string;
  catatan?: string;
  created_at?: string;
};

export default function PembelianPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tab system
  const [activeTab, setActiveTab] = useState<
    "ringkasan" | "permintaan" | "pesanan" | "penerimaan" | "faktur" | "retur" | "pembayaran"
  >("ringkasan");

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "permintaan", label: "Permintaan Pembelian" },
    { id: "pesanan", label: "Pesanan Pembelian" },
    { id: "penerimaan", label: "Penerimaan Barang" },
    { id: "faktur", label: "Faktur Pembelian" },
    { id: "retur", label: "Retur Pembelian" },
    { id: "pembayaran", label: "Pembayaran" },
  ] as const;

  // Master data (loaded once)
  const [supplierList, setSupplierList] = useState<any[]>([]);
  const [itemList, setItemList] = useState<any[]>([]);
  const [employeeList, setEmployeeList] = useState<any[]>([]); // for PR pemohon from SDM

  // ========== DATA PER DOKUMEN ==========

  // 1. Pesanan Pembelian (PO) - mulai kosong sebagai default
  const [poList, setPoList] = useState<PO[]>([]);

  // UI states untuk PO (Pesanan)
  const [poSearchTerm, setPoSearchTerm] = useState("");
  const [poStatusFilter, setPoStatusFilter] = useState("all");
  const [showPOModal, setShowPOModal] = useState(false);
  const [editingPOId, setEditingPOId] = useState<string | null>(null);
  const [poForm, setPoForm] = useState({
    no_po: "",
    tanggal: new Date().toISOString().split("T")[0],
    supplier_id: "",
    supplier_kode: "",
    supplier_nama: "",
    catatan: "",
    items: [] as POItem[],
  });

  // 2. Permintaan Pembelian (PR) - skeleton
  type PR = {
    id: string;
    no_pr: string;
    tanggal: string;
    requester: string;
    department: string;
    items: Array<{ item_kode: string; item_nama: string; qty: number; keperluan?: string }>;
    status: string;
  };
  const [prList, setPrList] = useState<PR[]>([]);
  const [showPRModal, setShowPRModal] = useState(false);
  const [prForm, setPrForm] = useState({
    pemohon_id: "",
    pemohon_nama: "",
    department: "",
    keperluan: "",
  });
  const [prLineItems, setPrLineItems] = useState<any[]>([]); // items for current PR being created

  const openPRModal = () => {
    setPrForm({
      pemohon_id: "",
      pemohon_nama: "",
      department: "",
      keperluan: "",
    });
    setPrLineItems([]);
    setShowPRModal(true);
  };

  const approvePR = (prId: string) => {
    setPrList((prev) =>
      prev.map((p) => (p.id === prId ? { ...p, status: "Approved" } : p))
    );
    // Optionally close the pending modal or show success
    alert("Permintaan Pembelian berhasil di-approve. Sekarang bisa ditarik ke Pesanan Pembelian.");
  };

  const [poSourcePRId, setPoSourcePRId] = useState<string | null>(null); // flag if PO items locked from a PR
  const [showPendingPRModal, setShowPendingPRModal] = useState(false);

  // Helpers for PO number (locked by year from tanggal)
  const getPoPrefix = (tanggal) => {
    if (!tanggal) {
      const d = new Date();
      return `PO-${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}-`;
    }
    const d = new Date(tanggal);
    return `PO-${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}-`;
  };

  const getPoSuffix = (noPo) => {
    if (!noPo) return '';
    const match = noPo.match(/(\d+)$/);
    return match ? match[1] : '';
  };

  // 3. Placeholder untuk dokumen lain (akan dikembangkan)
  const [penerimaanList, setPenerimaanList] = useState<any[]>([]);
  const [fakturList, setFakturList] = useState<any[]>([]);
  const [returList, setReturList] = useState<any[]>([]);
  const [pembayaranList, setPembayaranList] = useState<any[]>([]);

  // Load profile + masters
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, role, company_id")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);

          // Load suppliers & items for this company
          if (profileData.company_id) {
            const [{ data: suppliers }, { data: items }, { data: employees }] = await Promise.all([
              supabase
                .from("master_suppliers")
                .select("id, kode, nama")
                .eq("company_id", profileData.company_id)
                .order("nama"),
              supabase
                .from("master_items")
                .select("id, kode, nama")
                .eq("company_id", profileData.company_id)
                .order("nama"),
              supabase
                .from("employees")
                .select("id, kode, nama, departemen, jabatan")
                .eq("company_id", profileData.company_id)
                .order("nama"),
            ]);

            setSupplierList(suppliers || []);
            setItemList(items || []);
            setEmployeeList(employees || []);
          }
        }
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const filteredPOList = poList.filter((po) => {
    const matchesSearch =
      !poSearchTerm ||
      po.no_po.toLowerCase().includes(poSearchTerm.toLowerCase()) ||
      po.supplier_nama.toLowerCase().includes(poSearchTerm.toLowerCase());

    const matchesStatus = poStatusFilter === "all" || po.status === poStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const openAddPOModal = () => {
    setEditingPOId(null);
    setPoSourcePRId(null);
    const defaultTanggal = new Date().toISOString().split("T")[0];
    const prefix = getPoPrefix(defaultTanggal);
    // find next available for this month.year
    const existingThisMonth = poList.filter(p => p.no_po.startsWith(prefix));
    let max = 0;
    existingThisMonth.forEach(p => {
      const num = parseInt(getPoSuffix(p.no_po)) || 0;
      if (num > max) max = num;
    });
    const nextSuffix = String(max + 1).padStart(3, '0');
    setPoForm({
      no_po: prefix + nextSuffix,
      tanggal: defaultTanggal,
      supplier_id: "",
      supplier_kode: "",
      supplier_nama: "",
      catatan: "",
      items: [],
    });
    setShowPOModal(true);
  };

  const openEditPOModal = (po: PO) => {
    setEditingPOId(po.id);
    setPoForm({
      no_po: po.no_po,
      tanggal: po.tanggal,
      supplier_id: po.supplier_id,
      supplier_kode: po.supplier_kode,
      supplier_nama: po.supplier_nama,
      catatan: po.catatan || "",
      items: [...po.items],
    });
    setShowPOModal(true);
  };

  const closePOModal = () => {
    setShowPOModal(false);
    setEditingPOId(null);
    setPoSourcePRId(null);
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const supId = e.target.value;
    const sup = supplierList.find((s) => s.id === supId);
    if (sup) {
      setPoForm((prev) => ({
        ...prev,
        supplier_id: sup.id,
        supplier_kode: sup.kode || "",
        supplier_nama: sup.nama || "",
      }));
    } else {
      setPoForm((prev) => ({
        ...prev,
        supplier_id: "",
        supplier_kode: "",
        supplier_nama: "",
      }));
    }
  };

  const addLineItem = () => {
    setPoForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_id: null,
          item_kode: "",
          item_nama: "",
          qty: 1,
          harga: 0,
          subtotal: 0,
        },
      ],
    }));
  };

  const updateLineItem = (index: number, field: keyof POItem, value: any) => {
    setPoForm((prev) => {
      const newItems = [...prev.items];
      const line = { ...newItems[index] };

      if (field === "item_id") {
        const it = itemList.find((i) => i.id === value);
        if (it) {
          line.item_id = it.id;
          line.item_kode = it.kode || "";
          line.item_nama = it.nama || "";
        }
      } else if (field === "qty") {
        line.qty = parseInt(value) || 1;
      } else if (field === "harga") {
        line.harga = parseFloat(value) || 0;
      }

      line.subtotal = line.qty * line.harga;
      newItems[index] = line;

      return { ...prev, items: newItems };
    });
  };

  const removeLineItem = (index: number) => {
    setPoForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotal = (items: POItem[]) => {
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const handleSavePO = async () => {
    if (!poForm.supplier_id) {
      alert("Pilih supplier terlebih dahulu.");
      return;
    }
    if (poForm.items.length === 0) {
      alert("Tambahkan minimal 1 item.");
      return;
    }

    // Uniqueness check for nomor PO
    const existing = poList.find(p => 
      p.no_po === poForm.no_po && p.id !== editingPOId
    );
    if (existing) {
      alert(`Nomor PO "${poForm.no_po}" sudah digunakan.`);
      return;
    }

    const total = calculateTotal(poForm.items);

    const newPO: PO = {
      id: editingPOId || `po-${Date.now()}`,
      no_po: poForm.no_po,
      tanggal: poForm.tanggal,
      supplier_id: poForm.supplier_id,
      supplier_kode: poForm.supplier_kode,
      supplier_nama: poForm.supplier_nama,
      items: poForm.items,
      total,
      status: editingPOId
        ? poList.find((p) => p.id === editingPOId)?.status || "Draft"
        : "Draft",
      catatan: poForm.catatan,
    };

    if (editingPOId) {
      setPoList((prev) =>
        prev.map((p) => (p.id === editingPOId ? newPO : p))
      );
    } else {
      setPoList((prev) => [newPO, ...prev]);
    }

    if (poSourcePRId) {
      setPrList((prev) =>
        prev.map((p) => (p.id === poSourcePRId ? { ...p, status: "Converted to PO" } : p))
      );
    }

    closePOModal();

    // TODO: Integrasikan ke Supabase
    // await supabase.from("purchase_orders").upsert(...)
    // await supabase.from("purchase_order_items").insert(...)
  };

  const handleDeletePO = async (po: PO) => {
    if (!confirm(`Hapus ${po.no_po}?`)) return;
    setPoList((prev) => prev.filter((p) => p.id !== po.id));
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const getStatusBadge = (status: string) => {
    const base = "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium";
    if (status === "Draft")
      return `${base} bg-slate-100 text-slate-700`;
    if (status === "Dikirim")
      return `${base} bg-blue-100 text-blue-700`;
    if (status === "Diterima")
      return `${base} bg-emerald-100 text-emerald-700`;
    if (status === "Selesai")
      return `${base} bg-emerald-500 text-white`;
    return `${base} bg-slate-100 text-slate-700`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Memuat Modul Pembelian...</div>
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
        className={`p-8 transition-all duration-300 ${
          collapsed ? "ml-24" : "ml-72"
        }`}
      >
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
                <ShoppingCart size={26} className="text-emerald-600" /> Modul Pembelian
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Permintaan → Pesanan → Penerimaan → Faktur → Pembayaran. Terhubung dengan Master Supplier, Item, dan Harga.
              </p>
            </div>

            {/* Pintasan Setting Supplier */}
            <Link
              href="/data-master?tab=supplier"
              className="group flex items-center gap-2 px-1 py-1 rounded-xl transition"
              title="Setting Supplier"
            >
              <span className="text-sm font-medium text-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap -mr-1 group-hover:mr-1">
                Setting Supplier
              </span>
              <div className="w-9 h-9 flex items-center justify-center bg-emerald-500 text-white rounded-full group-hover:bg-emerald-600 group-hover:scale-105 transition-all shadow-sm">
                <Settings size={20} />
              </div>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 border-b border-slate-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-2xl transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-600 bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ==================== RINGKASAN ==================== */}
        {activeTab === "ringkasan" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-600">Total Pesanan Pembelian</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1">{poList.length}</div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-600">Total Nilai Pembelian</div>
                <div className="text-2xl font-semibold text-emerald-600 mt-1">
                  Rp {formatRupiah(poList.reduce((s, p) => s + p.total, 0))}
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-600">PR Belum Jadi PO</div>
                <div className="text-2xl font-semibold text-amber-600 mt-1">{prList.length}</div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-600">Supplier Terdaftar</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1">{supplierList.length}</div>
              </div>
            </div>

            {/* Aksi Cepat - Clean, Minimalis, Elegant & Professional */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6 tracking-tight">Aksi Cepat</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Buat Permintaan Pembelian */}
                <button
                  onClick={() => setActiveTab("permintaan")}
                  className="flex items-center gap-4 px-6 py-5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-left transition-all hover:shadow-sm group"
                >
                  <div className="flex items-center justify-center w-9 h-9 bg-slate-100 text-slate-600 rounded-full flex-shrink-0">
                    <FileText size={18} />
                  </div>
                  <span className="font-medium text-slate-800 text-[15px]">Buat Permintaan Pembelian</span>
                </button>

                {/* 2. Buat Pesanan Pembelian (PO) — Prominent */}
                <button
                  onClick={() => { setActiveTab("pesanan"); openAddPOModal(); }}
                  className="flex items-center gap-4 px-6 py-5 bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-500 hover:border-emerald-600 rounded-2xl text-left transition-all shadow-sm hover:shadow-md group"
                >
                  <div className="flex items-center justify-center w-9 h-9 bg-white/20 text-white rounded-full flex-shrink-0">
                    <ShoppingCart size={18} />
                  </div>
                  <span className="font-medium text-[15px]">Buat Pesanan Pembelian (PO)</span>
                </button>

                {/* 3. Catat Penerimaan Barang */}
                <button
                  onClick={() => setActiveTab("penerimaan")}
                  className="flex items-center gap-4 px-6 py-5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-left transition-all hover:shadow-sm group"
                >
                  <div className="flex items-center justify-center w-9 h-9 bg-slate-100 text-slate-600 rounded-full flex-shrink-0">
                    <Package size={18} />
                  </div>
                  <span className="font-medium text-slate-800 text-[15px]">Catat Penerimaan Barang</span>
                </button>

                {/* 4. Buat Faktur Pembelian */}
                <button
                  onClick={() => setActiveTab("faktur")}
                  className="flex items-center gap-4 px-6 py-5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-left transition-all hover:shadow-sm group"
                >
                  <div className="flex items-center justify-center w-9 h-9 bg-slate-100 text-slate-600 rounded-full flex-shrink-0">
                    <Receipt size={18} />
                  </div>
                  <span className="font-medium text-slate-800 text-[15px]">Buat Faktur Pembelian</span>
                </button>
              </div>
            </div>

            <div className="text-sm text-slate-600">
              Pilih tab di atas untuk mengelola dokumen pembelian secara lengkap.
            </div>
          </div>
        )}

        {/* ==================== PERMINTAAN PEMBELIAN ==================== */}
        {activeTab === "permintaan" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Permintaan Pembelian (PR)</h2>
                <p className="text-sm text-slate-700">Bisa dikonversi jadi PO setelah di-approve.</p>
              </div>
              <button
                onClick={openPRModal}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl"
              >
                <Plus size={16} /> Buat Permintaan Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
              {prList.length === 0 ? (
                <div className="text-center py-10 text-slate-700">
                  Belum ada permintaan pembelian.<br />
                  Klik tombol di atas untuk membuat PR pertama.
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-slate-700">No. PR</th>
                      <th className="px-5 py-3 text-left text-slate-700">Tanggal</th>
                      <th className="px-5 py-3 text-left text-slate-700">Status</th>
                      <th className="px-5 py-3 text-right text-slate-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {prList.map((pr: any) => (
                      <tr key={pr.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono text-slate-800">{pr.no_pr}</td>
                        <td className="px-5 py-3 text-slate-800">{pr.tanggal}</td>
                        <td className="px-5 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">{pr.status}</span></td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => { setActiveTab("pesanan"); openAddPOModal(); /* TODO: prefill dari PR */ }} className="text-emerald-600 text-sm hover:underline">Buat PO dari PR ini</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ==================== PESANAN PEMBELIAN (PO) - Core ==================== */}
        {activeTab === "pesanan" && (
          <div>
            {/* Notifikasi Pending PR untuk Approval */}
            {prList.filter((p: any) => p.status === "Pending Approval").length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setShowPendingPRModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                >
                  <Bell size={16} />
                  Ada {prList.filter((p: any) => p.status === "Pending Approval").length} Permintaan Pembelian menunggu Approval
                </button>
              </div>
            )}

            {/* Quick stats khusus PO */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-600">Total PO</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1">{poList.length}</div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-600">Total Pembelian</div>
                <div className="text-2xl font-semibold text-emerald-600 mt-1">
                  Rp {formatRupiah(poList.reduce((s, p) => s + p.total, 0))}
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-600">Dalam Proses</div>
                <div className="text-2xl font-semibold text-blue-600 mt-1">
                  {poList.filter((p) => p.status !== "Selesai").length}
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-600">Supplier Aktif</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1">{supplierList.length}</div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap gap-3 flex-1">
                <div className="relative flex-1 min-w-[260px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input
                    type="text"
                    placeholder="Cari nomor PO atau nama supplier..."
                    value={poSearchTerm}
                    onChange={(e) => setPoSearchTerm(e.target.value)}
                    className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>

                <select
                  value={poStatusFilter}
                  onChange={(e) => setPoStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="all">Semua Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Dikirim">Dikirim</option>
                  <option value="Diterima">Diterima</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <button
                onClick={openAddPOModal}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm ml-3 whitespace-nowrap"
              >
                <Plus size={16} /> Buat Pesanan Pembelian
              </button>
            </div>

            {/* Table PO */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">No. PO</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Tanggal</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Supplier</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-600">Total</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-600">Status</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPOList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-600">
                          Belum ada Purchase Order. Buat PO baru di tombol kanan.
                        </td>
                      </tr>
                    ) : (
                      filteredPOList.map((po) => (
                        <tr key={po.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono font-medium text-slate-900">{po.no_po}</td>
                          <td className="px-5 py-4 text-slate-700">{po.tanggal}</td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-900">{po.supplier_nama}</div>
                            <div className="text-xs font-mono text-emerald-700">{po.supplier_kode}</div>
                          </td>
                          <td className="px-5 py-4 text-right font-mono font-semibold text-emerald-700">
                            Rp {formatRupiah(po.total)}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={getStatusBadge(po.status)}>{po.status}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => openEditPOModal(po)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition"
                                title="Edit / Lihat Detail"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDeletePO(po)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition"
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

            <div className="mt-4 text-xs text-slate-600">
              Pesanan Pembelian adalah dokumen utama. Nanti dari sini bisa langsung "Catat Penerimaan" atau buat Faktur.
            </div>
          </div>
        )}

        {/* ==================== PENERIMAAN BARANG ==================== */}
        {activeTab === "penerimaan" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Penerimaan Barang</h2>
                <p className="text-sm text-slate-600">Catat barang yang diterima dari PO. Bisa update stok &amp; buat faktur.</p>
              </div>
              <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl">
                <Plus size={16} /> Catat Penerimaan
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-600">
              Belum ada data penerimaan. <br />
              Nanti di sini akan muncul list penerimaan yang terhubung ke PO, dengan fitur partial receipt dan update harga beli aktual.
            </div>
          </div>
        )}

        {/* ==================== FAKTUR PEMBELIAN ==================== */}
        {activeTab === "faktur" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Faktur Pembelian</h2>
                <p className="text-sm text-slate-600">Invoice dari supplier. Bisa dari penerimaan atau langsung dari PO.</p>
              </div>
              <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl">
                <Plus size={16} /> Buat Faktur Pembelian
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-600">
              List faktur pembelian (AP Invoice) akan tampil di sini. Terintegrasi dengan akuntansi (COA Hutang &amp; Persediaan).
            </div>
          </div>
        )}

        {/* ==================== RETUR & PEMBAYARAN (skeleton) */}
        {activeTab === "retur" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Retur Pembelian</h2>
            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-600">
              Fitur retur barang ke supplier (credit note). Akan terhubung ke Faktur dan stok.
            </div>
          </div>
        )}

        {activeTab === "pembayaran" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Pembayaran Pembelian</h2>
            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-600">
              Pembayaran ke supplier (bisa dari Kas/Bank). Bisa partial payment per faktur.
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-slate-600">
          Data disimpan lokal untuk demo. Nanti diintegrasikan penuh ke database + koneksi antar modul (termasuk SDM untuk pemohon).
        </div>
      </main>

      {/* PO Add/Edit Modal */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold text-slate-900">
                {editingPOId ? "Edit Purchase Order" : "Buat Purchase Order Baru"}
              </h3>
              <button onClick={closePOModal} className="text-slate-600 hover:text-slate-700">
                <X size={22} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Nomor PO</label>
                <div className="flex max-w-[260px]">
                  <div className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-sm font-mono text-emerald-700 flex items-center select-none whitespace-nowrap min-w-[108px]">
                    {getPoPrefix(poForm.tanggal)}
                  </div>
                  <input
                    type="text"
                    value={getPoSuffix(poForm.no_po).padStart(3, '0')}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      const prefix = getPoPrefix(poForm.tanggal);
                      const newNo = prefix + digits.padStart(3, '0');
                      setPoForm((prev) => ({ ...prev, no_po: newNo }));
                    }}
                    className="flex-1 border border-slate-300 rounded-r-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600 font-mono"
                    placeholder="001"
                  />
                </div>
                <p className="text-[10px] text-emerald-600 mt-1">Hanya angka belakang yang bisa diubah. Harus unik.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Tanggal PO</label>
                <input
                  type="date"
                  value={poForm.tanggal}
                  onChange={(e) => {
                    const newTanggal = e.target.value;
                    const suffix = getPoSuffix(poForm.no_po);
                    const newPrefix = getPoPrefix(newTanggal);
                    const newNo = newPrefix + (suffix || '001').padStart(3, '0');
                    setPoForm((prev) => ({
                      ...prev,
                      tanggal: newTanggal,
                      no_po: newNo,
                    }));
                  }}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-800 mb-1">Supplier</label>
                <select
                  value={poForm.supplier_id}
                  onChange={handleSupplierChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-white text-slate-900"
                >
                  <option value="">-- Pilih Supplier --</option>
                  {supplierList.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.kode} — {sup.nama}
                    </option>
                  ))}
                </select>
                {supplierList.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">Belum ada supplier. Tambahkan di Data Master &gt; Master Supplier.</p>
                )}
              </div>
            </div>

            {/* Tarik dari Permintaan Pembelian (Approved) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-800 mb-1">Tarik dari Permintaan Pembelian (Approved)</label>
              <select
                value={poSourcePRId || ""}
                onChange={(e) => {
                  const prId = e.target.value;
                  if (!prId) {
                    setPoSourcePRId(null);
                    return;
                  }
                  const pr = prList.find((p: any) => p.id === prId);
                  if (!pr) return;
                  const mapped = (pr.items || []).map((it: any) => ({
                    item_id: "",
                    item_kode: it.item_kode,
                    item_nama: it.item_nama,
                    qty: it.qty,
                    harga: 0,
                    subtotal: 0,
                  }));
                  setPoForm((prev) => ({ ...prev, items: mapped }));
                  setPoSourcePRId(prId);
                }}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white text-slate-900"
              >
                <option value="">-- Pilih Nomor PR (Approved) --</option>
                {prList
                  .filter((p: any) => p.status === "Approved")
                  .map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.no_pr} — {p.requester} ({p.department})
                    </option>
                  ))}
              </select>
              {poSourcePRId && (
                <div className="mt-1 text-xs text-emerald-600">
                  Item &amp; Jumlah dikunci dari PR ini. Harga masih bisa diisi.
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="mb-3 flex items-center justify-between">
              <div className="font-medium text-slate-800">Item Pembelian</div>
              <button
                onClick={addLineItem}
                disabled={!!poSourcePRId}
                className="text-sm flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              >
                <Plus size={15} /> Tambah Item
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left w-2/5 text-slate-700">Item Barang</th>
                    <th className="px-4 py-2 text-right text-slate-700">Qty</th>
                    <th className="px-4 py-2 text-right text-slate-700">Harga</th>
                    <th className="px-4 py-2 text-right text-slate-700">Subtotal</th>
                    <th className="px-4 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {poForm.items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-600">
                        Belum ada item. Klik "Tambah Item".
                      </td>
                    </tr>
                  )}

                  {poForm.items.map((line, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2.5">
                        <select
                          value={line.item_id || ""}
                          disabled={!!poSourcePRId}
                          onChange={(e) => updateLineItem(idx, "item_id", e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm text-slate-900 disabled:bg-slate-100"
                        >
                          <option value="">Pilih Item...</option>
                          {itemList.map((it) => (
                            <option key={it.id} value={it.id}>
                              {it.kode} — {it.nama}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          min={1}
                          value={line.qty}
                          disabled={!!poSourcePRId}
                          onChange={(e) => updateLineItem(idx, "qty", e.target.value)}
                          className="w-24 border border-slate-300 rounded-lg px-2 py-1 text-sm text-right text-slate-900 disabled:bg-slate-100"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={line.harga}
                          onChange={(e) => updateLineItem(idx, "harga", e.target.value)}
                          className="w-32 border border-slate-300 rounded-lg px-2 py-1 text-sm text-right text-slate-900"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-emerald-700">
                        {formatRupiah(line.subtotal)}
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <button
                          onClick={() => removeLineItem(idx)}
                          disabled={!!poSourcePRId}
                          className="p-1 text-red-500 hover:bg-red-50 rounded disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mb-5">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Catatan / Syarat</label>
                <input
                  type="text"
                  value={poForm.catatan}
                  onChange={(e) => setPoForm({ ...poForm, catatan: e.target.value })}
                  placeholder="Contoh: Pembayaran 30 hari setelah diterima"
                  className="w-80 border border-slate-300 rounded-xl px-3 py-2 text-sm placeholder:text-slate-600 text-slate-900"
                />
              </div>

              <div className="text-right">
                <div className="text-sm text-slate-700">Grand Total</div>
                <div className="text-3xl font-semibold text-emerald-700">
                  Rp {formatRupiah(calculateTotal(poForm.items))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <button
                onClick={closePOModal}
                className="px-5 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                Batal
              </button>
              <button
                onClick={handleSavePO}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 font-medium"
              >
                {editingPOId ? "Simpan Perubahan" : "Simpan Purchase Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple PR Modal (placeholder for now) */}
      {showPRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Buat Permintaan Pembelian (PR)</h3>
              <button onClick={() => setShowPRModal(false)} className="text-slate-500 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Line Items dari Master Item - dipindah ke atas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-800">Item yang Diminta</label>
                  <button
                    type="button"
                    onClick={() => {
                      setPrLineItems([
                        ...prLineItems,
                        { item_id: "", item_kode: "", item_nama: "", qty: 1 },
                      ]);
                    }}
                    className="text-sm px-3 py-1 bg-white border border-emerald-300 text-emerald-700 rounded-xl hover:bg-emerald-50 flex items-center gap-1"
                  >
                    <Plus size={14} /> Tambah Item
                  </button>
                </div>

                {prLineItems.length === 0 && (
                  <div className="text-xs text-slate-600 italic">Belum ada item. Tambahkan dari Master Item.</div>
                )}

                {prLineItems.length > 0 && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-slate-700">Item Barang</th>
                          <th className="px-3 py-2 text-right w-24 text-slate-700">Qty</th>
                          <th className="px-2 py-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {prLineItems.map((line, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2">
                              <select
                                value={line.item_id}
                                onChange={(e) => {
                                  const it = itemList.find((i: any) => i.id === e.target.value);
                                  const newItems = [...prLineItems];
                                  newItems[idx] = {
                                    ...newItems[idx],
                                    item_id: e.target.value,
                                    item_kode: it ? it.kode : "",
                                    item_nama: it ? it.nama : "",
                                  };
                                  setPrLineItems(newItems);
                                }}
                                className="w-full border border-slate-300 rounded-lg px-2 py-1 text-sm bg-white text-slate-900"
                              >
                                <option value="">Pilih Item...</option>
                                {itemList.map((it: any) => (
                                  <option key={it.id} value={it.id}>
                                    {it.kode} — {it.nama}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="1"
                                value={line.qty}
                                onChange={(e) => {
                                  const newItems = [...prLineItems];
                                  newItems[idx] = { ...newItems[idx], qty: parseInt(e.target.value) || 1 };
                                  setPrLineItems(newItems);
                                }}
                                className="w-full border border-slate-300 rounded-lg px-2 py-1 text-sm text-right text-slate-900"
                              />
                            </td>
                            <td className="px-2 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setPrLineItems(prLineItems.filter((_, i) => i !== idx));
                                }}
                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Keperluan / Deskripsi - dipindah ke bawah */}
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-800">Keperluan / Deskripsi</label>
                <textarea
                  value={prForm.keperluan}
                  onChange={(e) => setPrForm({ ...prForm, keperluan: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 h-20 text-slate-900 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                  placeholder="Deskripsi kebutuhan pembelian..."
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setShowPRModal(false)} className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900">Batal</button>
              <button
                onClick={() => {
                  if (!prForm.keperluan.trim()) {
                    alert("Isi keperluan / deskripsi.");
                    return;
                  }
                  if (prLineItems.length === 0 || prLineItems.some((l) => !l.item_id)) {
                    alert("Tambahkan minimal 1 item dengan pilihan yang valid.");
                    return;
                  }

                  const newPR: any = {
                    id: "pr-" + Date.now(),
                    no_pr: "PR-" + new Date().getFullYear() + "-" + String(prList.length + 1).padStart(3, "0"),
                    tanggal: new Date().toISOString().split("T")[0],
                    requester: "", // dihapus dari form
                    department: "", // dihapus dari form
                    items: prLineItems.map((l) => ({
                      item_kode: l.item_kode,
                      item_nama: l.item_nama,
                      qty: l.qty,
                    })),
                    status: "Pending Approval",
                  };
                  setPrList((prev) => [newPR, ...prev]);
                  setShowPRModal(false);
                  setActiveTab("permintaan");
                  // reset
                  setPrForm({ pemohon_id: "", pemohon_nama: "", department: "", keperluan: "" });
                  setPrLineItems([]);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm"
              >
                Simpan Permintaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending PR Approval Modal (opened from Pesanan tab) */}
      {showPendingPRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Permintaan Pembelian Menunggu Approval</h3>
              <button onClick={() => setShowPendingPRModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {prList.filter((p: any) => p.status === "Pending Approval").length === 0 ? (
              <div className="text-center py-8 text-slate-500">Tidak ada permintaan yang menunggu approval.</div>
            ) : (
              <div className="space-y-3">
                {prList
                  .filter((p: any) => p.status === "Pending Approval")
                  .map((pr: any) => (
                    <div key={pr.id} className="border border-slate-200 rounded-2xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-mono text-emerald-700 font-semibold">{pr.no_pr}</div>
                          <div className="text-sm">Pemohon: {pr.requester} • {pr.department}</div>
                          <div className="text-xs text-slate-500 mt-1">Tanggal: {pr.tanggal}</div>
                        </div>
                        <button
                          onClick={() => approvePR(pr.id)}
                          className="px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"
                        >
                          Approve
                        </button>
                      </div>
                      <div className="mt-2 text-sm">
                        <div className="font-medium text-xs text-slate-500">Item:</div>
                        <ul className="text-sm list-disc ml-4">
                          {pr.items.map((it: any, i: number) => (
                            <li key={i}>
                              {it.item_kode} — {it.item_nama} × {it.qty}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
