"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "../component/Sidebar";

import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Calendar,
  Settings,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

type Employee = {
  id: string;
  kode: string;
  nama: string;
  nik: string;
  email: string;
  telepon: string;
  alamat: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  jabatan: string;
  departemen: string;
  tanggal_bergabung: string;
  status: string;
};

export default function SDMPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Employee data (local for now, will connect to Supabase)
  // Load organisasi lists from cloud (via companies table, set from Pengaturan)
  const [departemenOptions, setDepartemenOptions] = useState<string[]>(["Produksi", "Pembelian", "Gudang", "Keuangan", "HR", "Marketing"]);
  const [jabatanOptions, setJabatanOptions] = useState<string[]>(["Staff", "Supervisor", "Manager", "Senior Manager", "Direktur"]);

  const [employeeList, setEmployeeList] = useState<Employee[]>([]);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [addPortalAccount, setAddPortalAccount] = useState(true);

  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [credentialData, setCredentialData] = useState<{
    userId: string;
    password: string;
    telepon: string;
    nama: string;
  } | null>(null);

  const [employeeForm, setEmployeeForm] = useState({
    nama: "",
    nik: "",
    email: "",
    telepon: "",
    alamat: "",
    tanggal_lahir: "",
    jenis_kelamin: "Laki-laki",
    jabatan: "",
    departemen: "",
    tanggal_bergabung: new Date().toISOString().split("T")[0],
    status: "Aktif",
  });

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
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

          // Load organisasi lists from company for the form selects
          if (profileData.company_id) {
            const { data: companyData } = await supabase
              .from("companies")
              .select("departemen_list, jabatan_list")
              .eq("id", profileData.company_id)
              .single();

            if (companyData) {
              if (companyData.departemen_list && Array.isArray(companyData.departemen_list)) {
                setDepartemenOptions(companyData.departemen_list);
              }
              if (companyData.jabatan_list && Array.isArray(companyData.jabatan_list)) {
                setJabatanOptions(companyData.jabatan_list);
              }
            }
          }
        }
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  // Filtered list
  const filteredEmployees = employeeList.filter((emp) => {
    const matchesSearch =
      !searchTerm ||
      emp.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.departemen.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || emp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const generateEmployeeCode = () => {
    const nextNumber = String(employeeList.length + 1).padStart(3, "0");
    return `EMP-${nextNumber}`;
  };

  const openAddEmployeeModal = () => {
    setEditingEmployeeId(null);
    setAddPortalAccount(true);
    setEmployeeForm({
      nama: "",
      nik: "",
      email: "",
      telepon: "",
      alamat: "",
      tanggal_lahir: "",
      jenis_kelamin: "Laki-laki",
      jabatan: "",
      departemen: "",
      tanggal_bergabung: new Date().toISOString().split("T")[0],
      status: "Aktif",
    });
    setShowEmployeeModal(true);
  };

  const openEditEmployeeModal = (emp: Employee) => {
    setEditingEmployeeId(emp.id);
    setEmployeeForm({
      nama: emp.nama,
      nik: emp.nik,
      email: emp.email,
      telepon: emp.telepon,
      alamat: emp.alamat,
      tanggal_lahir: emp.tanggal_lahir,
      jenis_kelamin: emp.jenis_kelamin,
      jabatan: emp.jabatan,
      departemen: emp.departemen,
      tanggal_bergabung: emp.tanggal_bergabung,
      status: emp.status,
    });
    setShowEmployeeModal(true);
  };

  const closeEmployeeModal = () => {
    setShowEmployeeModal(false);
    setEditingEmployeeId(null);
  };

  const generateUserId = (nama: string) => {
    const parts = nama.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let base = parts[0] || 'user';
    if (parts.length > 1) {
      base += '.' + parts[parts.length - 1].charAt(0);
    }
    return base + Math.floor(100 + Math.random() * 900);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleEmployeeFormChange = (field: string, value: string) => {
    setEmployeeForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEmployee = async () => {
    if (!employeeForm.nama.trim() || !employeeForm.jabatan.trim()) {
      alert("Nama dan Jabatan wajib diisi.");
      return;
    }

    const newEmployee: Employee = {
      id: editingEmployeeId || `emp-${Date.now()}`,
      kode: editingEmployeeId
        ? employeeList.find((e) => e.id === editingEmployeeId)!.kode
        : generateEmployeeCode(),
      nama: employeeForm.nama.trim(),
      nik: employeeForm.nik.trim(),
      email: employeeForm.email.trim(),
      telepon: employeeForm.telepon.trim(),
      alamat: employeeForm.alamat.trim(),
      tanggal_lahir: employeeForm.tanggal_lahir,
      jenis_kelamin: employeeForm.jenis_kelamin,
      jabatan: employeeForm.jabatan.trim(),
      departemen: employeeForm.departemen.trim(),
      tanggal_bergabung: employeeForm.tanggal_bergabung,
      status: employeeForm.status,
    };

    if (editingEmployeeId) {
      setEmployeeList((prev) =>
        prev.map((e) => (e.id === editingEmployeeId ? newEmployee : e))
      );
      closeEmployeeModal();
    } else {
      setEmployeeList((prev) => [newEmployee, ...prev]);
      closeEmployeeModal();

      if (addPortalAccount) {
        const userId = generateUserId(employeeForm.nama);
        const password = generatePassword();

        setCredentialData({
          userId,
          password,
          telepon: employeeForm.telepon,
          nama: employeeForm.nama,
        });
        setShowCredentialModal(true);
      }
    }
  };

  const handleDeleteEmployee = async (emp: Employee) => {
    if (!confirm(`Hapus karyawan ${emp.nama}?`)) return;

    setEmployeeList((prev) => prev.filter((e) => e.id !== emp.id));

    // TODO: Delete from Supabase
    // await supabase.from("employees").delete().eq("id", emp.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Memuat Modul SDM...</div>
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
                <Users size={26} className="text-emerald-600" /> Modul SDM
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Master Data Karyawan. Data ini akan digunakan untuk Permintaan Pembelian, Absensi, Payroll, dan modul lainnya.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* DIAUF Humanika - tombol utama untuk halaman HRD/SDM terpisah (tanpa sidebar) */}
              <Link
                href="/diauf-humanika"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#041833] hover:bg-[#0a2540] text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm"
              >
                DIAUF Humanika <ExternalLink size={15} className="opacity-80" />
              </Link>

              <button
                onClick={openAddEmployeeModal}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm"
              >
                <Plus size={16} /> Tambah Karyawan
              </button>

              {/* Pintasan Pengaturan Organisasi - hanya icon setting di lingkaran hijau */}
              <Link
                href="/pengaturan?tab=organisasi"
                className="flex items-center justify-center w-9 h-9 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 hover:scale-105 transition-all shadow-sm"
                title="Pengaturan Organisasi"
              >
                <Settings size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <div className="text-xs text-slate-600">Total Karyawan</div>
              <div className="text-2xl font-semibold text-slate-900 mt-1">{employeeList.length}</div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <div className="text-xs text-slate-600">Karyawan Aktif</div>
              <div className="text-2xl font-semibold text-emerald-600 mt-1">
                {employeeList.filter((e) => e.status === "Aktif").length}
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <div className="text-xs text-slate-600">Departemen</div>
              <div className="text-2xl font-semibold text-slate-900 mt-1">
                {new Set(employeeList.map((e) => e.departemen)).size}
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <div className="text-xs text-slate-600">Karyawan Cuti</div>
              <div className="text-2xl font-semibold text-amber-600 mt-1">
                {employeeList.filter((e) => e.status === "Cuti").length}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Cari nama, jabatan, atau departemen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Kode</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Nama Karyawan</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Jabatan</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Departemen</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Email</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Telepon</th>
                  <th className="px-5 py-3.5 text-center font-semibold text-slate-600">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-lg font-medium text-slate-700 mb-1">Belum ada data karyawan</p>
                        <p className="text-sm text-slate-500 mb-4">Mulai dengan menambahkan karyawan pertama Anda.</p>
                        <button
                          onClick={openAddEmployeeModal}
                          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 text-sm font-semibold rounded-2xl transition shadow-sm"
                        >
                          <Plus size={16} /> Tambah Karyawan Pertama
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-mono font-medium text-emerald-700">{emp.kode}</td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">{emp.nama}</div>
                        <div className="text-xs text-slate-600">{emp.nik}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{emp.jabatan}</td>
                      <td className="px-5 py-4 text-slate-700">{emp.departemen}</td>
                      <td className="px-5 py-4 text-slate-600">{emp.email}</td>
                      <td className="px-5 py-4 text-slate-600">{emp.telepon}</td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            emp.status === "Aktif"
                              ? "bg-emerald-100 text-emerald-700"
                              : emp.status === "Cuti"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEditEmployeeModal(emp)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp)}
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
          Data karyawan ini akan digunakan sebagai pemohon di Permintaan Pembelian dan modul HR lainnya.
        </div>
      </main>

      {/* Employee Add/Edit Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold text-slate-900">
                {editingEmployeeId ? "Edit Karyawan" : "Tambah Karyawan Baru"}
              </h3>
              <button onClick={closeEmployeeModal} className="text-slate-500 hover:text-slate-700">
                <X size={22} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-800 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={employeeForm.nama}
                  onChange={(e) => handleEmployeeFormChange("nama", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                  placeholder="Nama lengkap karyawan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">NIK / No. KTP</label>
                <input
                  type="text"
                  value={employeeForm.nik}
                  onChange={(e) => handleEmployeeFormChange("nik", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Email</label>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => handleEmployeeFormChange("email", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Telepon</label>
                <input
                  type="text"
                  value={employeeForm.telepon}
                  onChange={(e) => handleEmployeeFormChange("telepon", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={employeeForm.tanggal_lahir}
                  onChange={(e) => handleEmployeeFormChange("tanggal_lahir", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Jenis Kelamin</label>
                <select
                  value={employeeForm.jenis_kelamin}
                  onChange={(e) => handleEmployeeFormChange("jenis_kelamin", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Jabatan</label>
                <select
                  value={employeeForm.jabatan}
                  onChange={(e) => handleEmployeeFormChange("jabatan", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="">-- Pilih Jabatan --</option>
                  {jabatanOptions.map((j, i) => (
                    <option key={i} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Departemen</label>
                <select
                  value={employeeForm.departemen}
                  onChange={(e) => handleEmployeeFormChange("departemen", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="">-- Pilih Departemen --</option>
                  {departemenOptions.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Tanggal Bergabung</label>
                <input
                  type="date"
                  value={employeeForm.tanggal_bergabung}
                  onChange={(e) => handleEmployeeFormChange("tanggal_bergabung", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Status</label>
                <select
                  value={employeeForm.status}
                  onChange={(e) => handleEmployeeFormChange("status", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Cuti">Cuti</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-800 mb-1">Alamat</label>
                <textarea
                  value={employeeForm.alamat}
                  onChange={(e) => handleEmployeeFormChange("alamat", e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                  placeholder="Alamat lengkap"
                />
              </div>

              {!editingEmployeeId && (
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addPortalAccount}
                      onChange={(e) => setAddPortalAccount(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4"
                    />
                    Tambahkan akun portal karyawan
                  </label>
                  <p className="text-[10px] text-slate-500 ml-6 mt-0.5">
                    Karyawan akan mendapatkan akses ke portal mobile (absensi, cuti, gaji, dll).
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={closeEmployeeModal}
                className="px-5 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEmployee}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 font-medium"
              >
                {editingEmployeeId ? "Simpan Perubahan" : "Simpan Karyawan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credential Popup Modal */}
      {showCredentialModal && credentialData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="text-center mb-4">
              <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Karyawan Berhasil Ditambahkan</h3>
              <p className="text-sm text-slate-600 mt-1">Akun portal karyawan telah dibuat.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 mb-4 space-y-3">
              <div>
                <div className="text-xs text-slate-500">User ID</div>
                <div className="font-mono text-lg font-semibold text-slate-900">{credentialData.userId}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Password</div>
                <div className="font-mono text-lg font-semibold text-emerald-600">{credentialData.password}</div>
              </div>
            </div>

            <p className="text-xs text-amber-600 mb-4 text-center">
              Karyawan dapat mengubah password sendiri melalui portal karyawan.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  const cleanPhone = credentialData.telepon.replace(/[^0-9]/g, '');
                  const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                  const message = `Halo ${credentialData.nama},\n\nAkun portal DIAUF Humanika Anda telah dibuat.\n\nUser ID: ${credentialData.userId}\nPassword: ${credentialData.password}\n\nSilakan login dan segera ubah password Anda.`;
                  window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-medium transition"
              >
                Kirim ke WhatsApp ({credentialData.telepon})
              </button>

              <button
                onClick={() => {
                  setShowCredentialModal(false);
                  setCredentialData(null);
                }}
                className="w-full py-3 border border-slate-300 text-slate-700 rounded-2xl font-medium hover:bg-slate-50 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
