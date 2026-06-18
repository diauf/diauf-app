"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "../component/Sidebar";
import {
  Building2,
  Save,
  Upload,
  Trash2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserCircle2,
  Plus,
  Edit2,
  X,
  MapPin,
  Users,
  Shield,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function PengaturanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);

  const [company, setCompany] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state for Profil Perusahaan
  const [form, setForm] = useState({
    company_name: "",
    address: "",
    phone: "",
    email: "",
    npwp: "",
    logo_url: null as string | null,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Tabs & Cabang management
  const [activeTab, setActiveTab] = useState<"profil" | "cabang" | "akses" | "audit" | "organisasi">(
    (searchParams.get("tab") as any) || "profil"
  );
  const [branches, setBranches] = useState<any[]>([]);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any | null>(null);
  const [branchModalLoading, setBranchModalLoading] = useState(false);
  const [branchForm, setBranchForm] = useState({
    name: "",
    address: "",
    phone: "",
    status: "active",
  });

  // Kelola Akses states
  const [userAccesses, setUserAccesses] = useState<any[]>([]);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [editingAccess, setEditingAccess] = useState<any | null>(null);
  const [accessModalLoading, setAccessModalLoading] = useState(false);
  const [accessForm, setAccessForm] = useState({
    username: "",
    full_name: "",
    status: "active",
    accessible_modules: [] as string[],
    accessible_branches: [] as string[],
    can_create: false,
    can_edit: false,
    can_delete: false,
  });

  // Audit Log states
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilter, setAuditFilter] = useState({
    search: "",
    targetType: "all" as "all" | "cabang" | "akses_pengguna",
    action: "all" as "all" | "create" | "update" | "soft_delete" | "restore",
    dateFrom: "",
    dateTo: "",
  });

  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(20);

  // Organisasi settings (Jabatan & Departemen) - loaded/saved from companies table (cloud)
  const [departemenList, setDepartemenList] = useState<string[]>(["Produksi", "Pembelian", "Gudang", "Keuangan", "HR", "Marketing"]);
  const [jabatanList, setJabatanList] = useState<string[]>(["Staff", "Supervisor", "Manager", "Senior Manager", "Direktur"]);

  const [newDepartemen, setNewDepartemen] = useState("");
  const [newJabatan, setNewJabatan] = useState("");

  const saveOrganisasi = async (depts: string[], jabs: string[]) => {
    if (!company?.id) return;
    try {
      const { error } = await supabase
        .from("companies")
        .update({
          departemen_list: depts,
          jabatan_list: jabs,
        })
        .eq("id", company.id);

      if (error) throw error;

      setCompany({
        ...company,
        departemen_list: depts,
        jabatan_list: jabs,
      });
    } catch (err: any) {
      console.error("Gagal menyimpan pengaturan organisasi:", err);
      setMessage({
        type: "error",
        text: "Gagal menyimpan ke cloud. " + (err.message || ""),
      });
    }
  };

  const addDepartemen = () => {
    const val = newDepartemen.trim();
    if (val && !departemenList.includes(val)) {
      const newList = [...departemenList, val];
      setDepartemenList(newList);
      setNewDepartemen("");
      saveOrganisasi(newList, jabatanList);
    }
  };

  const removeDepartemen = (item: string) => {
    const newList = departemenList.filter((d) => d !== item);
    setDepartemenList(newList);
    saveOrganisasi(newList, jabatanList);
  };

  const addJabatan = () => {
    const val = newJabatan.trim();
    if (val && !jabatanList.includes(val)) {
      const newList = [...jabatanList, val];
      setJabatanList(newList);
      setNewJabatan("");
      saveOrganisasi(departemenList, newList);
    }
  };

  const removeJabatan = (item: string) => {
    const newList = jabatanList.filter((j) => j !== item);
    setJabatanList(newList);
    saveOrganisasi(departemenList, newList);
  };

  // Refs to always have latest company/profile for logging (avoid stale closures)
  const companyRef = useRef<any>(null);
  const profileRef = useRef<any>(null);



  useEffect(() => {
    companyRef.current = company;
  }, [company]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

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

  const normalizeRole = (r: string | undefined) =>
    (r || "").toLowerCase().trim().replace(/\s+/g, "_");
  const allowedRoles = ["owner", "admin", "master_admin"];
  const isAdmin = allowedRoles.includes(normalizeRole(profile?.role));

  // Load company + profile (same pattern as dashboard)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, company_id, full_name, role")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      if (!profileData?.company_id) {
        setLoading(false);
        return;
      }

      const { data: companyData } = await supabase
        .from("companies")
        .select("*")
        .eq("id", profileData.company_id)
        .single();

      if (companyData) {
        setCompany(companyData);

        // Load organisasi lists from cloud or defaults
        setDepartemenList(
          companyData.departemen_list || ["Produksi", "Pembelian", "Gudang", "Keuangan", "HR", "Marketing"]
        );
        setJabatanList(
          companyData.jabatan_list || ["Staff", "Supervisor", "Manager", "Senior Manager", "Direktur"]
        );

        setForm({
          company_name: companyData.company_name || "",
          address: companyData.address || "",
          phone: companyData.phone || "",
          email: companyData.email || "",
          npwp: companyData.npwp || "",
          logo_url: companyData.logo_url || null,
        });

        if (companyData.logo_url) {
          setLogoPreview(companyData.logo_url);
        }

        // Load branches for this company
        const { data: branchesData, error: branchesError } = await supabase
          .from("branches")
          .select("*")
          .eq("company_id", profileData.company_id)
          .is("deleted_at", null)
          .order("created_at", { ascending: true });

        if (branchesError) {
          console.error('Initial load branches error (check RLS):', branchesError);
        }
        setBranches(branchesData || []);

        // Load user accesses
        const { data: accessData, error: accessError } = await supabase
          .from("user_accesses")
          .select("*")
          .eq("company_id", profileData.company_id)
          .is("deleted_at", null)
          .order("created_at", { ascending: true });

        if (accessError) {
          console.error("Initial load user accesses error:", accessError);
        }
        setUserAccesses(accessData || []);
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 4500);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "File harus berupa gambar (JPG/PNG/WebP)" });
      clearMessage();
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Ukuran logo maksimal 2 MB" });
      clearMessage();
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    setMessage(null);
  };

  const clearSelectedLogo = () => {
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setSelectedFile(null);
    setLogoPreview(form.logo_url || null);
  };

  const handleSave = async () => {
    if (!company?.id) {
      setMessage({ type: "error", text: "Data perusahaan tidak ditemukan." });
      clearMessage();
      return;
    }

    if (!form.company_name.trim()) {
      setMessage({ type: "error", text: "Nama perusahaan wajib diisi." });
      clearMessage();
      return;
    }

    if (!isAdmin) {
      setMessage({ type: "error", text: "Hanya owner, admin, atau master admin yang dapat mengubah profil perusahaan." });
      clearMessage();
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      let finalLogoUrl = form.logo_url;

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `company-${company.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("company-logos")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(
            "Gagal upload logo. Pastikan bucket 'company-logos' sudah dibuat di Supabase Storage (public) dan policy sudah diatur."
          );
        }

        const { data: urlData } = supabase.storage
          .from("company-logos")
          .getPublicUrl(filePath);

        finalLogoUrl = urlData.publicUrl;
      }

      const updatePayload: any = {
        company_name: form.company_name.trim(),
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        npwp: form.npwp.trim() || null,
        logo_url: finalLogoUrl,
      };

      const { error: updateError } = await supabase
        .from("companies")
        .update(updatePayload)
        .eq("id", company.id);

      if (updateError) {
        throw updateError;
      }

      const updatedCompany = { ...company, ...updatePayload };
      setCompany(updatedCompany);

      setForm({
        company_name: updatedCompany.company_name || "",
        address: updatedCompany.address || "",
        phone: updatedCompany.phone || "",
        email: updatedCompany.email || "",
        npwp: updatedCompany.npwp || "",
        logo_url: updatedCompany.logo_url || null,
      });

      if (updatedCompany.logo_url) {
        setLogoPreview(updatedCompany.logo_url);
      } else {
        setLogoPreview(null);
      }
      setSelectedFile(null);

      setMessage({ type: "success", text: "Profil perusahaan berhasil disimpan." });
      clearMessage();
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message || "Gagal menyimpan perubahan.",
      });
      clearMessage();
    } finally {
      setSaving(false);
    }
  };

  // ========== KELOLA CABANG HELPERS ==========
  const loadBranches = async (companyId: string) => {
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) {
      console.error('Failed to load branches (possible RLS issue):', error);
    }

    const list = data || [];
    setBranches(list);

    // Keep branch_count in sync on the company record (used by Monitoring Klien etc.)
    try {
      await supabase.from("companies").update({ branch_count: list.length }).eq("id", companyId);
      if (company) {
        setCompany({ ...company, branch_count: list.length });
      }
    } catch (e) {
      // non-critical (update count may be restricted by RLS on companies)
    }
  };

  const openAddBranchModal = () => {
    setEditingBranch(null);
    setBranchForm({ name: "", address: "", phone: "", status: "active" });
    setShowBranchModal(true);
  };

  const openEditBranchModal = (branch: any) => {
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name || "",
      address: branch.address || "",
      phone: branch.phone || "",
      status: branch.status || "active",
    });
    setShowBranchModal(true);
  };

  const closeBranchModal = () => {
    setShowBranchModal(false);
    setEditingBranch(null);
  };

  const handleBranchInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBranchForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBranchSubmit = async () => {
    if (!company?.id) return;
    if (!branchForm.name.trim()) {
      setMessage({ type: "error", text: "Nama cabang wajib diisi." });
      clearMessage();
      return;
    }
    if (!isAdmin) {
      setMessage({ type: "error", text: "Hanya owner/admin yang dapat mengelola cabang." });
      clearMessage();
      return;
    }

    setBranchModalLoading(true);
    setMessage(null);

    try {
      if (editingBranch) {
        // Update
        const { data: updatedBranch, error } = await supabase
          .from("branches")
          .update({
            name: branchForm.name.trim(),
            address: branchForm.address.trim() || null,
            phone: branchForm.phone.trim() || null,
            status: branchForm.status,
          })
          .eq("id", editingBranch.id)
          .select()
          .single();

        if (error) throw error;
        setMessage({ type: "success", text: "Cabang berhasil diperbarui." });

        await logAction({
          action: "update",
          target_type: "cabang",
          target_id: editingBranch.id,
          target_name: branchForm.name.trim(),
          details: { before: editingBranch, after: updatedBranch },
        });
      } else {
        // Insert new
        const { data: newBranch, error } = await supabase
          .from("branches")
          .insert({
            company_id: company.id,
            name: branchForm.name.trim(),
            address: branchForm.address.trim() || null,
            phone: branchForm.phone.trim() || null,
            status: branchForm.status,
          })
          .select()
          .single();

        if (error) throw error;
        setMessage({ type: "success", text: "Cabang baru berhasil ditambahkan." });

        await logAction({
          action: "create",
          target_type: "cabang",
          target_id: newBranch.id,
          target_name: branchForm.name.trim(),
          details: { after: newBranch },
        });
      }

      closeBranchModal();
      const latestCompany = companyRef.current;
      await loadBranches(latestCompany?.id || company?.id || "");
      if (latestCompany?.id) await loadAuditLogs(latestCompany.id);
      clearMessage();
    } catch (err: any) {
      console.error('Branch submit error (full object):', err);
      console.error('Supabase error details:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        error: err?.error,
      });

      const supabaseErrorMsg = 
        err?.message || 
        err?.details || 
        (err?.code ? `Kode error: ${err.code}` : '') ||
        '';

      setMessage({
        type: "error",
        text: supabaseErrorMsg 
          ? `Gagal menyimpan cabang: ${supabaseErrorMsg}` 
          : "Gagal menyimpan cabang. Kemungkinan besar karena RLS policy belum diatur di tabel 'branches'. Cek console untuk detail.",
      });
      clearMessage();
    } finally {
      setBranchModalLoading(false);
    }
  };

  const handleDeleteBranch = async (branch: any) => {
    if (!company?.id || !isAdmin) return;

    if (!confirm(`Hapus (soft delete) cabang "${branch.name}"? Data akan tersimpan di Audit Log.`)) return;

    try {
      const { error } = await supabase
        .from("branches")
        .update({ deleted_at: new Date().toISOString(), status: "inactive" })
        .eq("id", branch.id);
      if (error) throw error;

      // Log the action
      await logAction({
        action: "soft_delete",
        target_type: "cabang",
        target_id: branch.id,
        target_name: branch.name,
        details: { before: branch },
      });

      setMessage({ type: "success", text: "Cabang berhasil dihapus (soft delete)." });
      await loadBranches(company.id);
      const latestC = companyRef.current; if (latestC?.id) await loadAuditLogs(latestC.id);
      clearMessage();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal menghapus cabang." });
      clearMessage();
    }
  };

  // ========== KELOLA AKSES HELPERS ==========
  const loadAccesses = async (companyId: string) => {
    const { data, error } = await supabase
      .from("user_accesses")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load user accesses:", error);
    }

    setUserAccesses(data || []);
  };

  const openAddAccessModal = () => {
    setEditingAccess(null);
    setAccessForm({
      username: "",
      full_name: "",
      status: "active",
      accessible_modules: [],
      accessible_branches: [],
      can_create: false,
      can_edit: false,
      can_delete: false,
    });
    setShowAccessModal(true);
  };

  const openEditAccessModal = (access: any) => {
    setEditingAccess(access);
    setAccessForm({
      username: access.username || "",
      full_name: access.full_name || "",
      status: access.status || "active",
      accessible_modules: access.accessible_modules || [],
      accessible_branches: access.accessible_branches || [],
      can_create: access.can_create || false,
      can_edit: access.can_edit || false,
      can_delete: access.can_delete || false,
    });
    setShowAccessModal(true);
  };

  const closeAccessModal = () => {
    setShowAccessModal(false);
    setEditingAccess(null);
  };

  const toggleModuleAccess = (mod: string) => {
    setAccessForm((prev) => {
      const current = prev.accessible_modules || [];
      const updated = current.includes(mod)
        ? current.filter((m) => m !== mod)
        : [...current, mod];
      return { ...prev, accessible_modules: updated };
    });
  };

  const toggleBranchAccess = (branchName: string) => {
    setAccessForm((prev) => {
      const current = prev.accessible_branches || [];
      const updated = current.includes(branchName)
        ? current.filter((b) => b !== branchName)
        : [...current, branchName];
      return { ...prev, accessible_branches: updated };
    });
  };

  const handleAccessInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAccessForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccessPermissionChange = (key: "can_create" | "can_edit" | "can_delete") => {
    setAccessForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAccessSubmit = async () => {
    if (!company?.id) return;
    if (!accessForm.username.trim()) {
      setMessage({ type: "error", text: "Username wajib diisi." });
      clearMessage();
      return;
    }
    if (!isAdmin) {
      setMessage({ type: "error", text: "Hanya owner/admin yang dapat mengelola akses." });
      clearMessage();
      return;
    }

    setAccessModalLoading(true);
    setMessage(null);

    try {
      const normalizedUsername = accessForm.username.trim().toLowerCase();

      if (!editingAccess) {
        // Check unique username for this company (non-deleted)
        const { data: existing } = await supabase
          .from("user_accesses")
          .select("id")
          .eq("company_id", company.id)
          .eq("username", normalizedUsername)
          .is("deleted_at", null)
          .single();

        if (existing) {
          setMessage({ type: "error", text: "Username sudah digunakan di perusahaan ini." });
          clearMessage();
          setAccessModalLoading(false);
          return;
        }
      }

      const payload: any = {
        username: normalizedUsername,
        full_name: accessForm.full_name.trim() || null,
        status: accessForm.status,
        accessible_modules: accessForm.accessible_modules,
        can_create: accessForm.can_create,
        can_edit: accessForm.can_edit,
        can_delete: accessForm.can_delete,
      };

      // Hanya sertakan accessible_branches jika ada yang dipilih
      // (dan kolom sudah dibuat di DB via ALTER TABLE)
      if (accessForm.accessible_branches && accessForm.accessible_branches.length > 0) {
        payload.accessible_branches = accessForm.accessible_branches;
      }

      if (editingAccess) {
        const { data: updatedAccess, error } = await supabase
          .from("user_accesses")
          .update(payload)
          .eq("id", editingAccess.id)
          .select()
          .single();

        if (error) throw error;
        setMessage({ type: "success", text: "Akses pengguna berhasil diperbarui." });

        await logAction({
          action: "update",
          target_type: "akses_pengguna",
          target_id: editingAccess.id,
          target_name: normalizedUsername,
          details: { before: editingAccess, after: updatedAccess },
        });
      } else {
        const { data: newAccess, error } = await supabase
          .from("user_accesses")
          .insert({
            company_id: company.id,
            ...payload,
          })
          .select()
          .single();

        if (error) throw error;
        setMessage({ type: "success", text: "Akses pengguna baru berhasil ditambahkan." });

        await logAction({
          action: "create",
          target_type: "akses_pengguna",
          target_id: newAccess.id,
          target_name: normalizedUsername,
          details: { after: newAccess },
        });
      }

      closeAccessModal();
      await loadAccesses(company.id);
      const latestC = companyRef.current; if (latestC?.id) await loadAuditLogs(latestC.id);
      clearMessage();
    } catch (err: any) {
      console.error("Access submit error:", err);
      setMessage({
        type: "error",
        text: err.message || "Gagal menyimpan akses pengguna.",
      });
      clearMessage();
    } finally {
      setAccessModalLoading(false);
    }
  };

  const handleSoftDeleteAccess = async (access: any) => {
    if (!company?.id || !isAdmin) return;

    if (!confirm(`Hapus (soft delete) akses untuk "${access.username}"? Data masih bisa dilihat di Audit Log nanti.`)) return;

    try {
      const { error } = await supabase
        .from("user_accesses")
        .update({
          deleted_at: new Date().toISOString(),
          status: "inactive",
        })
        .eq("id", access.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Akses pengguna berhasil dihapus (soft delete)." });
      await loadAccesses(company.id);
      const latestC = companyRef.current; if (latestC?.id) await loadAuditLogs(latestC.id);
      clearMessage();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal menghapus akses." });
      clearMessage();
    }
  };

    // ========== AUDIT LOG HELPERS ==========
  const logAction = async (params: {
    action: "create" | "update" | "soft_delete" | "restore";
    target_type: "cabang" | "akses_pengguna";
    target_id: string;
    target_name: string;
    details?: any;
  }) => {
    const currentCompany = companyRef.current;
    const currentProfile = profileRef.current;

    if (!currentCompany?.id || !currentProfile?.id) {
      console.warn("logAction skipped: missing company or profile", { 
        company: !!currentCompany, 
        profile: !!currentProfile,
        companyId: currentCompany?.id,
        profileId: currentProfile?.id,
        profileKeys: currentProfile ? Object.keys(currentProfile) : null
      });
      return;
    }

    console.log("📝 Attempting to log:", params);

    const { error } = await supabase.from("audit_logs").insert({
      company_id: currentCompany.id,
      actor_id: currentProfile.id,
      actor_name: currentProfile.full_name || currentProfile.email || "Unknown",
      action: params.action,
      target_type: params.target_type,
      target_id: params.target_id,
      target_name: params.target_name,
      details: params.details || {},
    });

    if (error) {
      console.error("❌ Failed to write audit log:", error);
    } else {
      console.log(`✅ Audit log SUCCESS: ${params.action} → ${params.target_name}`);
    }
  };

  const loadAuditLogs = async (companyId: string) => {
    if (!companyId) return;
    setAuditLoading(true);
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("Failed to load audit logs (Supabase error):", error);
    } else {
      console.log("Loaded", data?.length || 0, "audit logs");
    }

    setAuditLogs(data || []);
    setAuditLoading(false);
    // reset page when fresh data loaded (e.g. refresh or tab switch)
    setAuditPage(1);
  };

  const handleRestore = async (log: any) => {
    if (!company?.id || !isAdmin) return;

    const confirmMsg = log.target_type === "cabang"
      ? `Restore cabang "${log.target_name}"?`
      : `Restore akses pengguna "${log.target_name}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      const table = log.target_type === "cabang" ? "branches" : "user_accesses";

      const { error } = await supabase
        .from(table)
        .update({ deleted_at: null, status: "active" })
        .eq("id", log.target_id);

      if (error) throw error;

      await logAction({
        action: "restore",
        target_type: log.target_type,
        target_id: log.target_id,
        target_name: log.target_name,
        details: { restored_from: log.id },
      });

      setMessage({ type: "success", text: "Data berhasil di-restore." });
      clearMessage();

      const latestC = companyRef.current || company;
      if (log.target_type === "cabang") {
        await loadBranches(latestC?.id);
      } else {
        await loadAccesses(latestC?.id);
      }

      if (latestC?.id) await loadAuditLogs(latestC.id);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal restore data." });
      clearMessage();
    }
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSearch =
      !auditFilter.search ||
      log.target_name?.toLowerCase().includes(auditFilter.search.toLowerCase()) ||
      log.actor_name?.toLowerCase().includes(auditFilter.search.toLowerCase());

    const matchesTarget =
      auditFilter.targetType === "all" || log.target_type === auditFilter.targetType;

    const matchesAction =
      auditFilter.action === "all" || log.action === auditFilter.action;

    // Date range filter (on created_at YYYY-MM-DD)
    const logDate = log.created_at ? new Date(log.created_at).toISOString().split("T")[0] : "";
    const matchesDate =
      (!auditFilter.dateFrom || logDate >= auditFilter.dateFrom) &&
      (!auditFilter.dateTo || logDate <= auditFilter.dateTo);

    return matchesSearch && matchesTarget && matchesAction && matchesDate;
  });

  // Pagination on filtered results (search + filters work on full data)
  const paginatedLogs = filteredAuditLogs.slice(
    (auditPage - 1) * auditPageSize,
    auditPage * auditPageSize
  );

  // Reload audit logs when switching to the audit tab (safe position after function defs)
  useEffect(() => {
    if (activeTab === "audit" && company?.id) {
      loadAuditLogs(company.id);
    }
  }, [activeTab, company?.id]);

  // Reset to first page when filters or page size change (but search/date still apply to all loaded data)
  useEffect(() => {
    setAuditPage(1);
  }, [auditFilter.search, auditFilter.targetType, auditFilter.action, auditFilter.dateFrom, auditFilter.dateTo, auditPageSize]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentRole={profile?.role} />
        <main
          className={`p-8 transition-all duration-300 ${collapsed ? "ml-24" : "ml-72"}`}
        >
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentRole={profile?.role} />

      <main
        className={`p-8 transition-all duration-300 ${collapsed ? "ml-24" : "ml-72"}`}
      >
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">Pengaturan</h1>
            <p className="text-sm text-slate-500">Kelola konfigurasi sistem</p>
          </div>
        </div>

        { !company && (
          <div className="max-w-3xl mx-auto rounded-3xl bg-white p-10 text-center shadow-sm border border-slate-200">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-900">
              Data Perusahaan Tidak Ditemukan
            </h3>
            <p className="mt-2 text-slate-500">
              Akun Anda belum terhubung ke data perusahaan. Hubungi administrator.
            </p>
          </div>
        )}

        { company && (
          <div className="max-w-3xl mx-auto">
            {/* Messages */}
            {message && (
              <div
                className={`mb-4 flex items-center gap-3 rounded-2xl px-5 py-3 text-sm ${
                  message.type === "success"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Tabs */}
            <div className="flex mb-6 border-b border-slate-200">
              <button
                onClick={() => setActiveTab("profil")}
                className={`px-5 py-3 text-sm font-medium transition border-b-2 ${
                  activeTab === "profil"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                Profil Perusahaan
              </button>
              <button
                onClick={() => setActiveTab("cabang")}
                className={`px-5 py-3 text-sm font-medium transition border-b-2 ${
                  activeTab === "cabang"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                Kelola Cabang
              </button>
              <button
                onClick={() => setActiveTab("akses")}
                className={`px-5 py-3 text-sm font-medium transition border-b-2 ${
                  activeTab === "akses"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                Kelola Akses
              </button>
              <button
                onClick={() => setActiveTab("audit")}
                className={`px-5 py-3 text-sm font-medium transition border-b-2 ${
                  activeTab === "audit"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                Audit Log
              </button>
              <button
                onClick={() => setActiveTab("organisasi")}
                className={`px-5 py-3 text-sm font-medium transition border-b-2 ${
                  activeTab === "organisasi"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                Pengaturan Organisasi
              </button>
            </div>

            {/* PROFIL PERUSAHAAN TAB */}
            {activeTab === "profil" && (
              <>
                {/* Permission notice (specific to profil) */}
                {!isAdmin && (
                  <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700">
                    <AlertCircle size={18} />
                    <span>
                      Anda login sebagai <strong>{profile?.role || "user"}</strong>. Hanya owner, admin, atau master admin yang dapat mengubah profil perusahaan.
                    </span>
                  </div>
                )}

                {/* Company Profile Form */}
                <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                  <Building2 size={22} className="text-[#041833]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Profil Perusahaan</h2>
                  <p className="text-sm text-slate-500">Data ini akan muncul di laporan dan dokumen</p>
                </div>
              </div>

              {/* Logo */}
              <div className="mb-8">
                <label className="mb-2 block text-sm font-medium text-slate-700">Logo Perusahaan</label>

                <div className="flex items-start gap-6">
                  <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo perusahaan"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Building2 size={36} className="text-slate-300" />
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                        isAdmin
                          ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Upload size={16} />
                      {logoPreview ? "Ganti Logo" : "Upload Logo"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={!isAdmin || saving}
                        className="hidden"
                      />
                    </label>

                    {logoPreview && (
                      <button
                        type="button"
                        onClick={clearSelectedLogo}
                        disabled={!isAdmin || saving}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        Hapus Logo
                      </button>
                    )}

                    <p className="mt-1 text-xs text-slate-400">
                      Rekomendasi: PNG/JPG transparan, maksimal 2 MB. Ukuran ideal 256×256 px.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Nama Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={form.company_name}
                    onChange={handleInputChange}
                    disabled={!isAdmin || saving}
                    placeholder="PT. Contoh Sukses Abadi"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Alamat Lengkap</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    disabled={!isAdmin || saving}
                    rows={3}
                    placeholder="Jl. Raya Industri No. 123, ..."
                    className="w-full resize-y rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">No. Telepon</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      disabled={!isAdmin || saving}
                      placeholder="021-1234567"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Perusahaan</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      disabled={!isAdmin || saving}
                      placeholder="info@perusahaan.co.id"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">NPWP</label>
                  <input
                    type="text"
                    name="npwp"
                    value={form.npwp}
                    onChange={handleInputChange}
                    disabled={!isAdmin || saving}
                    placeholder="12.345.678.9-012.345"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  <p className="mt-1 text-xs text-slate-400">Format: XX.XXX.XXX.X-XXX.XXX</p>
                </div>
              </div>

              {/* Note (can be removed later) */}
              <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
                Catatan: Kolom <code>address, phone, email, npwp, logo_url</code> perlu ada di tabel <strong>companies</strong> dan bucket Storage <strong>company-logos</strong> (public).
              </div>

              {/* Actions */}
              <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
                <button
                  onClick={() => router.push("/dashboard")}
                  disabled={saving}
                  className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Kembali ke Dashboard
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving || !isAdmin}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">
              Perubahan langsung tersimpan ke cloud Supabase. Refresh halaman lain untuk melihat update.
            </p>
              </>
            )}

            {/* KELOLA CABANG TAB */}
            {activeTab === "cabang" && (
              <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                      <MapPin size={22} className="text-[#041833]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Kelola Cabang</h2>
                      <p className="text-sm text-slate-500">Tambah, edit, dan sesuaikan cabang perusahaan Anda</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={openAddBranchModal}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold transition text-sm"
                    >
                      <Plus size={18} /> Tambah Cabang
                    </button>
                  )}
                </div>

                {/* Permission notice for cabang (read-only) */}
                {!isAdmin && (
                  <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700">
                    <AlertCircle size={18} />
                    <span>
                      Anda login sebagai <strong>{profile?.role || "user"}</strong>. Anda hanya dapat melihat daftar cabang.
                    </span>
                  </div>
                )}

                {/* Branches Table */}
                {branches.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
                    <MapPin className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-slate-500">Belum ada cabang yang terdaftar.</p>
                    {isAdmin && <p className="text-sm text-slate-400 mt-1">Klik tombol "Tambah Cabang" untuk memulai.</p>}
                  </div>
                ) : (
                  <div className="overflow-hidden border border-slate-200 rounded-2xl">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Nama Cabang</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Alamat</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Telepon</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {branches.map((branch) => (
                          <tr key={branch.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-900">{branch.name}</td>
                            <td className="px-4 py-3 text-slate-700">{branch.address || "-"}</td>
                            <td className="px-4 py-3 text-slate-700">{branch.phone || "-"}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                                  branch.status === "active"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {branch.status === "active" ? "Aktif" : "Nonaktif"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditBranchModal(branch)}
                                  disabled={!isAdmin}
                                  className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm disabled:text-slate-400 disabled:cursor-not-allowed"
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteBranch(branch)}
                                  disabled={!isAdmin}
                                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm disabled:text-slate-400 disabled:cursor-not-allowed"
                                >
                                  <Trash2 size={14} /> Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            )}

            {/* KELOLA AKSES TAB */}
            {activeTab === "akses" && (
              <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                      <Shield size={22} className="text-[#041833]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Kelola Akses</h2>
                      <p className="text-sm text-slate-500">Tambah pengguna, atur hak akses modul, create/edit/delete (soft delete)</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={openAddAccessModal}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold transition text-sm"
                    >
                      <Plus size={18} /> Tambah Akses
                    </button>
                  )}
                </div>

                {/* Permission notice */}
                {!isAdmin && (
                  <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700">
                    <AlertCircle size={18} />
                    <span>
                      Anda hanya dapat melihat daftar akses. Hubungi admin untuk mengubah.
                    </span>
                  </div>
                )}

                {/* Accesses Table */}
                {userAccesses.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
                    <Users className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-slate-500">Belum ada akses pengguna terdaftar.</p>
                    {isAdmin && <p className="text-sm text-slate-400 mt-1">Klik "Tambah Akses" untuk mendaftarkan pengguna pertama.</p>}
                  </div>
                ) : (
                  <div className="overflow-hidden border border-slate-200 rounded-2xl">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Username</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Nama Pengguna</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Modul Diakses</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Cabang Diakses</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Hak Akses</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {userAccesses.map((access) => (
                          <tr key={access.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-900">{access.username}</td>
                            <td className="px-4 py-3 text-slate-700">{access.full_name || "-"}</td>
                            <td className="px-4 py-3 text-slate-700 text-sm">
                              {access.accessible_modules && access.accessible_modules.length > 0
                                ? access.accessible_modules.join(", ")
                                : "-"}
                            </td>
                            <td className="px-4 py-3 text-slate-700 text-sm">
                              {access.accessible_branches && access.accessible_branches.length > 0
                                ? access.accessible_branches.join(", ")
                                : "-"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="text-emerald-700">
                                {[
                                  access.can_create && "Tambah",
                                  access.can_edit && "Edit",
                                  access.can_delete && "Hapus",
                                ]
                                  .filter(Boolean)
                                  .join(", ") || "View only"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                                  access.status === "active"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {access.status === "active" ? "Aktif" : "Nonaktif"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditAccessModal(access)}
                                  disabled={!isAdmin}
                                  className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm disabled:text-slate-400 disabled:cursor-not-allowed"
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => handleSoftDeleteAccess(access)}
                                  disabled={!isAdmin}
                                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm disabled:text-slate-400 disabled:cursor-not-allowed"
                                >
                                  <Trash2 size={14} /> Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* AUDIT LOG TAB */}
            {activeTab === "audit" && (
              <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                      <History size={22} className="text-[#041833]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Audit Log</h2>
                      <p className="text-sm text-slate-500">Riwayat perubahan cabang dan akses pengguna (soft delete & restore tercatat)</p>
                    </div>
                  </div>

                  <button
                    onClick={() => loadAuditLogs(company?.id || "")}
                    disabled={auditLoading}
                    className="flex items-center gap-2 border border-blue-300 bg-blue-50 px-4 py-2 rounded-xl text-sm text-blue-700 hover:bg-blue-100 hover:text-blue-800 disabled:opacity-50 transition font-medium"
                  >
                    {auditLoading ? "Memuat..." : "Refresh"}
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Cari nama target atau aktor..."
                    value={auditFilter.search}
                    onChange={(e) => setAuditFilter((prev) => ({ ...prev, search: e.target.value }))}
                    className="border border-slate-300 rounded-xl px-4 py-2 w-64 text-sm text-slate-900 placeholder:text-slate-400"
                  />
                  <select
                    value={auditFilter.targetType}
                    onChange={(e) => setAuditFilter((prev) => ({ ...prev, targetType: e.target.value as any }))}
                    className="border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="all">Semua Target</option>
                    <option value="cabang">Cabang</option>
                    <option value="akses_pengguna">Akses Pengguna</option>
                  </select>
                  <select
                    value={auditFilter.action}
                    onChange={(e) => setAuditFilter((prev) => ({ ...prev, action: e.target.value as any }))}
                    className="border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="all">Semua Aksi</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="soft_delete">Soft Delete</option>
                    <option value="restore">Restore</option>
                  </select>

                  {/* Date range filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Dari</span>
                    <input
                      type="date"
                      value={auditFilter.dateFrom}
                      onChange={(e) => setAuditFilter((prev) => ({ ...prev, dateFrom: e.target.value }))}
                      className="border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Sampai</span>
                    <input
                      type="date"
                      value={auditFilter.dateTo}
                      onChange={(e) => setAuditFilter((prev) => ({ ...prev, dateTo: e.target.value }))}
                      className="border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                </div>

                {/* Audit Table */}
                {auditLoading ? (
                  <div className="text-center py-8 text-slate-500">Memuat log...</div>
                ) : filteredAuditLogs.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl text-slate-500">
                    Tidak ada log yang cocok dengan filter.
                  </div>
                ) : (
                  <div className="overflow-hidden border border-slate-200 rounded-2xl">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-500">Waktu</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-500">Aktor</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-500">Aksi</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-500">Target</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-500">Detail</th>
                          <th className="px-4 py-3 text-right font-semibold text-slate-500">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {paginatedLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                              {new Date(log.created_at).toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-3 text-slate-700">{log.actor_name || "-"}</td>
                            <td className="px-4 py-3">
                              <span className={`inline px-2 py-0.5 text-xs rounded-full ${
                                log.action === "soft_delete" ? "bg-red-100 text-red-700" :
                                log.action === "restore" ? "bg-emerald-100 text-emerald-700" :
                                log.action === "create" ? "bg-blue-100 text-blue-700" :
                                "bg-amber-100 text-amber-700"
                              }`}>
                                {log.action.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-medium text-slate-900">{log.target_name}</span>
                              <span className="ml-2 text-xs text-slate-500">({log.target_type})</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 max-w-[280px] truncate">
                              {log.details ? JSON.stringify(log.details).slice(0, 120) + (JSON.stringify(log.details).length > 120 ? "..." : "") : "-"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {(log.action === "soft_delete" || log.details?.restored_from) && (
                                <button
                                  onClick={() => handleRestore(log)}
                                  disabled={!isAdmin}
                                  className="text-emerald-600 hover:text-emerald-700 text-sm disabled:text-slate-400"
                                >
                                  Restore
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination controls - does not affect full search/filter results */}
                {filteredAuditLogs.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-sm">
                    <div className="text-slate-500">
                      Menampilkan {(auditPage - 1) * auditPageSize + 1}–{Math.min(auditPage * auditPageSize, filteredAuditLogs.length)} dari {filteredAuditLogs.length} hasil
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                        disabled={auditPage === 1}
                        className="px-3 py-1 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:text-slate-400 transition flex items-center justify-center"
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="px-2 text-slate-600">Hal. {auditPage}</span>
                      <button
                        onClick={() => setAuditPage((p) => p + 1)}
                        disabled={auditPage * auditPageSize >= filteredAuditLogs.length}
                        className="px-3 py-1 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:text-slate-400 transition flex items-center justify-center"
                        aria-label="Next page"
                      >
                        <ChevronRight size={16} />
                      </button>

                      <select
                        value={auditPageSize}
                        onChange={(e) => {
                          setAuditPageSize(Number(e.target.value));
                          // page reset handled by useEffect
                        }}
                        className="ml-2 border border-slate-300 rounded-xl px-2 py-1 text-sm text-slate-900"
                      >
                        <option value={10}>10 / hal</option>
                        <option value={20}>20 / hal</option>
                        <option value={50}>50 / hal</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-xs text-slate-400">
                  Data dimuat maksimal 500 log terbaru dari server. Filter & pencarian bekerja pada data yang dimuat. Gunakan rentang tanggal untuk data lebih spesifik. Tampilan dibatasi per halaman (10/20/50) tanpa memengaruhi hasil pencarian/filter.
                </div>
              </div>
            )}

            {/* PENGATURAN ORGANISASI TAB */}
            {activeTab === "organisasi" && (
              <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                    <Users size={22} className="text-[#041833]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Pengaturan Organisasi</h2>
                    <p className="text-sm text-slate-500">Kelola master data Departemen dan Jabatan. Data ini akan digunakan di form master karyawan.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Departemen */}
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3">Daftar Departemen</h3>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newDepartemen}
                        onChange={(e) => setNewDepartemen(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") addDepartemen(); }}
                        className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        placeholder="Nama departemen baru"
                      />
                      <button
                        onClick={addDepartemen}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm hover:bg-emerald-600 flex items-center gap-1"
                      >
                        <Plus size={16} /> Tambah
                      </button>
                    </div>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      {departemenList.length === 0 ? (
                        <div className="p-4 text-sm text-slate-500 text-center">Belum ada departemen.</div>
                      ) : (
                        <ul className="divide-y divide-slate-100">
                          {departemenList.map((item, idx) => (
                            <li key={idx} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-50">
                              <span className="text-slate-800">{item}</span>
                              <button onClick={() => removeDepartemen(item)} className="text-red-500 hover:text-red-600 p-1">
                                <Trash2 size={15} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Jabatan */}
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3">Daftar Jabatan</h3>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newJabatan}
                        onChange={(e) => setNewJabatan(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") addJabatan(); }}
                        className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        placeholder="Nama jabatan baru"
                      />
                      <button
                        onClick={addJabatan}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm hover:bg-emerald-600 flex items-center gap-1"
                      >
                        <Plus size={16} /> Tambah
                      </button>
                    </div>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      {jabatanList.length === 0 ? (
                        <div className="p-4 text-sm text-slate-500 text-center">Belum ada jabatan.</div>
                      ) : (
                        <ul className="divide-y divide-slate-100">
                          {jabatanList.map((item, idx) => (
                            <li key={idx} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-50">
                              <span className="text-slate-800">{item}</span>
                              <button onClick={() => removeJabatan(item)} className="text-red-500 hover:text-red-600 p-1">
                                <Trash2 size={15} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-xs text-slate-500">
                  Data ini disimpan di cloud (tabel companies) dan akan tersedia sebagai pilihan di form Tambah/Edit Karyawan di modul SDM. Edit di sini akan langsung ter-reflect setelah refresh halaman SDM.
                </div>
              </div>
            )}

            <p className="mt-4 text-center text-xs text-slate-400">
              Perubahan langsung tersimpan ke cloud Supabase. Refresh halaman lain untuk melihat update.
            </p>
          </div>
        )}
      </main>

      {/* Branch Add/Edit Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="flex min-h-full items-center justify-center">
            <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-900">
                {editingBranch ? "Edit Cabang" : "Tambah Cabang Baru"}
              </h3>
              <button onClick={closeBranchModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-700 mb-1">Nama Cabang <span className="text-red-500">*</span></label>
                <input
                  name="name"
                  value={branchForm.name}
                  onChange={handleBranchInputChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  placeholder="Cabang Jakarta Pusat"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Alamat</label>
                <textarea
                  name="address"
                  value={branchForm.address}
                  onChange={handleBranchInputChange}
                  rows={2}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 resize-y"
                  placeholder="Jl. Sudirman No. 123, Jakarta"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Telepon</label>
                <input
                  name="phone"
                  value={branchForm.phone}
                  onChange={handleBranchInputChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  placeholder="021-1234567"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Status</label>
                <select
                  name="status"
                  value={branchForm.status}
                  onChange={handleBranchInputChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeBranchModal}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm hover:bg-slate-50 hover:text-slate-900 transition"
              >
                Batal
              </button>
              <button
                onClick={handleBranchSubmit}
                disabled={branchModalLoading}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:bg-emerald-300"
              >
                {branchModalLoading ? "Menyimpan..." : editingBranch ? "Simpan Perubahan" : "Tambah Cabang"}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Access Add/Edit Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="flex min-h-full items-center justify-center">
            <div className="mx-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-900">
                {editingAccess ? "Edit Akses Pengguna" : "Tambah Akses Pengguna Baru"}
              </h3>
              <button onClick={closeAccessModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1">Username <span className="text-red-500">*</span></label>
                  <input
                    name="username"
                    value={accessForm.username}
                    onChange={handleAccessInputChange}
                    disabled={!!editingAccess}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 disabled:bg-slate-100"
                    placeholder="username.unik"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Nama Pengguna</label>
                  <input
                    name="full_name"
                    value={accessForm.full_name}
                    onChange={handleAccessInputChange}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                    placeholder="Nama Lengkap"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Status</label>
                <select
                  name="status"
                  value={accessForm.status}
                  onChange={handleAccessInputChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Modul yang Dapat Diakses</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto border border-slate-200 rounded-xl p-3">
                  {AVAILABLE_MODULES.map((mod) => (
                    <label key={mod} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={accessForm.accessible_modules.includes(mod)}
                        onChange={() => toggleModuleAccess(mod)}
                      />
                      {mod}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Cabang yang Dapat Diakses</label>
                <div className="space-y-2 border border-slate-200 rounded-xl p-3">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={accessForm.accessible_branches.includes("Pusat")}
                      onChange={() => toggleBranchAccess("Pusat")}
                    />
                    Pusat (Kantor Pusat)
                  </label>
                  {branches.length > 0 && (
                    <div className="border-t border-slate-100 pt-2">
                      <div className="text-xs text-slate-500 mb-1">Cabang:</div>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-auto">
                        {branches.map((branch) => (
                          <label key={branch.id} className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={accessForm.accessible_branches.includes(branch.name)}
                              onChange={() => toggleBranchAccess(branch.name)}
                            />
                            {branch.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Hak Akses (untuk modul yang dipilih)</label>
                <div className="space-y-2 border border-slate-200 rounded-xl p-3">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={accessForm.can_create}
                      onChange={() => handleAccessPermissionChange("can_create")}
                    />
                    Dapat Menambah / Input Baru
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={accessForm.can_edit}
                      onChange={() => handleAccessPermissionChange("can_edit")}
                    />
                    Dapat Mengedit
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={accessForm.can_delete}
                      onChange={() => handleAccessPermissionChange("can_delete")}
                    />
                    Dapat Menghapus (soft delete)
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeAccessModal}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm hover:bg-slate-50 hover:text-slate-900 transition"
              >
                Batal
              </button>
              <button
                onClick={handleAccessSubmit}
                disabled={accessModalLoading}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:bg-emerald-300"
              >
                {accessModalLoading ? "Menyimpan..." : editingAccess ? "Simpan Perubahan" : "Tambah Akses"}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default function PengaturanPage() {
  return (
    <Suspense fallback={null}>
      <PengaturanContent />
    </Suspense>
  );
}

