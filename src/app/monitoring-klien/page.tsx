"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "../component/Sidebar";
import {
  Eye,
  EyeOff,
  Plus,
  Edit2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

const AVAILABLE_MODULES = [
  "CRM",
  "Pembelian",
  "Penjualan",
  "POS",
  "Kas & Bank",
  "Persediaan",
  "Produksi",
  "SDM",
  "Project",
  "Workshop",
  "Pengiriman",
  "Armada",
  "Pajak",
  "Proyeksi",
  "Aset",
  "Pendampingan",
  "Laporan",
  "Pengaturan",
];

interface Client {
  id: string;
  namaUsaha: string;
  namaKlien: string;
  username: string;
  jumlahUser: number;
  jumlahCabang: number;
  modulTerbuka: string[];
  tanggalPendaftaran: string;
  status: string;
  memoriTerpakai: number;
  ownerProfileId?: string;
}

export default function MonitoringKlienPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showTempPassword, setShowTempPassword] = useState(false);

  const [formData, setFormData] = useState({
    namaUsaha: "",
    namaKlien: "",
    email: "",
    password: "",
    jumlahCabang: 0,
    status: "active",
    modulTerbuka: [] as string[],
    memoriTerpakai: 0,
  });

  // Load profile for role check and data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          setMessage({ type: "error", text: "Gagal memuat profil. Periksa koneksi atau login ulang." });
          setLoading(false);
          return;
        }

        if (profileData) {
          setProfile(profileData);
          const normalizedRole = (profileData.role || "").toLowerCase().trim().replace(/\s+/g, "_");
          if (normalizedRole !== "master_admin") {
            router.push("/dashboard");
            return;
          }
        }

        // Fetch companies and profiles (only for master_admin)
        const { data: companies, error: companiesError } = await supabase.from("companies").select("*");
        const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*");

        if (companiesError || profilesError) {
          console.error("Data fetch error:", companiesError || profilesError);
          setMessage({ type: "error", text: "Gagal memuat data klien. Periksa koneksi Supabase." });
        }

        const processed: Client[] = (companies || []).map((company: any) => {
          const compProfiles = (profiles || []).filter((p: any) => p.company_id === company.id);
          const owner = compProfiles.find((p: any) => p.role === "owner");
          const totalUsers = compProfiles.length;
          const ownerName = owner?.full_name || "N/A";
          const username = owner?.email || ownerName || "N/A";

          return {
            id: company.id,
            namaUsaha: company.company_name || "N/A",
            namaKlien: ownerName,
            username,
            jumlahUser: totalUsers,
            jumlahCabang: company.branch_count || 0,
            modulTerbuka: company.enabled_modules || [],
            tanggalPendaftaran: company.created_at
              ? new Date(company.created_at).toLocaleString("id-ID")
              : "-",
            status: company.status || "active",
            memoriTerpakai: company.storage_used || 0,
            ownerProfileId: owner?.id,
          };
        });

        setClients(processed);
      } catch (err: any) {
        console.error("Failed to load monitoring data:", err);
        // This catches "Failed to fetch" / network errors from Supabase
        const errorMsg =
          err?.message?.includes("fetch") || err?.name === "TypeError"
            ? "Gagal terhubung ke Supabase (Failed to fetch). Periksa NEXT_PUBLIC_SUPABASE_URL dan koneksi internet Anda."
            : "Terjadi kesalahan saat memuat data. Lihat console untuk detail.";
        setMessage({ type: "error", text: errorMsg });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const filteredClients = clients
    .filter((c) => {
      const matchesSearch =
        c.namaUsaha.toLowerCase().includes(search.toLowerCase()) ||
        c.namaKlien.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => a.namaUsaha.localeCompare(b.namaUsaha));

  const clearMessage = () => setTimeout(() => setMessage(null), 4000);

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({
      namaUsaha: "",
      namaKlien: "",
      email: "",
      password: "",
      jumlahCabang: 0,
      status: "active",
      modulTerbuka: [],
      memoriTerpakai: 0,
    });
    setShowTempPassword(false);
    setShowModal(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      namaUsaha: client.namaUsaha,
      namaKlien: client.namaKlien,
      email: client.username !== "N/A" ? client.username : "",
      password: "", // not editing password here
      jumlahCabang: client.jumlahCabang,
      status: client.status,
      modulTerbuka: client.modulTerbuka,
      memoriTerpakai: client.memoriTerpakai,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setShowTempPassword(false);
  };

  const toggleModule = (mod: string) => {
    setFormData((prev) => ({
      ...prev,
      modulTerbuka: prev.modulTerbuka.includes(mod)
        ? prev.modulTerbuka.filter((m) => m !== mod)
        : [...prev.modulTerbuka, mod],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.namaUsaha.trim() || !formData.namaKlien.trim() || !formData.email.trim()) {
      setMessage({ type: "error", text: "Nama usaha, nama klien, dan email wajib diisi." });
      clearMessage();
      return;
    }

    setModalLoading(true);
    setMessage(null);

    try {
      if (editingClient) {
        // Edit existing
        const { error: compError } = await supabase
          .from("companies")
          .update({
            company_name: formData.namaUsaha,
            branch_count: formData.jumlahCabang,
            status: formData.status,
            enabled_modules: formData.modulTerbuka,
            storage_used: formData.memoriTerpakai,
          })
          .eq("id", editingClient.id);

        if (compError) throw compError;

        // Update owner name if changed
        if (editingClient.ownerProfileId && formData.namaKlien !== editingClient.namaKlien) {
          await supabase
            .from("profiles")
            .update({ full_name: formData.namaKlien })
            .eq("id", editingClient.ownerProfileId);
        }

        setMessage({ type: "success", text: "Klien berhasil diperbarui." });
      } else {
        // Add new: sign up owner + create company + profile
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password || "TempPass123!", // fallback, recommend set strong
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error("Gagal membuat akun user.");

        const newUserId = authData.user.id;

        const { data: newCompany, error: compError } = await supabase
          .from("companies")
          .insert({
            company_name: formData.namaUsaha,
            branch_count: formData.jumlahCabang,
            status: formData.status,
            enabled_modules: formData.modulTerbuka,
            storage_used: formData.memoriTerpakai,
          })
          .select()
          .single();

        if (compError || !newCompany) throw compError || new Error("Gagal membuat perusahaan.");

        await supabase.from("profiles").insert({
          id: newUserId,
          company_id: newCompany.id,
          full_name: formData.namaKlien,
          role: "owner",
          email: formData.email,
        });

        setMessage({ type: "success", text: "Klien baru berhasil ditambahkan." });
      }

      closeModal();
      // Refresh data
      window.location.reload(); // simple refresh for now
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Gagal menyimpan data klien." });
      clearMessage();
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentRole={profile?.role} />
        <main className={`p-8 transition-all duration-300 ${collapsed ? "ml-24" : "ml-72"}`}>
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        </main>
        </div>
      );
    }
  

  if (profile) {
    const normalizedRole = (profile.role || "").toLowerCase().trim().replace(/\s+/g, "_");
    if (normalizedRole !== "master_admin") {
      return (
        <div className="min-h-screen bg-slate-100">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentRole={profile.role} />
          <main className={`p-8 transition-all duration-300 ${collapsed ? "ml-24" : "ml-72"}`}>
            <div className="text-center py-20">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-4 text-xl font-semibold text-slate-900">Akses Ditolak</h2>
              <p className="text-slate-600">Hanya MASTER_ADMIN yang dapat mengakses modul ini.</p>
            </div>
          </main>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentRole={profile?.role} />

      <main className={`p-8 transition-all duration-300 ${collapsed ? "ml-24" : "ml-72"}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Monitoring Klien</h1>
            <p className="text-sm text-slate-500">Pantau dan kelola akun klien (akses MASTER_ADMIN)</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold transition"
          >
            <Plus size={18} /> Tambah Klien
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 flex items-center gap-3 rounded-2xl px-5 py-3 text-sm ${
              message.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Cari nama usaha atau klien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-300 rounded-xl px-4 py-2 w-80 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Nama Usaha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Nama Klien</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Username</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Jumlah User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Jumlah Cabang</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Modul Terbuka</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Tanggal Pendaftaran</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Memori (MB)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada data klien yang cocok.
                  </td>
                </tr>
              )}
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{client.namaUsaha}</td>
                  <td className="px-4 py-3 text-slate-700">{client.namaKlien}</td>
                  <td className="px-4 py-3 text-slate-700">{client.username}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {client.jumlahUser} (1 owner + {Math.max(0, client.jumlahUser - 1)} user)
                  </td>
                  <td className="px-4 py-3 text-slate-700">{client.jumlahCabang}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {client.modulTerbuka.length > 0 ? client.modulTerbuka.join(", ") : "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{client.tanggalPendaftaran}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        client.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {client.status === "active" ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{client.memoriTerpakai}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditModal(client)}
                      className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Modul ini hanya untuk MASTER_ADMIN. Data diambil real-time dari Supabase.
        </p>

        {/* Modal Add/Edit */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-900">{editingClient ? "Edit Klien" : "Tambah Klien Baru"}</h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-700 mb-1">Nama Usaha</label>
                  <input
                    value={formData.namaUsaha}
                    onChange={(e) => setFormData({ ...formData, namaUsaha: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Nama Klien (Owner)</label>
                  <input
                    value={formData.namaKlien}
                    onChange={(e) => setFormData({ ...formData, namaKlien: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Email (Username)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!editingClient}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                {!editingClient && (
                  <div>
                    <label className="block text-slate-700 mb-1">Password Sementara</label>
                    <div className="relative">
                      <input
                        type={showTempPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 pr-10 text-slate-900 placeholder:text-slate-400"
                        placeholder="Minimal 6 karakter"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTempPassword(!showTempPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                        tabIndex={-1}
                        title={showTempPassword ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showTempPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 mb-1">Jumlah Cabang</label>
                    <input
                      type="number"
                      value={formData.jumlahCabang}
                      onChange={(e) => setFormData({ ...formData, jumlahCabang: parseInt(e.target.value) || 0 })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Memori Terpakai (MB)</label>
                    <input
                      type="number"
                      value={formData.memoriTerpakai}
                      onChange={(e) => setFormData({ ...formData, memoriTerpakai: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Modul Terbuka</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto border border-slate-200 rounded-xl p-3">
                    {AVAILABLE_MODULES.map((mod) => (
                      <label key={mod} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.modulTerbuka.includes(mod)}
                          onChange={() => toggleModule(mod)}
                        />
                        {mod}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:bg-emerald-300"
                >
                  {modalLoading ? "Menyimpan..." : editingClient ? "Simpan Perubahan" : "Tambah Klien"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
