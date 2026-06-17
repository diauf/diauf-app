"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Sidebar from "../component/Sidebar";

import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Calendar,
  User,
  Package,
  Receipt,
  ShoppingCart,
  ArrowLeftRight,
  Wallet,
  ExternalLink,
} from "lucide-react";

type SOItem = {
  item_id: string | null;
  item_kode: string;
  item_nama: string;
  qty: number;
  harga: number;
  subtotal: number;
};

type SalesOrder = {
  id: string;
  no_so: string;
  tanggal: string;
  customer_id: string;
  customer_kode: string;
  customer_nama: string;
  items: SOItem[];
  total: number;
  status: string;
  catatan?: string;
  source_pr_id?: string | null; // for future if needed, but for sales maybe from quotation
};

type Quotation = {
  id: string;
  no_quotation: string;
  tanggal: string;
  customer_id: string;
  customer_kode: string;
  customer_nama: string;
  items: SOItem[];
  total: number;
  status: string;
};

export default function PenjualanPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Master data
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [itemList, setItemList] = useState<any[]>([]);
  const [hargaList, setHargaList] = useState<any[]>([]); // selling prices

  // Data per dokumen
  const [quotationList, setQuotationList] = useState<Quotation[]>([]);
  const [soList, setSoList] = useState<SalesOrder[]>([]);
  const [deliveryList, setDeliveryList] = useState<any[]>([]);
  const [invoiceList, setInvoiceList] = useState<any[]>([]);
  const [returnList, setReturnList] = useState<any[]>([]);
  const [paymentList, setPaymentList] = useState<any[]>([]);

  // UI states
  const [activeTab, setActiveTab] = useState<"ringkasan" | "penawaran" | "pesanan" | "pengiriman" | "faktur" | "retur" | "pembayaran">("ringkasan");

  const [soSearchTerm, setSoSearchTerm] = useState("");
  const [soStatusFilter, setSoStatusFilter] = useState("all");

  const [showSOModal, setShowSOModal] = useState(false);
  const [editingSOId, setEditingSOId] = useState<string | null>(null);
  const [soForm, setSoForm] = useState({
    no_so: "",
    tanggal: new Date().toISOString().split("T")[0],
    customer_id: "",
    customer_kode: "",
    customer_nama: "",
    catatan: "",
    items: [] as SOItem[],
  });

  const [showQuotationModal, setShowQuotationModal] = useState(false);

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

          if (profileData.company_id) {
            const [{ data: customers }, { data: items }, { data: hargas }] = await Promise.all([
              supabase
                .from("master_customers")
                .select("id, kode, nama")
                .eq("company_id", profileData.company_id)
                .order("nama"),
              supabase
                .from("master_items")
                .select("id, kode, nama")
                .eq("company_id", profileData.company_id)
                .order("nama"),
              supabase
                .from("master_harga")
                .select("*")
                .eq("company_id", profileData.company_id)
                .order("berlaku_mulai", { ascending: false }),
            ]);

            setCustomerList(customers || []);
            setItemList(items || []);
            setHargaList(hargas || []);
          }
        }
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "penawaran", label: "Penawaran" },
    { id: "pesanan", label: "Pesanan Penjualan" },
    { id: "pengiriman", label: "Pengiriman" },
    { id: "faktur", label: "Faktur Penjualan" },
    { id: "retur", label: "Retur Penjualan" },
    { id: "pembayaran", label: "Penerimaan Pembayaran" },
  ] as const;

  const filteredSOList = soList.filter((so) => {
    const matchesSearch =
      !soSearchTerm ||
      so.no_so.toLowerCase().includes(soSearchTerm.toLowerCase()) ||
      so.customer_nama.toLowerCase().includes(soSearchTerm.toLowerCase());
    const matchesStatus = soStatusFilter === "all" || so.status === soStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const getSellingPrice = (itemId: string, customerId: string | null) => {
    // Prefer customer specific, then general (customer_id null)
    const applicable = hargaList.filter((h: any) => 
      h.item_id === itemId && 
      (h.customer_id === customerId || !h.customer_id)
    );
    // Sort by berlaku_mulai desc, then prefer specific customer
    applicable.sort((a: any, b: any) => {
      if (a.customer_id && !b.customer_id) return -1;
      if (!a.customer_id && b.customer_id) return 1;
      return new Date(b.berlaku_mulai).getTime() - new Date(a.berlaku_mulai).getTime();
    });
    return applicable.length > 0 ? applicable[0].harga : 0;
  };

  const openAddSOModal = () => {
    const nextNumber = String(soList.length + 1).padStart(3, "0");
    setEditingSOId(null);
    setSoForm({
      no_so: `SO-${new Date().getFullYear()}-${nextNumber}`,
      tanggal: new Date().toISOString().split("T")[0],
      customer_id: "",
      customer_kode: "",
      customer_nama: "",
      catatan: "",
      items: [],
    });
    setShowSOModal(true);
  };

  const openEditSOModal = (so: SalesOrder) => {
    setEditingSOId(so.id);
    setSoForm({
      no_so: so.no_so,
      tanggal: so.tanggal,
      customer_id: so.customer_id,
      customer_kode: so.customer_kode,
      customer_nama: so.customer_nama,
      catatan: so.catatan || "",
      items: [...so.items],
    });
    setShowSOModal(true);
  };

  const closeSOModal = () => {
    setShowSOModal(false);
    setEditingSOId(null);
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    const cust = customerList.find((c: any) => c.id === custId);
    if (cust) {
      setSoForm((prev) => ({
        ...prev,
        customer_id: cust.id,
        customer_kode: cust.kode || "",
        customer_nama: cust.nama || "",
      }));
    } else {
      setSoForm((prev) => ({
        ...prev,
        customer_id: "",
        customer_kode: "",
        customer_nama: "",
      }));
    }
  };

  const addLineItemSO = () => {
    setSoForm((prev) => ({
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

  const updateLineItemSO = (index: number, field: keyof SOItem, value: any) => {
    setSoForm((prev) => {
      const newItems = [...prev.items];
      const line = { ...newItems[index] };

      if (field === "item_id") {
        const it = itemList.find((i: any) => i.id === value);
        if (it) {
          line.item_id = it.id;
          line.item_kode = it.kode || "";
          line.item_nama = it.nama || "";
          // auto price
          line.harga = getSellingPrice(it.id, prev.customer_id);
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

  const removeLineItemSO = (index: number) => {
    setSoForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotalSO = (items: SOItem[]) => {
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const handleSaveSO = async () => {
    if (!profile?.company_id) return;

    if (!soForm.customer_id) {
      alert("Pilih customer terlebih dahulu.");
      return;
    }
    if (soForm.items.length === 0) {
      alert("Tambahkan minimal 1 item.");
      return;
    }

    const total = calculateTotalSO(soForm.items);

    const newSO: SalesOrder = {
      id: editingSOId || `so-${Date.now()}`,
      no_so: soForm.no_so,
      tanggal: soForm.tanggal,
      customer_id: soForm.customer_id,
      customer_kode: soForm.customer_kode,
      customer_nama: soForm.customer_nama,
      items: soForm.items,
      total,
      status: editingSOId
        ? soList.find((s) => s.id === editingSOId)?.status || "Draft"
        : "Draft",
      catatan: soForm.catatan,
    };

    if (editingSOId) {
      setSoList((prev) =>
        prev.map((s) => (s.id === editingSOId ? newSO : s))
      );
    } else {
      setSoList((prev) => [newSO, ...prev]);
    }

    closeSOModal();

    // TODO: Integrasikan ke Supabase
  };

  const handleDeleteSO = async (so: SalesOrder) => {
    if (!confirm(`Hapus ${so.no_so}?`)) return;
    setSoList((prev) => prev.filter((s) => s.id !== so.id));
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
        <div className="text-slate-600">Memuat Modul Penjualan...</div>
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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
                <FileText size={26} className="text-emerald-600" /> Modul Penjualan
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Kelola Penawaran, Pesanan Penjualan, Pengiriman, Faktur, Retur, dan Penerimaan Pembayaran. Terhubung dengan Master Customer, Item, dan Harga Jual.
              </p>
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
                  ? "border-emerald-500 text-emerald-600 bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* RINGKASAN */}
        {activeTab === "ringkasan" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-700">Total Pesanan Penjualan</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1">{soList.length}</div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-700">Total Nilai Penjualan</div>
                <div className="text-2xl font-semibold text-emerald-600 mt-1">
                  Rp {formatRupiah(soList.reduce((s, so) => s + so.total, 0))}
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-700">Dalam Proses</div>
                <div className="text-2xl font-semibold text-blue-600 mt-1">
                  {soList.filter((so) => so.status !== "Selesai").length}
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-700">Customer Terdaftar</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1">{customerList.length}</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6 tracking-tight">Aksi Cepat</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab("penawaran")}
                  className="flex items-center gap-4 px-6 py-5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-left transition-all hover:shadow-sm group"
                >
                  <div className="flex items-center justify-center w-9 h-9 bg-slate-100 text-slate-600 rounded-full flex-shrink-0">
                    <FileText size={18} />
                  </div>
                  <span className="font-medium text-slate-800 text-[15px]">Buat Penawaran</span>
                </button>

                <button
                  onClick={openAddSOModal}
                  className="flex items-center gap-4 px-6 py-5 bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-500 hover:border-emerald-600 rounded-2xl text-left transition-all shadow-sm hover:shadow-md group"
                >
                  <div className="flex items-center justify-center w-9 h-9 bg-white/20 text-white rounded-full flex-shrink-0">
                    <ShoppingCart size={18} />
                  </div>
                  <span className="font-medium text-[15px]">Buat Pesanan Penjualan</span>
                </button>

                <button
                  onClick={() => setActiveTab("pengiriman")}
                  className="flex items-center gap-4 px-6 py-5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-left transition-all hover:shadow-sm group"
                >
                  <div className="flex items-center justify-center w-9 h-9 bg-slate-100 text-slate-600 rounded-full flex-shrink-0">
                    <Package size={18} />
                  </div>
                  <span className="font-medium text-slate-800 text-[15px]">Catat Pengiriman</span>
                </button>

                <button
                  onClick={() => setActiveTab("faktur")}
                  className="flex items-center gap-4 px-6 py-5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-left transition-all hover:shadow-sm group"
                >
                  <div className="flex items-center justify-center w-9 h-9 bg-slate-100 text-slate-600 rounded-full flex-shrink-0">
                    <Receipt size={18} />
                  </div>
                  <span className="font-medium text-slate-800 text-[15px]">Buat Faktur Penjualan</span>
                </button>
              </div>
            </div>

            <div className="text-sm text-slate-700">
              Pilih tab di atas untuk mengelola dokumen penjualan secara lengkap.
            </div>
          </div>
        )}

        {/* PENAWARAN */}
        {activeTab === "penawaran" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Penawaran (Quotation)</h2>
                <p className="text-sm text-slate-600">Buat penawaran harga ke customer. Bisa dikonversi ke Pesanan Penjualan.</p>
              </div>
              <button
                onClick={() => setShowQuotationModal(true)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl"
              >
                <Plus size={16} /> Buat Penawaran Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-600">
              {quotationList.length === 0 ? (
                <div className="text-center py-8">
                  Belum ada penawaran.<br />
                  Klik tombol di atas untuk membuat quotation pertama.
                </div>
              ) : (
                <div>Table penawaran akan ditampilkan di sini (akan dikembangkan selanjutnya, mirip PR di pembelian).</div>
              )}
            </div>
          </div>
        )}

        {/* PESANAN PENJUALAN */}
        {activeTab === "pesanan" && (
          <div>
            {/* Quick stats khusus SO */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-600">Total Pesanan Penjualan</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1">{soList.length}</div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-600">Total Nilai Penjualan</div>
                <div className="text-2xl font-semibold text-emerald-600 mt-1">
                  Rp {formatRupiah(soList.reduce((s, so) => s + so.total, 0))}
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-600">Dalam Proses</div>
                <div className="text-2xl font-semibold text-blue-600 mt-1">
                  {soList.filter((so) => so.status !== "Selesai").length}
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-600">Customer Aktif</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1">{customerList.length}</div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap gap-3 flex-1">
                <div className="relative flex-1 min-w-[260px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input
                    type="text"
                    placeholder="Cari nomor SO atau nama customer..."
                    value={soSearchTerm}
                    onChange={(e) => setSoSearchTerm(e.target.value)}
                    className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>

                <select
                  value={soStatusFilter}
                  onChange={(e) => setSoStatusFilter(e.target.value)}
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
                onClick={openAddSOModal}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm ml-3 whitespace-nowrap"
              >
                <Plus size={16} /> Buat Pesanan Penjualan
              </button>

              {/* Tombol Portal Penjualan (DIAUF-GO.ID) - buka di tab baru */}
              <Link
                href="/diauf-go"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#041833] hover:bg-[#0a2540] text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm ml-3 whitespace-nowrap"
              >
                <ExternalLink size={16} /> Portal Penjualan
              </Link>
            </div>

            {/* Table SO */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">No. SO</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Tanggal</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Customer</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-600">Total</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-600">Status</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSOList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                          Belum ada Pesanan Penjualan. Buat SO baru di tombol kanan.
                        </td>
                      </tr>
                    ) : (
                      filteredSOList.map((so) => (
                        <tr key={so.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono font-medium text-slate-900">{so.no_so}</td>
                          <td className="px-5 py-4 text-slate-700">{so.tanggal}</td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-900">{so.customer_nama}</div>
                            <div className="text-xs font-mono text-emerald-700">{so.customer_kode}</div>
                          </td>
                          <td className="px-5 py-4 text-right font-mono font-semibold text-emerald-700">
                            Rp {formatRupiah(so.total)}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={getStatusBadge(so.status)}>{so.status}</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => openEditSOModal(so)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteSO(so)}
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
              Pesanan Penjualan adalah dokumen utama. Bisa dibuat dari Penawaran atau manual. Nanti bisa lanjut ke Pengiriman dan Faktur.
            </div>
          </div>
        )}

        {/* PENGIRIMAN */}
        {activeTab === "pengiriman" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Pengiriman / Delivery</h2>
                <p className="text-sm text-slate-600">Catat pengiriman barang dari Pesanan Penjualan.</p>
              </div>
              <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl">
                <Plus size={16} /> Catat Pengiriman
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-600">
              Belum ada data pengiriman. <br />
              Nanti di sini akan muncul list pengiriman yang terhubung ke SO.
            </div>
          </div>
        )}

        {/* FAKTUR PENJUALAN */}
        {activeTab === "faktur" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Faktur Penjualan</h2>
                <p className="text-sm text-slate-600">Invoice ke customer. Bisa dari pengiriman atau langsung dari SO.</p>
              </div>
              <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl">
                <Plus size={16} /> Buat Faktur Penjualan
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-600">
              List faktur penjualan akan tampil di sini. Terintegrasi dengan akuntansi (COA Piutang &amp; Pendapatan).
            </div>
          </div>
        )}

        {/* RETUR & PEMBAYARAN */}
        {activeTab === "retur" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Retur Penjualan</h2>
            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-600">
              Fitur retur barang dari customer (credit note). Akan terhubung ke Faktur dan stok.
            </div>
          </div>
        )}

        {activeTab === "pembayaran" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Penerimaan Pembayaran</h2>
            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-600">
              Penerimaan pembayaran dari customer (bisa dari Kas/Bank). Bisa partial payment per faktur.
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-slate-600">
          Data disimpan lokal untuk demo. Nanti diintegrasikan penuh ke database + koneksi antar modul (termasuk SDM untuk pemohon jika relevan, dan master harga untuk harga jual).
        </div>
      </main>

      {/* SO Add/Edit Modal */}
      {showSOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold text-slate-900">
                {editingSOId ? "Edit Pesanan Penjualan" : "Buat Pesanan Penjualan Baru"}
              </h3>
              <button onClick={closeSOModal} className="text-slate-400 hover:text-slate-600">
                <X size={22} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Nomor SO</label>
                <input
                  type="text"
                  value={soForm.no_so}
                  onChange={(e) => setSoForm({ ...soForm, no_so: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Tanggal SO</label>
                <input
                  type="date"
                  value={soForm.tanggal}
                  onChange={(e) => setSoForm({ ...soForm, tanggal: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-800 mb-1">Customer</label>
                <select
                  value={soForm.customer_id}
                  onChange={handleCustomerChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-white text-slate-900"
                >
                  <option value="">-- Pilih Customer --</option>
                  {customerList.map((cust) => (
                    <option key={cust.id} value={cust.id}>
                      {cust.kode} — {cust.nama}
                    </option>
                  ))}
                </select>
                {customerList.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">Belum ada customer. Tambahkan di Data Master &gt; Master Customer.</p>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-3 flex items-center justify-between">
              <div className="font-medium text-slate-800">Item Penjualan</div>
              <button
                onClick={addLineItemSO}
                className="text-sm flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <Plus size={15} /> Tambah Item
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left w-2/5">Item Barang</th>
                    <th className="px-4 py-2 text-right">Qty</th>
                    <th className="px-4 py-2 text-right">Harga Jual</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                    <th className="px-4 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {soForm.items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-600">
                        Belum ada item. Klik "Tambah Item".
                      </td>
                    </tr>
                  )}

                  {soForm.items.map((line, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2.5">
                        <select
                          value={line.item_id || ""}
                          onChange={(e) => updateLineItemSO(idx, "item_id", e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm text-slate-900"
                        >
                          <option value="">Pilih Item...</option>
                          {itemList.map((it: any) => (
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
                          onChange={(e) => updateLineItemSO(idx, "qty", e.target.value)}
                          className="w-24 border border-slate-300 rounded-lg px-2 py-1 text-sm text-right text-slate-900"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={line.harga}
                          onChange={(e) => updateLineItemSO(idx, "harga", e.target.value)}
                          className="w-32 border border-slate-300 rounded-lg px-2 py-1 text-sm text-right text-slate-900"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-emerald-700">
                        {formatRupiah(line.subtotal)}
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <button
                          onClick={() => removeLineItemSO(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
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
                <label className="block text-sm font-medium text-slate-800 mb-1">Catatan</label>
                <input
                  type="text"
                  value={soForm.catatan}
                  onChange={(e) => setSoForm({ ...soForm, catatan: e.target.value })}
                  placeholder="Contoh: Pengiriman segera"
                  className="w-80 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div className="text-right">
                <div className="text-sm text-slate-500">Grand Total</div>
                <div className="text-3xl font-semibold text-emerald-700">
                  Rp {formatRupiah(calculateTotalSO(soForm.items))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <button
                onClick={closeSOModal}
                className="px-5 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSaveSO}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 font-medium"
              >
                {editingSOId ? "Simpan Perubahan" : "Simpan Pesanan Penjualan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Quotation Modal placeholder */}
      {showQuotationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Buat Penawaran (Quotation)</h3>
              <button onClick={() => setShowQuotationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <p className="text-slate-600">Form penawaran akan dikembangkan mirip form Pesanan Penjualan, dengan opsi konversi ke SO.</p>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setShowQuotationModal(false)} className="px-4 py-2 rounded-xl border text-sm">Batal</button>
              <button
                onClick={() => {
                  // Demo add quotation
                  const newQ: Quotation = {
                    id: "q-" + Date.now(),
                    no_quotation: "QT-" + new Date().getFullYear() + "-" + String(quotationList.length + 1).padStart(3, "0"),
                    tanggal: new Date().toISOString().split("T")[0],
                    customer_id: customerList[0]?.id || "",
                    customer_kode: customerList[0]?.kode || "",
                    customer_nama: customerList[0]?.nama || "Demo Customer",
                    items: [],
                    total: 0,
                    status: "Aktif",
                  };
                  setQuotationList((prev) => [newQ, ...prev]);
                  setShowQuotationModal(false);
                  setActiveTab("penawaran");
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm"
              >
                Simpan Penawaran (Demo)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
