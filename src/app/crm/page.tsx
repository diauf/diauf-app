"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "../component/Sidebar";

import {
  UsersRound,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  Clock,
  Target,
} from "lucide-react";

// Types
type Customer = {
  id: string;
  kode: string;
  nama: string;
  email?: string;
  telepon?: string;
  alamat?: string;
  segment?: string;
  status?: string;
  nilaiTotal?: number;
  lastContact?: string;
};

type Lead = {
  id: string;
  nama: string;
  perusahaan?: string;
  email?: string;
  telepon?: string;
  sumber: string;
  status: string;
  assignedTo?: string;
  tanggal: string;
  catatan?: string;
};

type Opportunity = {
  id: string;
  customerId: string;
  customerNama: string;
  judul: string;
  tahap: string;
  nilai: number;
  probabilitas: number;
  tanggalTutup: string;
  assignedTo?: string;
  catatan?: string;
};

type Activity = {
  id: string;
  tanggal: string;
  jenis: string; // Call, Meeting, Email, Note, Follow-up
  customerId: string;
  customerNama: string;
  catatan: string;
  outcome?: string;
  nextAction?: string;
};

export default function CRMPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<
    "ringkasan" | "pelanggan" | "prospek" | "peluang" | "aktivitas"
  >("ringkasan");

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "pelanggan", label: "Pelanggan" },
    { id: "prospek", label: "Prospek / Leads" },
    { id: "peluang", label: "Peluang / Opportunities" },
    { id: "aktivitas", label: "Aktivitas & Interaksi" },
  ] as const;

  // Master data
  const [customerList, setCustomerList] = useState<Customer[]>([]);

  // CRM Data (demo + integrated with master customers)
  const [leadList, setLeadList] = useState<Lead[]>([
    {
      id: "l1",
      nama: "Andi Wijaya",
      perusahaan: "CV Maju Bersama",
      email: "andi@majubersama.com",
      telepon: "081234567890",
      sumber: "Website",
      status: "Baru",
      assignedTo: "Sales 1",
      tanggal: "2026-06-10",
      catatan: "Minat produk software akuntansi",
    },
    {
      id: "l2",
      nama: "Rina Marlina",
      perusahaan: "PT Sejahtera Abadi",
      email: "rina@sejahtera.co.id",
      telepon: "081987654321",
      sumber: "Referral",
      status: "Terkualifikasi",
      assignedTo: "Sales 2",
      tanggal: "2026-06-08",
      catatan: "Sudah meeting awal",
    },
  ]);

  const [opportunityList, setOpportunityList] = useState<Opportunity[]>([
    {
      id: "o1",
      customerId: "c1",
      customerNama: "PT Maju Jaya",
      judul: "Pengadaan Software ERP",
      tahap: "Proposal",
      nilai: 125000000,
      probabilitas: 60,
      tanggalTutup: "2026-08-15",
      assignedTo: "Sales 1",
      catatan: "Proposal dikirim, menunggu approval",
    },
    {
      id: "o2",
      customerId: "c2",
      customerNama: "CV Sukses Mandiri",
      judul: "Upgrade Sistem Inventori",
      tahap: "Negosiasi",
      nilai: 45000000,
      probabilitas: 80,
      tanggalTutup: "2026-07-20",
      assignedTo: "Sales 2",
    },
  ]);

  const [activityList, setActivityList] = useState<Activity[]>([
    {
      id: "a1",
      tanggal: "2026-06-16",
      jenis: "Meeting",
      customerId: "c1",
      customerNama: "PT Maju Jaya",
      catatan: "Diskusi kebutuhan modul penjualan dan CRM",
      outcome: "Setuju lanjut ke proposal",
      nextAction: "Kirim proposal sebelum 20 Juni",
    },
    {
      id: "a2",
      tanggal: "2026-06-14",
      jenis: "Call",
      customerId: "c3",
      customerNama: "UD Berkah",
      catatan: "Follow up penawaran harga",
      outcome: "Minta diskon 10%",
    },
    {
      id: "a3",
      tanggal: "2026-06-12",
      jenis: "Email",
      customerId: "c2",
      customerNama: "CV Sukses Mandiri",
      catatan: "Kirim catalog produk terbaru",
      outcome: "Dibaca, janji balas dalam 3 hari",
    },
  ]);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editingOpportunityId, setEditingOpportunityId] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  // Forms
  const [leadForm, setLeadForm] = useState({
    nama: "",
    perusahaan: "",
    email: "",
    telepon: "",
    sumber: "Website",
    status: "Baru",
    assignedTo: "",
    catatan: "",
  });

  const [opportunityForm, setOpportunityForm] = useState({
    customerId: "",
    customerNama: "",
    judul: "",
    tahap: "Prospecting",
    nilai: 0,
    probabilitas: 50,
    tanggalTutup: "",
    assignedTo: "",
    catatan: "",
  });

  const [activityForm, setActivityForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    jenis: "Call",
    customerId: "",
    customerNama: "",
    catatan: "",
    outcome: "",
    nextAction: "",
  });

  // Load customers from main system (data-master style)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: custs } = await supabase
          .from("master_customers")
          .select("id, kode, nama, email, telepon, alamat")
          .order("nama");

        const enhancedCustomers: Customer[] = (custs || []).map((c: any, index: number) => ({
          id: c.id,
          kode: c.kode,
          nama: c.nama,
          email: c.email,
          telepon: c.telepon,
          alamat: c.alamat,
          segment: index % 3 === 0 ? "Premium" : index % 2 === 0 ? "Reguler" : "Baru",
          status: "Aktif",
          nilaiTotal: Math.floor(Math.random() * 500000000) + 50000000,
          lastContact: "2026-06-" + String(10 + (index % 6)).padStart(2, "0"),
        }));

        setCustomerList(enhancedCustomers.length > 0 ? enhancedCustomers : getDemoCustomers());
      } catch (err) {
        console.error("Gagal load customer dari master, pakai demo", err);
        setCustomerList(getDemoCustomers());
      }
      setLoading(false);
    };

    loadData();
  }, []);

  function getDemoCustomers(): Customer[] {
    return [
      {
        id: "c1",
        kode: "CUS-101",
        nama: "PT Maju Jaya",
        email: "info@majujaya.co.id",
        telepon: "021-5551234",
        alamat: "Jl. Sudirman No. 88, Jakarta",
        segment: "Premium",
        status: "Aktif",
        nilaiTotal: 245000000,
        lastContact: "2026-06-15",
      },
      {
        id: "c2",
        kode: "CUS-102",
        nama: "CV Sukses Mandiri",
        email: "contact@suksesmandiri.com",
        telepon: "022-8765432",
        alamat: "Jl. Braga No. 45, Bandung",
        segment: "Reguler",
        status: "Aktif",
        nilaiTotal: 87500000,
        lastContact: "2026-06-10",
      },
      {
        id: "c3",
        kode: "CUS-103",
        nama: "UD Berkah Sejahtera",
        email: "berkah@sejahtera.id",
        telepon: "031-1234567",
        alamat: "Jl. Pemuda No. 12, Surabaya",
        segment: "Baru",
        status: "Aktif",
        nilaiTotal: 32000000,
        lastContact: "2026-06-08",
      },
    ];
  }

  // Filtered lists
  const filteredCustomers = customerList.filter((c) =>
    c.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.kode && c.kode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredLeads = leadList.filter((l) =>
    (l.nama + (l.perusahaan || "")).toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === "all" || l.status === statusFilter)
  );

  const filteredOpportunities = opportunityList.filter((o) =>
    (o.judul + o.customerNama).toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === "all" || o.tahap === statusFilter)
  );

  const filteredActivities = activityList.filter((a) =>
    (a.customerNama + a.catatan).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers for modals
  const openAddLeadModal = () => {
    setLeadForm({
      nama: "",
      perusahaan: "",
      email: "",
      telepon: "",
      sumber: "Website",
      status: "Baru",
      assignedTo: "Sales Team",
      catatan: "",
    });
    setEditingLeadId(null);
    setShowLeadModal(true);
  };

  const openEditLeadModal = (lead: Lead) => {
  setLeadForm({
    nama: lead.nama,
    perusahaan: lead.perusahaan || "",
    email: lead.email || "",
    telepon: lead.telepon || "",
    sumber: lead.sumber,
    status: lead.status,
    assignedTo: lead.assignedTo || "",
    catatan: lead.catatan || "",
  });
  
  setEditingLeadId(lead.id);
  setShowLeadModal(true);
};

  const saveLead = () => {
    if (!leadForm.nama) return;

    if (editingLeadId) {
      setLeadList((prev) =>
        prev.map((l) => (l.id === editingLeadId ? { ...leadForm, id: editingLeadId } as Lead : l))
      );
    } else {
      const newLead: Lead = {
        ...leadForm,
        id: "l" + Date.now(),
        tanggal: new Date().toISOString().split("T")[0],
      };
      setLeadList((prev) => [newLead, ...prev]);
    }
    setShowLeadModal(false);
    setEditingLeadId(null);
  };

  const deleteLead = (id: string) => {
    if (!confirm("Hapus prospek ini?")) return;
    setLeadList((prev) => prev.filter((l) => l.id !== id));
  };

  const openAddOpportunityModal = () => {
    setOpportunityForm({
      customerId: customerList[0]?.id || "",
      customerNama: customerList[0]?.nama || "",
      judul: "",
      tahap: "Prospecting",
      nilai: 50000000,
      probabilitas: 30,
      tanggalTutup: "2026-09-30",
      assignedTo: "Sales Team",
      catatan: "",
    });
    setEditingOpportunityId(null);
    setShowOpportunityModal(true);
  };

  const saveOpportunity = () => {
    if (!opportunityForm.judul || !opportunityForm.customerNama) return;

    if (editingOpportunityId) {
      setOpportunityList((prev) =>
        prev.map((o) =>
          o.id === editingOpportunityId ? { ...opportunityForm, id: editingOpportunityId } as Opportunity : o
        )
      );
    } else {
      const newOpp: Opportunity = {
        ...opportunityForm,
        id: "o" + Date.now(),
      };
      setOpportunityList((prev) => [newOpp, ...prev]);
    }
    setShowOpportunityModal(false);
    setEditingOpportunityId(null);
  };

  const deleteOpportunity = (id: string) => {
    if (!confirm("Hapus peluang ini?")) return;
    setOpportunityList((prev) => prev.filter((o) => o.id !== id));
  };

  const openAddActivityModal = () => {
    const firstCustomer = customerList[0];
    setActivityForm({
      tanggal: new Date().toISOString().split("T")[0],
      jenis: "Call",
      customerId: firstCustomer?.id || "c1",
      customerNama: firstCustomer?.nama || "PT Maju Jaya",
      catatan: "",
      outcome: "",
      nextAction: "",
    });
    setEditingActivityId(null);
    setShowActivityModal(true);
  };

  const saveActivity = () => {
    if (!activityForm.catatan || !activityForm.customerNama) return;

    if (editingActivityId) {
      setActivityList((prev) =>
        prev.map((a) => (a.id === editingActivityId ? { ...activityForm, id: editingActivityId } as Activity : a))
      );
    } else {
      const newAct: Activity = {
        ...activityForm,
        id: "a" + Date.now(),
      };
      setActivityList((prev) => [newAct, ...prev]);
    }
    setShowActivityModal(false);
    setEditingActivityId(null);
  };

  const deleteActivity = (id: string) => {
    if (!confirm("Hapus aktivitas ini?")) return;
    setActivityList((prev) => prev.filter((a) => a.id !== id));
  };

  // Helper for customer select in modals
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>, formType: "opp" | "act") => {
    const selected = customerList.find((c) => c.id === e.target.value);
    if (!selected) return;

    if (formType === "opp") {
      setOpportunityForm((prev) => ({
        ...prev,
        customerId: selected.id,
        customerNama: selected.nama,
      }));
    } else {
      setActivityForm((prev) => ({
        ...prev,
        customerId: selected.id,
        customerNama: selected.nama,
      }));
    }
  };

  // Stats for ringkasan
  const totalCustomers = customerList.length;
  const totalLeads = leadList.length;
  const totalOpportunities = opportunityList.length;
  const pipelineValue = opportunityList.reduce((sum, o) => sum + o.nilai, 0);
  const recentActivities = activityList.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-900">Memuat Modul CRM...</div>
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
                <UsersRound size={26} className="text-emerald-600" /> Modul CRM
              </h1>
              <p className="mt-1 text-sm text-slate-900">
                Kelola hubungan pelanggan, prospek, peluang penjualan, dan aktivitas interaksi. Terintegrasi dengan Master Customer.
              </p>
            </div>
            <button
              onClick={() => {
                if (activeTab === "pelanggan") window.location.href = "/data-master";
                else if (activeTab === "prospek") openAddLeadModal();
                else if (activeTab === "peluang") openAddOpportunityModal();
                else if (activeTab === "aktivitas") openAddActivityModal();
              }}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm"
            >
              <Plus size={16} /> Tambah Data
            </button>
          </div>
        </div>

        {/* Tab Navigation - dark readable text */}
        <div className="flex flex-wrap gap-1 border-b border-slate-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-2xl transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-700 bg-white"
                  : "border-transparent text-slate-900 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input
              type="text"
              placeholder="Cari pelanggan, prospek, atau aktivitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>
          {(activeTab === "prospek" || activeTab === "peluang") && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="all">Semua Status</option>
              {activeTab === "prospek" && (
                <>
                  <option value="Baru">Baru</option>
                  <option value="Terkualifikasi">Terkualifikasi</option>
                  <option value="Dikualifikasi">Dikualifikasi</option>
                </>
              )}
              {activeTab === "peluang" && (
                <>
                  <option value="Prospecting">Prospecting</option>
                  <option value="Qualification">Qualification</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </>
              )}
            </select>
          )}
        </div>

        {/* RINGKASAN */}
        {activeTab === "ringkasan" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Pelanggan</div>
                <div className="text-3xl font-semibold text-slate-900 mt-1">{totalCustomers}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Prospek Aktif</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{totalLeads}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Peluang Terbuka</div>
                <div className="text-3xl font-semibold text-blue-700 mt-1">{totalOpportunities}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Nilai Pipeline</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">
                  Rp {(pipelineValue / 1000000).toFixed(0)}jt
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                <Clock size={20} /> Aktivitas Terbaru
              </h3>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.map((act) => (
                    <div key={act.id} className="flex gap-4 p-3 border border-slate-200 rounded-2xl">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0">
                        {act.jenis === "Meeting" ? <Calendar size={18} /> : <Phone size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900">{act.jenis} dengan {act.customerNama}</div>
                        <div className="text-sm text-slate-900 mt-0.5 line-clamp-2">{act.catatan}</div>
                        <div className="text-xs text-slate-900 mt-1">{act.tanggal}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-900 py-8 text-center">Belum ada aktivitas.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PELANGGAN */}
        {activeTab === "pelanggan" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Kode</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Nama Pelanggan</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Segment</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Nilai Total</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Last Contact</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-900">
                        Tidak ada pelanggan yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-4 font-mono text-sm text-slate-900">{cust.kode}</td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900">{cust.nama}</div>
                          <div className="text-xs text-slate-900">{cust.email || cust.telepon}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                            {cust.segment || "Reguler"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                          Rp {(cust.nilaiTotal || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-4 text-center text-sm text-slate-900">{cust.lastContact}</td>
                        <td className="px-5 py-4 text-right">
                          <button className="p-2 text-blue-700 hover:bg-blue-50 rounded-xl" title="Lihat Detail">
                            <Pencil size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROSPEK / LEADS */}
        {activeTab === "prospek" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <button
                onClick={openAddLeadModal}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition"
              >
                <Plus size={16} /> Tambah Prospek Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Nama / Perusahaan</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Kontak</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Sumber</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Assigned</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-900">Belum ada prospek.</td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-900">{lead.nama}</div>
                            <div className="text-xs text-slate-900">{lead.perusahaan}</div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-900">
                            {lead.email}<br />{lead.telepon}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-900">{lead.sumber}</td>
                          <td className="px-5 py-4 text-center">
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-900">{lead.assignedTo}</td>
                          <td className="px-5 py-4 text-right space-x-1">
                            <button onClick={() => openEditLeadModal(lead)} className="p-2 text-blue-700 hover:bg-blue-50 rounded-xl"><Pencil size={16} /></button>
                            <button onClick={() => deleteLead(lead.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl"><Trash2 size={16} /></button>
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

        {/* PELUANG / OPPORTUNITIES */}
        {activeTab === "peluang" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <button onClick={openAddOpportunityModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Tambah Peluang Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Judul / Pelanggan</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Tahap</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Nilai</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Probabilitas</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Target Tutup</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOpportunities.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-900">Belum ada peluang.</td>
                      </tr>
                    ) : (
                      filteredOpportunities.map((opp) => (
                        <tr key={opp.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-900">{opp.judul}</div>
                            <div className="text-xs text-slate-900">{opp.customerNama}</div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">{opp.tahap}</span>
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                            Rp {opp.nilai.toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-4 text-center text-sm font-medium text-slate-900">{opp.probabilitas}%</td>
                          <td className="px-5 py-4 text-sm text-slate-900">{opp.tanggalTutup}</td>
                          <td className="px-5 py-4 text-right space-x-1">
                            <button onClick={() => { /* edit */ }} className="p-2 text-blue-700 hover:bg-blue-50 rounded-xl"><Pencil size={16} /></button>
                            <button onClick={() => deleteOpportunity(opp.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl"><Trash2 size={16} /></button>
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

        {/* AKTIVITAS */}
        {activeTab === "aktivitas" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <button onClick={openAddActivityModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Catat Aktivitas Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Tanggal</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Jenis</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Pelanggan</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Catatan / Hasil</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredActivities.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-slate-900">Belum ada aktivitas tercatat.</td>
                      </tr>
                    ) : (
                      filteredActivities.map((act) => (
                        <tr key={act.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 text-sm text-slate-900">{act.tanggal}</td>
                          <td className="px-5 py-4">
                            <span className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">{act.jenis}</span>
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-900">{act.customerNama}</td>
                          <td className="px-5 py-4 text-sm text-slate-900 max-w-md">
                            <div>{act.catatan}</div>
                            {act.outcome && <div className="text-xs text-emerald-700 mt-0.5">Hasil: {act.outcome}</div>}
                            {act.nextAction && <div className="text-xs text-blue-700">Next: {act.nextAction}</div>}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={() => deleteActivity(act.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl">
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
      </div>

      {/* Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">{editingLeadId ? "Edit Prospek" : "Tambah Prospek Baru"}</h3>
              <button onClick={() => setShowLeadModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-900 mb-1">Nama Lengkap</label>
                  <input value={leadForm.nama} onChange={(e) => setLeadForm({ ...leadForm, nama: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-900 mb-1">Perusahaan</label>
                  <input value={leadForm.perusahaan} onChange={(e) => setLeadForm({ ...leadForm, perusahaan: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-900 mb-1">Email</label>
                  <input type="email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-900 mb-1">Telepon</label>
                  <input value={leadForm.telepon} onChange={(e) => setLeadForm({ ...leadForm, telepon: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-900 mb-1">Sumber Prospek</label>
                  <select value={leadForm.sumber} onChange={(e) => setLeadForm({ ...leadForm, sumber: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                    <option>Website</option>
                    <option>Referral</option>
                    <option>Event</option>
                    <option>Cold Call</option>
                    <option>Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-900 mb-1">Status</label>
                  <select value={leadForm.status} onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                    <option>Baru</option>
                    <option>Terkualifikasi</option>
                    <option>Dikualifikasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-900 mb-1">Catatan</label>
                <textarea value={leadForm.catatan} onChange={(e) => setLeadForm({ ...leadForm, catatan: e.target.value })} rows={3} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowLeadModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-900 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveLead} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Modal - simplified for brevity */}
      {showOpportunityModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-xl text-slate-900">{editingOpportunityId ? "Edit Peluang" : "Tambah Peluang Baru"}</h3>
              <button onClick={() => setShowOpportunityModal(false)}><X /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-1">Pelanggan</label>
                <select value={opportunityForm.customerId} onChange={(e) => handleCustomerChange(e, "opp")} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  {customerList.map((c) => (
                    <option key={c.id} value={c.id}>{c.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-900 mb-1">Judul Peluang</label>
                <input value={opportunityForm.judul} onChange={(e) => setOpportunityForm({ ...opportunityForm, judul: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-900 mb-1">Tahap</label>
                  <select value={opportunityForm.tahap} onChange={(e) => setOpportunityForm({ ...opportunityForm, tahap: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                    <option>Prospecting</option>
                    <option>Qualification</option>
                    <option>Proposal</option>
                    <option>Negotiation</option>
                    <option>Closed Won</option>
                    <option>Closed Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-900 mb-1">Nilai (Rp)</label>
                  <input type="number" value={opportunityForm.nilai} onChange={(e) => setOpportunityForm({ ...opportunityForm, nilai: Number(e.target.value) })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-900 mb-1">Catatan</label>
                <textarea value={opportunityForm.catatan} onChange={(e) => setOpportunityForm({ ...opportunityForm, catatan: e.target.value })} rows={2} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowOpportunityModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-900 rounded-2xl font-medium">Batal</button>
              <button onClick={saveOpportunity} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan Peluang</button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-xl text-slate-900">Catat Aktivitas Baru</h3>
              <button onClick={() => setShowActivityModal(false)}><X /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-900 mb-1">Tanggal</label>
                  <input type="date" value={activityForm.tanggal} onChange={(e) => setActivityForm({ ...activityForm, tanggal: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-900 mb-1">Jenis Aktivitas</label>
                  <select value={activityForm.jenis} onChange={(e) => setActivityForm({ ...activityForm, jenis: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                    <option>Call</option>
                    <option>Meeting</option>
                    <option>Email</option>
                    <option>Note</option>
                    <option>Follow-up</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-900 mb-1">Pelanggan</label>
                <select value={activityForm.customerId} onChange={(e) => handleCustomerChange(e, "act")} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  {customerList.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-900 mb-1">Catatan / Hasil</label>
                <textarea value={activityForm.catatan} onChange={(e) => setActivityForm({ ...activityForm, catatan: e.target.value })} rows={3} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowActivityModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-900 rounded-2xl font-medium">Batal</button>
              <button onClick={saveActivity} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan Aktivitas</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
