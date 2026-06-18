"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "../component/Sidebar";
import * as XLSX from 'xlsx';
import {
  FileText,
  Package,
  Users,
  UserCheck,
  Loader2,
  Plus,
  X,
  Pencil,
  Trash2,
  Search,
  Settings,
  Upload,
  DollarSign,
  CreditCard,
  Download,
  Tag,
} from "lucide-react";

function DataMasterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"coa" | "currency" | "item" | "supplier" | "customer" | "harga">(
    (searchParams.get("tab") as "coa" | "currency" | "item" | "supplier" | "customer" | "harga") || "coa"
  );

  // COA states
  const [coaList, setCoaList] = useState<any[]>([]);
  const [showCoaModal, setShowCoaModal] = useState(false);
  const [coaModalLoading, setCoaModalLoading] = useState(false);
  type CoaForm = {
    type: string;
    parent_id: string | null;
    code: string;
    name: string;
    normal_balance: string;
    saldo_awal: number;
    [key: string]: any; // allow dynamic updates from form inputs
  };

  const [coaForm, setCoaForm] = useState<CoaForm>({
    type: "Aset",
    parent_id: null,
    code: "",           // full code if no parent, or suffix if has parent
    name: "",
    normal_balance: "Debit",
    saldo_awal: 0,
  });

  const [editingCoaId, setEditingCoaId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const saldoInputRef = useRef<HTMLInputElement>(null);

  // Decimal settings for the company (affects all monetary inputs later)
  const [decimalSettings, setDecimalSettings] = useState({
    decimal_places: 2,
    rounding_method: 'runup' as 'runup' | 'rundown',
  });
  const [showDecimalModal, setShowDecimalModal] = useState(false);
  const [tempDecimalPlaces, setTempDecimalPlaces] = useState(2);
  const [tempRoundingMethod, setTempRoundingMethod] = useState<'runup' | 'rundown'>('runup');

  // Pure fetch helper for decimal settings (defined early so load/save can use it without declaration order issues)
  const fetchDecimalSettings = async (cid: string) => {
    const { data, error } = await supabase
      .from("companies")
      .select("decimal_places, rounding_method")
      .eq("id", cid)
      .maybeSingle();

    if (error) {
      console.error('[Decimal] fetchDecimalSettings error:', error);
      return null;
    }
    if (!data) return null;

    return {
      decimal_places: data.decimal_places ?? 2,
      rounding_method: (data.rounding_method as 'runup' | 'rundown') ?? 'runup',
    };
  };

  // Import COA states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importLoading, setImportLoading] = useState(false);

  // Currency / Mata Uang states
  const [currencyList, setCurrencyList] = useState<any[]>([]);
  const [exchangeRateList, setExchangeRateList] = useState<any[]>([]);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [editingCurrencyId, setEditingCurrencyId] = useState<string | null>(null);
  const [currencyForm, setCurrencyForm] = useState({
    code: "",
    name: "",
    symbol: "",
    is_base: false,
    is_active: true,
    decimal_places: 2,
  });
  const [showRateModal, setShowRateModal] = useState(false);
  const [rateForm, setRateForm] = useState({
    currency_code: "",
    rate_date: new Date().toISOString().split("T")[0],
    rate: "",
    source: "Manual",
  });
  const [rateModalLoading, setRateModalLoading] = useState(false);

  // Master Item states
  const [itemList, setItemList] = useState<any[]>([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    kode: "",
    nama: "",
    kategori: "Barang Jadi",
    satuan: "Unit",
    status: "Aktif",
    coa_id: null as string | null,
    coa_code: "",
    coa_name: "",
  });
  const [showCoaPickerForItem, setShowCoaPickerForItem] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [itemFilterKategori, setItemFilterKategori] = useState("all");
  const [itemFilterSatuan, setItemFilterSatuan] = useState("all");
  const [itemFilterStatus, setItemFilterStatus] = useState("all");
  const [bulkApplyCoa, setBulkApplyCoa] = useState(false);

  const [coaItemSearch, setCoaItemSearch] = useState("");
  const [showItemSettingsModal, setShowItemSettingsModal] = useState(false);

  // Dynamic categories and units with per-category code settings
  const [itemCategories, setItemCategories] = useState<any[]>([]); // {id, name, code_prefix, code_length}
  const [itemUnits, setItemUnits] = useState<any[]>([]); // {id, name}
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", code_prefix: "", code_length: 3 });
  const [unitForm, setUnitForm] = useState({ name: "" });

  // Item Import states (mirroring COA import pattern)
  const [showItemImportModal, setShowItemImportModal] = useState(false);
  const [itemImportFile, setItemImportFile] = useState<File | null>(null);
  const [itemImportProgress, setItemImportProgress] = useState(0);
  const [itemImportLoading, setItemImportLoading] = useState(false);

  // Master Supplier states (modeled after Master Item)
  const [supplierList, setSupplierList] = useState<any[]>([]);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    kode: "",
    nama: "",
    kontak: "",
    telepon: "",
    email: "",
    alamat: "",
    npwp: "",
    limit_kredit: 0,
    syarat_pembayaran: "30 hari",
    coa_id: null as string | null,
    coa_code: "",
    coa_name: "",
    status: "Aktif",
  });
  const [showSupplierSettingsModal, setShowSupplierSettingsModal] = useState(false);
  const [showSupplierImportModal, setShowSupplierImportModal] = useState(false);
  const [supplierImportFile, setSupplierImportFile] = useState<File | null>(null);
  const [supplierImportProgress, setSupplierImportProgress] = useState(0);
  const [supplierImportLoading, setSupplierImportLoading] = useState(false);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [supplierFilterSyarat, setSupplierFilterSyarat] = useState("all");
  const [supplierFilterStatus, setSupplierFilterStatus] = useState("all");

  // Supplier settings (per-concept from currency/item)
  const [supplierCodePrefix, setSupplierCodePrefix] = useState("SUP-");
  const [supplierCodeLength, setSupplierCodeLength] = useState(3);
  const [syaratPembayaranList, setSyaratPembayaranList] = useState<string[]>(["Tunai", "30 hari", "60 hari", "90 hari"]);

  // Temp states for supplier settings modal (changes only saved on Simpan)
  const [tempSupplierCodePrefix, setTempSupplierCodePrefix] = useState("SUP-");
  const [tempSupplierCodeLength, setTempSupplierCodeLength] = useState(3);
  const [tempSyaratPembayaranList, setTempSyaratPembayaranList] = useState<string[]>([]);

  // Master Customer states (modeled after Master Supplier)
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [customerForm, setCustomerForm] = useState({
    kode: "",
    nama: "",
    kontak: "",
    telepon: "",
    email: "",
    alamat: "",
    npwp: "",
    limit_kredit: 0,
    syarat_pembayaran: "30 hari",
    coa_id: null as string | null,
    coa_code: "",
    coa_name: "",
    status: "Aktif",
  });
  const [showCustomerSettingsModal, setShowCustomerSettingsModal] = useState(false);
  const [showCustomerImportModal, setShowCustomerImportModal] = useState(false);
  const [customerImportFile, setCustomerImportFile] = useState<File | null>(null);
  const [customerImportProgress, setCustomerImportProgress] = useState(0);
  const [customerImportLoading, setCustomerImportLoading] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [customerFilterSyarat, setCustomerFilterSyarat] = useState("all");
  const [customerFilterStatus, setCustomerFilterStatus] = useState("all");

  // Customer settings (similar to supplier)
  const [customerCodePrefix, setCustomerCodePrefix] = useState("CUS-");
  const [customerCodeLength, setCustomerCodeLength] = useState(3);
  const [customerSyaratList, setCustomerSyaratList] = useState<string[]>(["Tunai", "30 hari", "60 hari", "90 hari"]);

  // Temp states for customer settings modal
  const [tempCustomerCodePrefix, setTempCustomerCodePrefix] = useState("CUS-");
  const [tempCustomerCodeLength, setTempCustomerCodeLength] = useState(3);
  const [tempCustomerSyaratList, setTempCustomerSyaratList] = useState<string[]>([]);

  // Member Card state
  const [showMemberCardModal, setShowMemberCardModal] = useState(false);
  const [selectedCustomerForCard, setSelectedCustomerForCard] = useState<any>(null);

  // Master Harga states (new concept: harga per item or per customer)
  const [hargaList, setHargaList] = useState<any[]>([]);
  const [showHargaModal, setShowHargaModal] = useState(false);
  const [editingHargaId, setEditingHargaId] = useState<string | null>(null);
  const [hargaForm, setHargaForm] = useState({
    kode: "", // internal only, not shown/editable per spec
    item_id: null as string | null,
    item_kode: "",
    item_nama: "",
    is_customer_specific: false,
    customer_id: null as string | null,
    customer_kode: "",
    customer_nama: "",
    harga: 0,
    berlaku_mulai: new Date().toISOString().split("T")[0],
  });
  const [showHargaItemPicker, setShowHargaItemPicker] = useState(false);
  const [showHargaCustomerPicker, setShowHargaCustomerPicker] = useState(false);
  const [hargaItemSearch, setHargaItemSearch] = useState("");
  const [hargaCustomerSearch, setHargaCustomerSearch] = useState("");
  const [showHargaImportModal, setShowHargaImportModal] = useState(false);
  const [hargaImportFile, setHargaImportFile] = useState<File | null>(null);
  const [hargaImportProgress, setHargaImportProgress] = useState(0);
  const [hargaImportLoading, setHargaImportLoading] = useState(false);
  const [hargaSearchTerm, setHargaSearchTerm] = useState("");
  const [hargaFilterStatus, setHargaFilterStatus] = useState("all"); // all | customer | umum

  // No settings needed per new spec (no prefix, no dynamic list)

  const getPreviewCode = () => {
    if (!coaForm.parent_id) {
      return coaForm.code || "—";
    }
    const parent = coaList.find((c: any) => c.id === coaForm.parent_id);
    if (!parent) return coaForm.code || "—";
    const suffix = coaForm.code ? coaForm.code.padStart(3, "0") : "001";
    return `${parent.code}-${suffix}`;
  };

  const previewCode = getPreviewCode();

  // Load profile (for role and sidebar)
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
        .select("company_id, full_name, role")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        console.log('[Decimal] Profile loaded, company_id =', profileData.company_id);
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  const DEFAULT_COA = [
    // ASET LANCAR
    { code: "1100", name: "Kas", type: "Aset", normal_balance: "Debit", saldo_awal: 0 },
    { code: "1110", name: "Bank", type: "Aset", normal_balance: "Debit", saldo_awal: 0 },
    { code: "1120", name: "Piutang Usaha", type: "Aset", normal_balance: "Debit", saldo_awal: 0 },
    { code: "1130", name: "Persediaan Barang Dagang", type: "Aset", normal_balance: "Debit", saldo_awal: 0 },
    { code: "1140", name: "Uang Muka", type: "Aset", normal_balance: "Debit", saldo_awal: 0 },

    // ASET TETAP
    { code: "1200", name: "Tanah", type: "Aset", normal_balance: "Debit", saldo_awal: 0 },
    { code: "1210", name: "Bangunan", type: "Aset", normal_balance: "Debit", saldo_awal: 0 },
    { code: "1220", name: "Kendaraan", type: "Aset", normal_balance: "Debit", saldo_awal: 0 },
    { code: "1230", name: "Peralatan Kantor", type: "Aset", normal_balance: "Debit", saldo_awal: 0 },
    { code: "1290", name: "Akumulasi Penyusutan", type: "Aset", normal_balance: "Kredit", saldo_awal: 0 },

    // KEWAJIBAN
    { code: "2100", name: "Hutang Usaha", type: "Kewajiban", normal_balance: "Kredit", saldo_awal: 0 },
    { code: "2110", name: "Hutang Pajak", type: "Kewajiban", normal_balance: "Kredit", saldo_awal: 0 },
    { code: "2120", name: "Hutang Gaji", type: "Kewajiban", normal_balance: "Kredit", saldo_awal: 0 },
    { code: "2200", name: "Hutang Jangka Panjang", type: "Kewajiban", normal_balance: "Kredit", saldo_awal: 0 },

    // EKUITAS
    { code: "3100", name: "Modal Disetor", type: "Ekuitas", normal_balance: "Kredit", saldo_awal: 0 },
    { code: "3200", name: "Laba Ditahan", type: "Ekuitas", normal_balance: "Kredit", saldo_awal: 0 },
    { code: "3300", name: "Laba Berjalan", type: "Ekuitas", normal_balance: "Kredit", saldo_awal: 0 },

    // PENDAPATAN
    { code: "4100", name: "Pendapatan Penjualan", type: "Pendapatan", normal_balance: "Kredit", saldo_awal: 0 },
    { code: "4200", name: "Pendapatan Jasa", type: "Pendapatan", normal_balance: "Kredit", saldo_awal: 0 },
    { code: "4300", name: "Pendapatan Lain-lain", type: "Pendapatan", normal_balance: "Kredit", saldo_awal: 0 },

    // BEBAN
    { code: "5100", name: "Beban Pokok Penjualan", type: "Beban", normal_balance: "Debit", saldo_awal: 0 },
    { code: "5200", name: "Beban Gaji", type: "Beban", normal_balance: "Debit", saldo_awal: 0 },
    { code: "5210", name: "Beban Sewa", type: "Beban", normal_balance: "Debit", saldo_awal: 0 },
    { code: "5220", name: "Beban Listrik & Air", type: "Beban", normal_balance: "Debit", saldo_awal: 0 },
    { code: "5230", name: "Beban Transportasi", type: "Beban", normal_balance: "Debit", saldo_awal: 0 },
    { code: "5240", name: "Beban Penyusutan", type: "Beban", normal_balance: "Debit", saldo_awal: 0 },
    { code: "5300", name: "Beban Operasional Lainnya", type: "Beban", normal_balance: "Debit", saldo_awal: 0 },
  ];

  const loadCoa = async () => {
    if (!profile?.company_id) return;

    const { data, error } = await supabase
      .from("coa")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("code", { ascending: true });

    if (error) {
      console.error("Error loading COA:", error);
      // Jika tabel belum ada, biarkan kosong (user harus buat tabel dulu)
      return;
    }

    setCoaList(data || []);
  };

  const loadDecimalSettings = async (companyId?: string) => {
    const cid = companyId || profile?.company_id;
    if (!cid) {
      console.log('[Decimal] load skipped: no company_id');
      return;
    }

    console.log('[Decimal] Loading for company_id:', cid);
    const settings = await fetchDecimalSettings(cid);

    if (settings) {
      console.log('[Decimal] Loaded from DB — decimal_places:', settings.decimal_places, 'rounding_method:', settings.rounding_method);
      setDecimalSettings(settings);
    } else {
      console.warn('[Decimal] No company row returned (0 rows). RLS may be blocking SELECT on companies table, or company_id mismatch. UI state will not be overwritten from DB.');
    }
  };

  const roundValue = (value: number, decimals: number, method: 'runup' | 'rundown'): number => {
    if (decimals < 0) decimals = 0;
    const factor = Math.pow(10, decimals);
    if (method === 'runup') {
      return Math.round(value * factor) / factor;
    } else {
      return Math.floor(value * factor) / factor;
    }
  };

  const saveDecimalSettings = async () => {
    if (!profile?.company_id) return;

    const cid = profile.company_id;
    const intended = {
      decimal_places: tempDecimalPlaces,
      rounding_method: tempRoundingMethod,
    };

    console.log('[Decimal] Saving for company_id:', cid, 'intended:', intended);

    // 1. Perform the UPDATE (plain, no .single())
    const { error: updateError } = await supabase
      .from("companies")
      .update({
        decimal_places: tempDecimalPlaces,
        rounding_method: tempRoundingMethod,
      })
      .eq("id", cid);

    if (updateError) {
      console.error('[Decimal] Save (update) error:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        full: updateError
      });
      alert("Gagal menyimpan pengaturan desimal: " + (updateError.message || JSON.stringify(updateError)));
      return;
    }

    console.log('[Decimal] UPDATE call returned no error. Verifying what is actually in DB now...');

    // 2. Verify by reading back the value (fresh query)
    const fresh = await fetchDecimalSettings(cid);
    console.log('[Decimal] Value in DB right after UPDATE:', fresh);

    if (fresh) {
      if (fresh.decimal_places !== tempDecimalPlaces || fresh.rounding_method !== tempRoundingMethod) {
        console.warn('[Decimal] MISMATCH after UPDATE! DB still shows old value. UPDATE likely affected 0 rows due to RLS.');
        // Keep the intended for current session so formatting works immediately
        setDecimalSettings(intended);
        alert(
          "Peringatan: Supabase bilang UPDATE berhasil, tapi saat dibaca ulang DB masih menampilkan nilai lama (" +
            fresh.decimal_places + "). " +
            "Kemungkinan besar RLS policy di tabel 'companies' mengizinkan SELECT tapi memblokir atau mengabaikan UPDATE untuk user/role ini. " +
            "Setting akan berlaku di halaman ini sampai refresh. Coba cek nilai asli pakai SQL Editor (lihat instruksi di chat)."
        );
      } else {
        // Perfect, DB has the new value
        console.log('[Decimal] Success: DB now has the intended value.');
        setDecimalSettings(intended);
      }
    } else {
      console.warn('[Decimal] After UPDATE, could not read back any row. Setting locally for this session.');
      setDecimalSettings(intended);
    }

    setShowDecimalModal(false);
    await loadCoa(); // refresh table display using the (new) decimalSettings state
  };

  // ========== CURRENCY / MASTER MATA UANG ==========
  const loadCurrencies = async () => {
    if (!profile?.company_id) return;

    const { data, error } = await supabase
      .from("currencies")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("code", { ascending: true });

    if (error) {
      console.error("Error loading currencies:", error);
      return;
    }
    setCurrencyList(data || []);
  };

  const loadExchangeRates = async (limit = 20) => {
    if (!profile?.company_id) return;

    const { data, error } = await supabase
      .from("exchange_rates")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("rate_date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error loading exchange rates:", error);
      return;
    }
    setExchangeRateList(data || []);
  };

  const loadDefaultCurrencies = async () => {
    if (!profile?.company_id) return;

    const defaults = [
      { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", is_base: true, is_active: true, decimal_places: 0 },
      { code: "USD", name: "US Dollar", symbol: "$", is_base: false, is_active: true, decimal_places: 2 },
      { code: "EUR", name: "Euro", symbol: "€", is_base: false, is_active: true, decimal_places: 2 },
      { code: "SGD", name: "Singapore Dollar", symbol: "S$", is_base: false, is_active: true, decimal_places: 2 },
    ];

    const { data: existing } = await supabase
      .from("currencies")
      .select("code")
      .eq("company_id", profile.company_id);

    const existingCodes = new Set((existing || []).map((c: any) => c.code));

    const toInsert = defaults
      .filter((d) => !existingCodes.has(d.code))
      .map((d) => ({
        ...d,
        company_id: profile.company_id,
      }));

    if (toInsert.length === 0) {
      alert("Mata uang default sudah ada semua.");
      return;
    }

    const { error } = await supabase.from("currencies").insert(toInsert);

    if (error) {
      console.error("Error seeding default currencies:", error);
      alert("Gagal memuat mata uang default: " + error.message);
    } else {
      await loadCurrencies();
      alert(`${toInsert.length} mata uang default berhasil dimuat.`);
    }
  };

  const openAddCurrencyModal = () => {
    setEditingCurrencyId(null);
    setCurrencyForm({
      code: "",
      name: "",
      symbol: "",
      is_base: false,
      is_active: true,
      decimal_places: 2,
    });
    setShowCurrencyModal(true);
  };

  const openEditCurrencyModal = (currency: any) => {
    setEditingCurrencyId(currency.id);
    setCurrencyForm({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol || "",
      is_base: !!currency.is_base,
      is_active: currency.is_active !== false,
      decimal_places: currency.decimal_places ?? 2,
    });
    setShowCurrencyModal(true);
  };

  const closeCurrencyModal = () => {
    setShowCurrencyModal(false);
    setEditingCurrencyId(null);
  };

  const handleCurrencyFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setCurrencyForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSaveCurrency = async () => {
    if (!profile?.company_id) return;

    const { code, name, symbol, is_base, is_active, decimal_places } = currencyForm;

    if (!code.trim() || !name.trim()) {
      alert("Kode dan Nama mata uang wajib diisi.");
      return;
    }

    // Duplicate code check (per company)
    if (!editingCurrencyId) {
      const { data: existing } = await supabase
        .from("currencies")
        .select("id")
        .eq("company_id", profile.company_id)
        .eq("code", code.trim().toUpperCase())
        .single();

      if (existing) {
        alert(`Kode "${code}" sudah digunakan.`);
        return;
      }
    }

    // If setting this as base, unset all others first
    if (is_base) {
      await supabase
        .from("currencies")
        .update({ is_base: false })
        .eq("company_id", profile.company_id)
        .neq("id", editingCurrencyId || "00000000-0000-0000-0000-000000000000");
    }

    const payload = {
      company_id: profile.company_id,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      symbol: symbol.trim() || null,
      is_base,
      is_active,
      decimal_places: Math.max(0, Math.min(4, decimal_places)),
    };

    let error: any = null;
    if (editingCurrencyId) {
      const { error: updateErr } = await supabase
        .from("currencies")
        .update(payload)
        .eq("id", editingCurrencyId);
      error = updateErr;
    } else {
      const { error: insertErr } = await supabase.from("currencies").insert(payload);
      error = insertErr;
    }

    if (error) {
      console.error("Error saving currency:", error);
      alert("Gagal menyimpan mata uang: " + (error.message || JSON.stringify(error)));
      return;
    }

    closeCurrencyModal();
    await loadCurrencies();
  };

  const handleDeleteCurrency = async (currency: any) => {
    if (!confirm(`Hapus mata uang ${currency.code} - ${currency.name}?`)) return;

    // Optional: prevent delete base or check if used in other tables (future)
    if (currency.is_base) {
      alert("Tidak bisa menghapus mata uang dasar (Base). Ubah base ke mata uang lain terlebih dahulu.");
      return;
    }

    // Clean up related exchange rate history for this currency
    await supabase
      .from("exchange_rates")
      .delete()
      .eq("company_id", profile.company_id)
      .eq("currency_code", currency.code);

    const { error } = await supabase.from("currencies").delete().eq("id", currency.id);

    if (error) {
      alert("Gagal hapus: " + error.message);
      return;
    }

    await loadCurrencies();
    await loadExchangeRates();
  };

  const handleDeleteRate = async (rate: any) => {
    if (!confirm(`Hapus riwayat kurs ${rate.currency_code} tanggal ${rate.rate_date}?`)) return;

    const { error } = await supabase.from("exchange_rates").delete().eq("id", rate.id);

    if (error) {
      alert("Gagal hapus kurs: " + error.message);
      return;
    }

    await loadExchangeRates();
  };

  const openUpdateRateModal = (prefillCode?: string) => {
    setRateForm({
      currency_code: prefillCode || (currencyList[0]?.code || ""),
      rate_date: new Date().toISOString().split("T")[0],
      rate: "",
      source: "Manual",
    });
    setShowRateModal(true);
  };

  const handleRateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveRate = async () => {
    if (!profile?.company_id) return;
    const { currency_code, rate_date, rate, source } = rateForm;

    if (!currency_code || !rate_date || !rate) {
      alert("Pilih mata uang, tanggal, dan isi kurs.");
      return;
    }

    setRateModalLoading(true);

    const rateValue = parseFloat(rate);
    if (isNaN(rateValue) || rateValue <= 0) {
      alert("Kurs harus angka lebih besar dari 0.");
      setRateModalLoading(false);
      return;
    }

    const payload = {
      company_id: profile.company_id,
      currency_code: currency_code.toUpperCase(),
      rate_date,
      rate: rateValue,
      source: source.trim() || "Manual",
    };

    // Upsert: if same date exists for currency, replace
    const { error } = await supabase
      .from("exchange_rates")
      .upsert(payload, { onConflict: "company_id,currency_code,rate_date" });

    setRateModalLoading(false);

    if (error) {
      console.error("Error saving rate:", error);
      alert("Gagal simpan kurs: " + error.message);
      return;
    }

    setShowRateModal(false);
    await loadExchangeRates();
    alert("Kurs berhasil disimpan.");
  };

  // Helper: ambil kurs terbaru pada atau sebelum tanggal tertentu
  // getExchangeRate helper removed (was unused)

  // ========== MASTER ITEM ==========
  const loadItems = async () => {
    if (!profile?.company_id) return;

    const { data, error } = await supabase
      .from("master_items")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("kode", { ascending: true });

    if (error) {
      console.error("Error loading items:", error);
      // graceful if table not exist yet
      return;
    }
    setItemList(data || []);
  };

  const loadCoaForPicker = async () => {
    if (!profile?.company_id) return;
    // Reuse coa load if not loaded
    if (coaList.length === 0) {
      const { data, error } = await supabase
        .from("coa")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("code", { ascending: true });
      if (!error && data) {
        // Note: coaList state is set in loadCoa, but to make picker work we can set here too
        // For simplicity, call loadCoa which sets it
        await loadCoa();
      }
    }
  };

  const generateDefaultItemCode = (kategoriName?: string) => {
    const cat = itemCategories.find((c: any) => c.name === (kategoriName || itemForm.kategori));
    if (!cat) return "ITM-001"; // fallback

    const prefix = cat.code_prefix || "ITM-";
    const len = cat.code_length || 3;

    const existing = itemList
      .filter((i: any) => i.kategori === cat.name && i.kode && i.kode.startsWith(prefix))
      .map((i: any) => {
        const numPart = i.kode.replace(prefix, "");
        return parseInt(numPart) || 0;
      });

    const max = existing.length > 0 ? Math.max(...existing) : 0;
    const next = (max + 1).toString().padStart(len, "0");
    return prefix + next;
  };

  // Load categories and units (for per-category code settings)
  const loadItemCategories = async () => {
    if (!profile?.company_id) return;
    let { data, error } = await supabase
      .from("item_categories")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("name");

    if (error) {
      console.error("Error loading item categories:", error);
      if (itemCategories.length === 0) {
        setItemCategories([
          { name: "Barang Jadi", code_prefix: "BJ-", code_length: 3 },
          { name: "Bahan Baku", code_prefix: "BB-", code_length: 3 },
          { name: "Jasa", code_prefix: "JS-", code_length: 3 },
          { name: "Peralatan", code_prefix: "PR-", code_length: 3 },
        ]);
      }
      return;
    }

    if (!data || data.length === 0) {
      // Seed defaults on first use
      const defaults = [
        { company_id: profile.company_id, name: "Barang Jadi", code_prefix: "BJ-", code_length: 3 },
        { company_id: profile.company_id, name: "Bahan Baku", code_prefix: "BB-", code_length: 3 },
        { company_id: profile.company_id, name: "Jasa", code_prefix: "JS-", code_length: 3 },
        { company_id: profile.company_id, name: "Peralatan", code_prefix: "PR-", code_length: 3 },
      ];
      await supabase.from("item_categories").insert(defaults);
      const { data: seeded } = await supabase
        .from("item_categories")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("name");
      data = seeded;
    }

    setItemCategories(data || []);
  };

  const loadItemUnits = async () => {
    if (!profile?.company_id) return;
    let { data, error } = await supabase
      .from("item_units")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("name");
    if (error) {
      console.error("Error loading item units:", error);
      if (itemUnits.length === 0) {
        setItemUnits([
          { name: "Unit" },
          { name: "Pcs" },
          { name: "Kg" },
          { name: "Liter" },
          { name: "Box" },
        ]);
      }
      return;
    }

    if (!data || data.length === 0) {
      const defaults = [
        { company_id: profile.company_id, name: "Unit" },
        { company_id: profile.company_id, name: "Pcs" },
        { company_id: profile.company_id, name: "Kg" },
        { company_id: profile.company_id, name: "Liter" },
        { company_id: profile.company_id, name: "Box" },
      ];
      await supabase.from("item_units").insert(defaults);
      const { data: seeded } = await supabase
        .from("item_units")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("name");
      data = seeded;
    }

    setItemUnits(data || []);
  };

  const saveCategory = async () => {
    if (!profile?.company_id || !categoryForm.name.trim() || !categoryForm.code_prefix.trim()) return;

    const payload = {
      company_id: profile.company_id,
      name: categoryForm.name.trim(),
      code_prefix: categoryForm.code_prefix.trim().toUpperCase(),
      code_length: categoryForm.code_length,
    };

    if (editingCategory && editingCategory.id) {
      const { error } = await supabase.from("item_categories").update(payload).eq("id", editingCategory.id);
      if (error) alert("Gagal update kategori: " + error.message);
    } else {
      // check duplicate name
      const exists = itemCategories.find((c: any) => c.name.toLowerCase() === payload.name.toLowerCase());
      if (exists) {
        alert("Kategori dengan nama tersebut sudah ada.");
        return;
      }
      const { error } = await supabase.from("item_categories").insert(payload);
      if (error) alert("Gagal tambah kategori: " + error.message);
    }
    setEditingCategory(null);
    setCategoryForm({ name: "", code_prefix: "", code_length: 3 });
    await loadItemCategories();
  };

  const editCategory = (cat: any) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      code_prefix: cat.code_prefix || "",
      code_length: cat.code_length || 3,
    });
  };

  const deleteCategory = async (cat: any) => {
    if (!confirm(`Hapus kategori "${cat.name}"? Item yang sudah pakai kategori ini tidak akan terpengaruh.`)) return;
    if (cat.id) {
      const { error } = await supabase.from("item_categories").delete().eq("id", cat.id);
      if (error) {
        alert("Gagal hapus: " + error.message);
        return;
      }
    }
    setItemCategories(itemCategories.filter((c: any) => c.name !== cat.name));
    await loadItemCategories();
  };

  const saveUnit = async () => {
    if (!profile?.company_id || !unitForm.name.trim()) return;
    const name = unitForm.name.trim();

    if (editingUnit && editingUnit.id) {
      const { error } = await supabase.from("item_units").update({ name }).eq("id", editingUnit.id);
      if (error) alert("Gagal update satuan: " + error.message);
    } else {
      if (itemUnits.find((u: any) => u.name.toLowerCase() === name.toLowerCase())) {
        alert("Satuan tersebut sudah ada.");
        return;
      }
      const { error } = await supabase.from("item_units").insert({ company_id: profile.company_id, name });
      if (error) alert("Gagal tambah satuan: " + error.message);
    }
    setEditingUnit(null);
    setUnitForm({ name: "" });
    await loadItemUnits();
  };

  const editUnit = (unit: any) => {
    setEditingUnit(unit);
    setUnitForm({ name: unit.name });
  };

  const deleteUnit = async (unit: any) => {
    if (!confirm(`Hapus satuan "${unit.name}"?`)) return;
    if (unit.id) {
      const { error } = await supabase.from("item_units").delete().eq("id", unit.id);
      if (error) {
        alert("Gagal hapus: " + error.message);
        return;
      }
    }
    setItemUnits(itemUnits.filter((u: any) => u.name !== unit.name));
    await loadItemUnits();
  };

  const openAddItemModal = () => {
    setEditingItemId(null);
    const defaultKategori = itemCategories[0]?.name || "Barang Jadi";
    const defaultCode = generateDefaultItemCode(defaultKategori);
    setItemForm({
      kode: defaultCode,
      nama: "",
      kategori: defaultKategori,
      satuan: itemUnits[0]?.name || "Unit",
      status: "Aktif",
      coa_id: null,
      coa_code: "",
      coa_name: "",
    });
    setBulkApplyCoa(false);
    setShowItemModal(true);
  };

  const addNewKategori = () => {
    const newCat = prompt("Masukkan nama kategori baru:");
    if (!newCat || !newCat.trim()) return;

    const trimmed = newCat.trim();
    const currentCategories = itemCategories || [];
    
    const exists = currentCategories.some((c: any) => 
      c.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (!exists) {
      const newCategory = { 
        name: trimmed, 
        code_prefix: trimmed.substring(0, 3).toUpperCase(), 
        code_length: 3 
      };
      setItemCategories([...currentCategories, newCategory]);
      setItemForm((prev) => ({ ...prev, kategori: trimmed }));
    }
  };

  const addNewSatuan = () => {
    const newSat = prompt("Masukkan nama satuan baru:");
    if (!newSat || !newSat.trim()) return;

    const trimmed = newSat.trim();
    const currentUnits = itemUnits || [];
    
    const exists = currentUnits.some((u: any) => 
      u.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (!exists) {
      setItemUnits([...currentUnits, { name: trimmed }]);
      setItemForm((prev) => ({ ...prev, satuan: trimmed }));
    }
  };

  const openEditItemModal = (item: any) => {
    setEditingItemId(item.id);
    setItemForm({
      kode: item.kode || "",
      nama: item.nama || "",
      kategori: item.kategori || "Barang Jadi",
      satuan: item.satuan || "Unit",
      status: item.status || "Aktif",
      coa_id: item.coa_id || null,
      coa_code: item.coa_code || "",
      coa_name: item.coa_name || "",
    });
    setBulkApplyCoa(false);
    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setShowItemModal(false);
    setEditingItemId(null);
    setBulkApplyCoa(false);
  };

  const openCoaPickerForItem = async () => {
    await loadCoaForPicker();
    setShowCoaPickerForItem(true);
  };

  const closeCoaPickerForItem = () => {
    setShowCoaPickerForItem(false);
    setCoaItemSearch("");
  };

  const selectCoaForItem = (coa: any) => {
    // Support item, supplier, and customer COA picker (reuse existing modal)
    if (showSupplierModal) {
      setSupplierForm((prev) => ({
        ...prev,
        coa_id: coa.id,
        coa_code: coa.code,
        coa_name: coa.name,
      }));
    } else if (showCustomerModal) {
      setCustomerForm((prev) => ({
        ...prev,
        coa_id: coa.id,
        coa_code: coa.code,
        coa_name: coa.name,
      }));
    } else {
      setItemForm((prev) => ({
        ...prev,
        coa_id: coa.id,
        coa_code: coa.code,
        coa_name: coa.name,
      }));
    }
    closeCoaPickerForItem();
  };

  const handleItemFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "bulk_apply") {
      setBulkApplyCoa(checked);
      return;
    }

    setItemForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === "number" ? parseFloat(value) || 0 : value,
      };
      // Auto regenerate kode when kategori changes (new prefix + next number for that category)
      if (name === "kategori") {
        const newCode = generateDefaultItemCode(updated.kategori);
        updated.kode = newCode;
      }
      return updated;
    });
  };

  const handleSaveItem = async () => {
    if (!profile?.company_id) return;

    const { kode, nama, kategori, satuan, status, coa_id, coa_code, coa_name } = itemForm;

    if (!kode.trim() || !nama.trim()) {
      alert("Kode dan Nama Item wajib diisi.");
      return;
    }

    const payload: any = {
      company_id: profile.company_id,
      kode: kode.trim().toUpperCase(),
      nama: nama.trim(),
      kategori,
      satuan,
      status,
      coa_id: coa_id || null,
      coa_code: coa_code || null,
      coa_name: coa_name || null,
    };

    let error: any = null;
    if (editingItemId) {
      const { error: updateErr } = await supabase
        .from("master_items")
        .update(payload)
        .eq("id", editingItemId);
      error = updateErr;
    } else {
      // Check dup kode
      const { data: existing } = await supabase
        .from("master_items")
        .select("id")
        .eq("company_id", profile.company_id)
        .eq("kode", payload.kode)
        .single();

      if (existing) {
        alert(`Kode "${payload.kode}" sudah digunakan.`);
        return;
      }

      const { error: insertErr } = await supabase.from("master_items").insert(payload);
      error = insertErr;
    }

    if (error) {
      console.error("Error saving item:", error);
      let userMessage = error.message || JSON.stringify(error);
      if (!error.message && (!error || Object.keys(error).length === 0)) {
        userMessage = "Gagal menyimpan (error kosong). Kemungkinan besar karena RLS (Row Level Security) policy di tabel 'master_items' di Supabase. Pastikan policy mengizinkan INSERT/UPDATE untuk company_id yang sesuai dengan profile user Anda. Cek juga apakah profile.company_id sudah benar.";
      }
      alert("Gagal menyimpan item: " + userMessage);
      return;
    }

    // Bulk apply if checkbox checked
    if (bulkApplyCoa && coa_id && kategori) {
      const confirmBulk = confirm(
        `Akun COA ${coa_code} - ${coa_name} akan diterapkan ke semua item kategori "${kategori}". Lanjutkan?`
      );
      if (confirmBulk) {
        const { error: bulkErr } = await supabase
          .from("master_items")
          .update({
            coa_id,
            coa_code,
            coa_name,
          })
          .eq("company_id", profile.company_id)
          .eq("kategori", kategori);

        if (bulkErr) {
          console.error("Bulk apply error:", bulkErr);
          alert("Item disimpan, tapi gagal menerapkan ke kategori lain: " + bulkErr.message);
        } else {
          alert(`Berhasil menerapkan akun COA ke item kategori ${kategori}.`);
        }
      }
    }

    closeItemModal();
    await loadItems();
  };

  const handleDeleteItem = async (item: any) => {
    if (!confirm(`Hapus item ${item.kode} - ${item.nama}?`)) return;

    const { error } = await supabase.from("master_items").delete().eq("id", item.id);
    if (error) {
      alert("Gagal hapus: " + error.message);
      return;
    }
    await loadItems();
  };

  // Simple filters for item tab
  const filteredItemList = itemList.filter((item: any) => {
    const matchesSearch =
      !itemSearchTerm ||
      item.kode.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
      item.nama.toLowerCase().includes(itemSearchTerm.toLowerCase());

    const matchesKategori = itemFilterKategori === "all" || item.kategori === itemFilterKategori;
    const matchesSatuan = itemFilterSatuan === "all" || item.satuan === itemFilterSatuan;
    const matchesStatus = itemFilterStatus === "all" || item.status === itemFilterStatus;

    return matchesSearch && matchesKategori && matchesSatuan && matchesStatus;
  });

  // Download template for Item import (similar to COA)
  const downloadItemTemplate = () => {
    const headers = ['Kode', 'Nama Item', 'Kategori', 'Satuan', 'Status', 'Kode COA'];
    const sampleData = [
      ['ITM-001', 'Laptop Dell', 'Barang Jadi', 'Unit', 'Aktif', '1130'],
      ['ITM-002', 'Mouse Wireless', 'Barang Jadi', 'Pcs', 'Aktif', '1130'],
    ];
    const wsData = [headers, ...sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Item');
    XLSX.writeFile(wb, 'template_master_item.xlsx');
  };

  const handleItemImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setItemImportFile(file);
    }
  };

  const handleImportItem = async () => {
    if (!itemImportFile || !profile?.company_id) {
      alert("Pilih file Excel terlebih dahulu.");
      return;
    }

    setItemImportLoading(true);
    setItemImportProgress(0);

    try {
      const buffer = await itemImportFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        throw new Error("File kosong atau tidak ada baris data.");
      }

      const headers = jsonData[0].map((h: any) => (h ? h.toString().trim().toLowerCase() : ''));
      const rows = jsonData.slice(1);

      // Column mapping (flexible like COA import)
      const colMap: { [key: string]: number } = {};
      headers.forEach((h, i) => {
        if (h.includes('kode') && !h.includes('coa')) colMap.kode = i;
        if (h.includes('nama')) colMap.nama = i;
        if (h.includes('kategori')) colMap.kategori = i;
        if (h.includes('satuan')) colMap.satuan = i;
        if (h.includes('status')) colMap.status = i;
        if (h.includes('coa') || h.includes('kode coa')) colMap.coa = i;
      });

      if (colMap.kode === undefined || colMap.nama === undefined || colMap.kategori === undefined || colMap.satuan === undefined || colMap.status === undefined) {
        throw new Error("Format header tidak sesuai. Gunakan template yang disediakan (Kode, Nama Item, Kategori, Satuan, Status, Kode COA).");
      }

      // For dup checks and COA lookup
      const existingCodes = new Set(itemList.map((i: any) => i.kode.toLowerCase()));
      const currentBatchCodes = new Set<string>();
      const toInsert: any[] = [];
      const failedRows: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2;
        setItemImportProgress(Math.round(((i + 1) / rows.length) * 100));

        try {
          const kode = (row[colMap.kode] || '').toString().trim().toUpperCase();
          const nama = (row[colMap.nama] || '').toString().trim();
          const kategori = (row[colMap.kategori] || '').toString().trim();
          const satuan = (row[colMap.satuan] || '').toString().trim();
          const status = (row[colMap.status] || '').toString().trim();
          const coaKode = colMap.coa !== undefined ? (row[colMap.coa] || '').toString().trim() : '';

          if (!kode || !nama || !kategori || !satuan || !status) {
            throw new Error("Kolom wajib (Kode, Nama Item, Kategori, Satuan, Status) kosong.");
          }

          // Duplicate check (existing + within batch)
          if (existingCodes.has(kode.toLowerCase()) || currentBatchCodes.has(kode)) {
            throw new Error(`Kode "${kode}" sudah digunakan.`);
          }

          // Validate against current categories and units
          const validKategori = itemCategories.some((c: any) => c.name.toLowerCase() === kategori.toLowerCase());
          if (!validKategori) {
            throw new Error(`Kategori "${kategori}" tidak ditemukan di daftar (perbarui di Pengaturan jika perlu).`);
          }

          const validSatuan = itemUnits.some((u: any) => u.name.toLowerCase() === satuan.toLowerCase());
          if (!validSatuan) {
            throw new Error(`Satuan "${satuan}" tidak ditemukan di daftar (perbarui di Pengaturan jika perlu).`);
          }

          if (!['Aktif', 'Nonaktif'].includes(status)) {
            throw new Error('Status harus "Aktif" atau "Nonaktif".');
          }

          // COA lookup (optional)
          let coa_id: string | null = null;
          let coa_code: string | null = null;
          let coa_name: string | null = null;
          if (coaKode) {
            const coaMatch = coaList.find((c: any) => c.code.toLowerCase() === coaKode.toLowerCase());
            if (!coaMatch) {
              throw new Error(`Kode COA "${coaKode}" tidak ditemukan.`);
            }
            coa_id = coaMatch.id;
            coa_code = coaMatch.code;
            coa_name = coaMatch.name;
          }

          toInsert.push({
            company_id: profile.company_id,
            kode,
            nama,
            kategori,
            satuan,
            status,
            coa_id,
            coa_code,
            coa_name,
          });

          currentBatchCodes.add(kode);
        } catch (rowErr: any) {
          failedRows.push(`Baris ${rowNum}: ${rowErr.message}`);
        }
      }

      if (toInsert.length > 0) {
        const { error } = await supabase.from("master_items").insert(toInsert);
        if (error) throw error;
      }

      setItemImportProgress(100);
      await loadItems();

      const successCount = toInsert.length;
      const failCount = failedRows.length;

      alert(`Import selesai!\nBerhasil: ${successCount}\nGagal: ${failCount}`);

      if (failCount > 0) {
        console.error("Baris gagal di-import:", failedRows);
        alert("Beberapa baris gagal. Lihat Console (F12) untuk detail error per baris.");
      }
    } catch (err: any) {
      console.error("Import error:", err);
      alert("Gagal melakukan import: " + (err.message || "Terjadi kesalahan."));
    } finally {
      setItemImportLoading(false);
      setItemImportFile(null);
      setShowItemImportModal(false);
      setItemImportProgress(0);
    }
  };

  const exportItems = () => {
    const headers = ['Kode', 'Nama Item', 'Kategori', 'Satuan', 'Status', 'Kode COA', 'Nama COA'];
    const rows = filteredItemList.map((item: any) => [
      item.kode,
      item.nama,
      item.kategori,
      item.satuan,
      item.status,
      item.coa_code || '',
      item.coa_name || '',
    ]);
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Master Item');
    XLSX.writeFile(wb, 'master_item_export.xlsx');
  };

  // ========== MASTER SUPPLIER (modeled after Master Item) ==========
  const loadSuppliers = async () => {
    if (!profile?.company_id) return;
    const { data, error } = await supabase
      .from("master_suppliers")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("kode", { ascending: true });
    if (error) {
      console.error("Error loading suppliers:", error);
      return;
    }
    setSupplierList(data || []);
  };

  const generateDefaultSupplierCode = () => {
    const prefix = supplierCodePrefix;
    const len = supplierCodeLength;
    const existing = supplierList
      .filter((s: any) => s.kode && s.kode.startsWith(prefix))
      .map((s: any) => parseInt(s.kode.replace(prefix, '')) || 0);
    const max = existing.length > 0 ? Math.max(...existing) : 0;
    const next = (max + 1).toString().padStart(len, "0");
    return prefix + next;
  };

  const openAddSupplierModal = () => {
    setEditingSupplierId(null);
    const defaultCode = generateDefaultSupplierCode();
    setSupplierForm({
      kode: defaultCode,
      nama: "",
      kontak: "",
      telepon: "",
      email: "",
      alamat: "",
      npwp: "",
      limit_kredit: 0,
      syarat_pembayaran: syaratPembayaranList[0] || "30 hari",
      coa_id: null,
      coa_code: "",
      coa_name: "",
      status: "Aktif",
    });
    setShowSupplierModal(true);
  };

  const openSupplierSettingsModal = () => {
    setTempSupplierCodePrefix(supplierCodePrefix);
    setTempSupplierCodeLength(supplierCodeLength);
    setTempSyaratPembayaranList([...syaratPembayaranList]);
    setShowSupplierSettingsModal(true);
  };

  const openEditSupplierModal = (supplier: any) => {
    setEditingSupplierId(supplier.id);
    setSupplierForm({
      kode: supplier.kode || "",
      nama: supplier.nama || "",
      kontak: supplier.kontak || "",
      telepon: supplier.telepon || "",
      email: supplier.email || "",
      alamat: supplier.alamat || "",
      npwp: supplier.npwp || "",
      limit_kredit: supplier.limit_kredit || 0,
      syarat_pembayaran: supplier.syarat_pembayaran || "30 hari",
      coa_id: supplier.coa_id || null,
      coa_code: supplier.coa_code || "",
      coa_name: supplier.coa_name || "",
      status: supplier.status || "Aktif",
    });
    setShowSupplierModal(true);
  };

  const closeSupplierModal = () => {
    setShowSupplierModal(false);
    setEditingSupplierId(null);
  };

  const openSupplierCoaPicker = async () => {
    if (coaList.length === 0) await loadCoa();
    setShowCoaPickerForItem(true); // reuse the existing picker for now, label will be "Akun Hutang"
  };

  const handleSupplierFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "limit_kredit") {
      const parsed = parseIndonesianNumber(value);
      setSupplierForm((prev) => ({ ...prev, limit_kredit: parsed }));
      return;
    }

    setSupplierForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveSupplier = async () => {
    if (!profile?.company_id) return;

    const { kode, nama, kontak, telepon, email, alamat, npwp, limit_kredit, syarat_pembayaran, coa_id, coa_code, coa_name, status } = supplierForm;

    if (!kode.trim() || !nama.trim()) {
      alert("Kode dan Nama Supplier wajib diisi.");
      return;
    }

    const payload: any = {
      company_id: profile.company_id,
      kode: kode.trim().toUpperCase(),
      nama: nama.trim(),
      kontak: kontak.trim() || null,
      telepon: telepon.trim() || null,
      email: email.trim() || null,
      alamat: alamat.trim() || null,
      npwp: npwp.trim() || null,
      limit_kredit: limit_kredit || 0,
      syarat_pembayaran,
      coa_id: coa_id || null,
      coa_code: coa_code || null,
      coa_name: coa_name || null,
      status,
    };

    let error: any = null;
    if (editingSupplierId) {
      const { error: updateErr } = await supabase.from("master_suppliers").update(payload).eq("id", editingSupplierId);
      error = updateErr;
    } else {
      const { data: existing } = await supabase
        .from("master_suppliers")
        .select("id")
        .eq("company_id", profile.company_id)
        .eq("kode", payload.kode)
        .single();
      if (existing) {
        alert(`Kode "${payload.kode}" sudah digunakan.`);
        return;
      }
      const { error: insertErr } = await supabase.from("master_suppliers").insert(payload);
      error = insertErr;
    }

    if (error) {
      console.error("Error saving supplier:", error);
      alert("Gagal menyimpan supplier: " + (error.message || JSON.stringify(error)));
      return;
    }

    closeSupplierModal();
    await loadSuppliers();
  };

  const handleDeleteSupplier = async (supplier: any) => {
    if (!confirm(`Hapus supplier ${supplier.kode} - ${supplier.nama}?`)) return;
    const { error } = await supabase.from("master_suppliers").delete().eq("id", supplier.id);
    if (error) {
      alert("Gagal hapus: " + error.message);
      return;
    }
    await loadSuppliers();
  };

  // Simple filters for supplier tab
  const filteredSupplierList = supplierList.filter((s: any) => {
    const matchesSearch =
      !supplierSearchTerm ||
      s.kode.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
      s.nama.toLowerCase().includes(supplierSearchTerm.toLowerCase());
    const matchesSyarat = supplierFilterSyarat === "all" || s.syarat_pembayaran === supplierFilterSyarat;
    const matchesStatus = supplierFilterStatus === "all" || s.status === supplierFilterStatus;
    return matchesSearch && matchesSyarat && matchesStatus;
  });

  const exportSuppliers = () => {
    const headers = ['Kode', 'Nama Supplier', 'Kontak', 'Telepon', 'Email', 'Alamat', 'NPWP', 'Limit Kredit', 'Syarat Pembayaran', 'Status', 'Kode Akun Hutang', 'Nama Akun Hutang'];
    const rows = filteredSupplierList.map((s: any) => [
      s.kode, s.nama, s.kontak || '', s.telepon || '', s.email || '', s.alamat || '', s.npwp || '',
      s.limit_kredit, s.syarat_pembayaran, s.status,
      s.coa_code || '', s.coa_name || ''
    ]);
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Master Supplier');
    XLSX.writeFile(wb, 'master_supplier_export.xlsx');
  };

  const handleSupplierImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSupplierImportFile(file);
  };

  const handleImportSupplier = async () => {
    if (!supplierImportFile || !profile?.company_id) {
      alert("Pilih file terlebih dahulu.");
      return;
    }
    setSupplierImportLoading(true);
    setSupplierImportProgress(0);
    // For now, similar placeholder logic; full implementation can mirror item import
    setTimeout(() => {
      setSupplierImportLoading(false);
      setSupplierImportFile(null);
      setShowSupplierImportModal(false);
      setSupplierImportProgress(0);
      alert("Import Supplier (demo): Gunakan pola sama seperti Item. Download template dari modal dan tambah manual untuk saat ini.");
    }, 800);
  };

  const downloadSupplierTemplate = () => {
    const headers = ['Kode', 'Nama Supplier', 'Kontak', 'Telepon', 'Email', 'Alamat', 'NPWP', 'Limit Kredit', 'Syarat Pembayaran', 'Status', 'Kode Akun Hutang'];
    const sampleData = [
      ['SUP-001', 'PT Supplier Maju', 'Budi Santoso', '021-123456', 'budi@supplier.com', 'Jl. Industri No.1', '12.345.678.9-012.000', 50000000, '30 hari', 'Aktif', '2100'],
    ];
    const wsData = [headers, ...sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Supplier');
    XLSX.writeFile(wb, 'template_master_supplier.xlsx');
  };

  // ========== MASTER CUSTOMER (modeled after Master Supplier) ==========
  const loadCustomers = async () => {
    if (!profile?.company_id) return;
    const { data, error } = await supabase
      .from("master_customers")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("kode", { ascending: true });
    if (error) {
      console.error("Error loading customers:", error);
      return;
    }
    setCustomerList(data || []);
  };

  const generateDefaultCustomerCode = () => {
    const prefix = customerCodePrefix;
    const len = customerCodeLength;
    const existing = customerList
      .filter((c: any) => c.kode && c.kode.startsWith(prefix))
      .map((c: any) => parseInt(c.kode.replace(prefix, '')) || 0);
    const max = existing.length > 0 ? Math.max(...existing) : 0;
    const next = (max + 1).toString().padStart(len, "0");
    return prefix + next;
  };

  const openAddCustomerModal = () => {
    setEditingCustomerId(null);
    const defaultCode = generateDefaultCustomerCode();
    setCustomerForm({
      kode: defaultCode,
      nama: "",
      kontak: "",
      telepon: "",
      email: "",
      alamat: "",
      npwp: "",
      limit_kredit: 0,
      syarat_pembayaran: customerSyaratList[0] || "30 hari",
      coa_id: null,
      coa_code: "",
      coa_name: "",
      status: "Aktif",
    });
    setShowCustomerModal(true);
  };

  const openEditCustomerModal = (customer: any) => {
    setEditingCustomerId(customer.id);
    setCustomerForm({
      kode: customer.kode || "",
      nama: customer.nama || "",
      kontak: customer.kontak || "",
      telepon: customer.telepon || "",
      email: customer.email || "",
      alamat: customer.alamat || "",
      npwp: customer.npwp || "",
      limit_kredit: customer.limit_kredit || 0,
      syarat_pembayaran: customer.syarat_pembayaran || "30 hari",
      coa_id: customer.coa_id || null,
      coa_code: customer.coa_code || "",
      coa_name: customer.coa_name || "",
      status: customer.status || "Aktif",
    });
    setShowCustomerModal(true);
  };

  const closeCustomerModal = () => {
    setShowCustomerModal(false);
    setEditingCustomerId(null);
  };

  const openCustomerCoaPicker = async () => {
    if (coaList.length === 0) await loadCoa();
    setShowCoaPickerForItem(true); // reuse picker, will set to customerForm if customer modal open
  };

  const handleCustomerFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "limit_kredit") {
      const parsed = parseIndonesianNumber(value);
      setCustomerForm((prev) => ({ ...prev, limit_kredit: parsed }));
      return;
    }

    setCustomerForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveCustomer = async () => {
    if (!profile?.company_id) return;

    const { kode, nama, kontak, telepon, email, alamat, npwp, limit_kredit, syarat_pembayaran, coa_id, coa_code, coa_name, status } = customerForm;

    if (!kode.trim() || !nama.trim()) {
      alert("Kode dan Nama Customer wajib diisi.");
      return;
    }

    const payload: any = {
      company_id: profile.company_id,
      kode: kode.trim().toUpperCase(),
      nama: nama.trim(),
      kontak: kontak.trim() || null,
      telepon: telepon.trim() || null,
      email: email.trim() || null,
      alamat: alamat.trim() || null,
      npwp: npwp.trim() || null,
      limit_kredit: limit_kredit || 0,
      syarat_pembayaran,
      coa_id: coa_id || null,
      coa_code: coa_code || null,
      coa_name: coa_name || null,
      status,
    };

    let error: any = null;
    if (editingCustomerId) {
      const { error: updateErr } = await supabase.from("master_customers").update(payload).eq("id", editingCustomerId);
      error = updateErr;
    } else {
      const { data: existing } = await supabase
        .from("master_customers")
        .select("id")
        .eq("company_id", profile.company_id)
        .eq("kode", payload.kode)
        .single();
      if (existing) {
        alert(`Kode "${payload.kode}" sudah digunakan.`);
        return;
      }
      const { error: insertErr } = await supabase.from("master_customers").insert(payload);
      error = insertErr;
    }

    if (error) {
      console.error("Error saving customer:", error);
      alert("Gagal menyimpan customer: " + (error.message || JSON.stringify(error)));
      return;
    }

    closeCustomerModal();
    await loadCustomers();
  };

  const handleDeleteCustomer = async (customer: any) => {
    if (!confirm(`Hapus customer ${customer.kode} - ${customer.nama}?`)) return;
    const { error } = await supabase.from("master_customers").delete().eq("id", customer.id);
    if (error) {
      alert("Gagal hapus: " + error.message);
      return;
    }
    await loadCustomers();
  };

  const openMemberCard = (customer: any) => {
    setSelectedCustomerForCard(customer);
    setShowMemberCardModal(true);
  };

  const downloadMemberCard = () => {
    if (!selectedCustomerForCard) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution card for good print quality (approx ID card ratio)
    const width = 900;
    const height = 560;
    canvas.width = width;
    canvas.height = height;

    // Background - clean white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Outer border with emerald theme
    ctx.strokeStyle = '#059669'; // emerald-600
    ctx.lineWidth = 12;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    // Top header bar
    ctx.fillStyle = '#059669';
    ctx.fillRect(20, 20, width - 40, 90);

    // Company name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px Inter, system-ui, sans-serif';
    ctx.fillText('DIAUF.ID', 40, 65);

    ctx.font = '20px Inter, system-ui, sans-serif';
    ctx.fillText('KARTU MEMBER', 40, 95);

    // Right side validity
    ctx.font = '18px Inter, system-ui, sans-serif';
    ctx.fillText('Berlaku hingga', width - 220, 55);
    const validDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID');
    ctx.fillText(validDate, width - 220, 78);

    // Customer photo placeholder (circle)
    const photoX = width - 160;
    const photoY = 160;
    ctx.beginPath();
    ctx.arc(photoX, photoY, 70, 0, Math.PI * 2);
    ctx.fillStyle = '#d1fae5'; // emerald-100
    ctx.fill();
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Initials in circle
    const initials = (selectedCustomerForCard.nama || 'C')
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 48px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(initials, photoX, photoY + 18);
    ctx.textAlign = 'left';

    // Main info
    ctx.fillStyle = '#111827'; // slate-900
    ctx.font = 'bold 38px Inter, system-ui, sans-serif';
    ctx.fillText(selectedCustomerForCard.nama || 'Customer', 40, 175);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(selectedCustomerForCard.kode || '', 40, 215);

    // Contact info
    ctx.fillStyle = '#374151'; // slate-700
    ctx.font = '22px Inter, system-ui, sans-serif';
    let yPos = 265;
    if (selectedCustomerForCard.kontak) {
      ctx.fillText(selectedCustomerForCard.kontak, 40, yPos);
      yPos += 30;
    }
    if (selectedCustomerForCard.telepon) {
      ctx.fillText(selectedCustomerForCard.telepon, 40, yPos);
      yPos += 30;
    }
    if (selectedCustomerForCard.email) {
      ctx.fillText(selectedCustomerForCard.email, 40, yPos);
    }

    // Bottom bar
    ctx.fillStyle = '#059669';
    ctx.fillRect(20, height - 75, width - 40, 55);

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Inter, system-ui, sans-serif';
    ctx.fillText('DIAUF.ID  •  www.diauf.id  •  Member', 40, height - 42);

    // Download
    const link = document.createElement('a');
    link.download = `kartu-member-${selectedCustomerForCard.kode || 'customer'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const filteredCustomerList = customerList.filter((c: any) => {
    const matchesSearch =
      !customerSearchTerm ||
      c.kode.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      c.nama.toLowerCase().includes(customerSearchTerm.toLowerCase());
    const matchesSyarat = customerFilterSyarat === "all" || c.syarat_pembayaran === customerFilterSyarat;
    const matchesStatus = customerFilterStatus === "all" || c.status === customerFilterStatus;
    return matchesSearch && matchesSyarat && matchesStatus;
  });

  const exportCustomers = () => {
    const headers = ['Kode', 'Nama Customer', 'Kontak', 'Telepon', 'Email', 'Alamat', 'NPWP', 'Limit Kredit', 'Syarat Pembayaran', 'Status', 'Kode Akun Piutang', 'Nama Akun Piutang'];
    const rows = filteredCustomerList.map((c: any) => [
      c.kode, c.nama, c.kontak || '', c.telepon || '', c.email || '', c.alamat || '', c.npwp || '',
      c.limit_kredit, c.syarat_pembayaran, c.status,
      c.coa_code || '', c.coa_name || ''
    ]);
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Master Customer');
    XLSX.writeFile(wb, 'master_customer_export.xlsx');
  };

  const handleCustomerImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCustomerImportFile(file);
  };

  const handleImportCustomer = async () => {
    if (!customerImportFile || !profile?.company_id) {
      alert("Pilih file terlebih dahulu.");
      return;
    }
    setCustomerImportLoading(true);
    setCustomerImportProgress(0);
    setTimeout(() => {
      setCustomerImportLoading(false);
      setCustomerImportFile(null);
      setShowCustomerImportModal(false);
      setCustomerImportProgress(0);
      alert("Import Customer (demo): Gunakan pola sama seperti Supplier. Download template dari modal.");
    }, 800);
  };

  const downloadCustomerTemplate = () => {
    const headers = ['Kode', 'Nama Customer', 'Kontak', 'Telepon', 'Email', 'Alamat', 'NPWP', 'Limit Kredit', 'Syarat Pembayaran', 'Status', 'Kode Akun Piutang'];
    const sampleData = [
      ['CUS-001', 'PT Customer Setia', 'Andi Wijaya', '021-987654', 'andi@customer.com', 'Jl. Merdeka No.45', '98.765.432.1-098.000', 30000000, '30 hari', 'Aktif', '1120'],
    ];
    const wsData = [headers, ...sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Customer');
    XLSX.writeFile(wb, 'template_master_customer.xlsx');
  };

  // ========== MASTER HARGA (new concept: per item or per customer) ==========
  const loadHarga = async () => {
    if (!profile?.company_id) return;
    const { data, error } = await supabase
      .from("master_harga")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("berlaku_mulai", { ascending: false });
    if (error) {
      console.error("Error loading harga:", error);
      return;
    }
    setHargaList(data || []);
  };

  const openAddHargaModal = () => {
    setEditingHargaId(null);
    setHargaForm({
      kode: "",
      item_id: null,
      item_kode: "",
      item_nama: "",
      is_customer_specific: false,
      customer_id: null,
      customer_kode: "",
      customer_nama: "",
      harga: 0,
      berlaku_mulai: new Date().toISOString().split("T")[0],
    });
    setHargaItemSearch("");
    setHargaCustomerSearch("");
    setShowHargaModal(true);
  };

  const openEditHargaModal = (harga: any) => {
    setEditingHargaId(harga.id);
    setHargaForm({
      kode: harga.kode || "",
      item_id: harga.item_id || null,
      item_kode: harga.item_kode || "",
      item_nama: harga.item_nama || "",
      is_customer_specific: !!harga.customer_id,
      customer_id: harga.customer_id || null,
      customer_kode: harga.customer_kode || "",
      customer_nama: harga.customer_nama || "",
      harga: harga.harga || 0,
      berlaku_mulai: harga.berlaku_mulai || new Date().toISOString().split("T")[0],
    });
    setHargaItemSearch("");
    setHargaCustomerSearch("");
    setShowHargaModal(true);
  };

  const closeHargaModal = () => {
    setShowHargaModal(false);
    setEditingHargaId(null);
    setHargaItemSearch("");
    setHargaCustomerSearch("");
  };

  const handleHargaFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as any;
    const { name, value, type } = target;
    if (name === "harga") {
      const parsed = parseIndonesianNumber(value);
      setHargaForm((prev) => ({ ...prev, harga: parsed }));
      return;
    }
    setHargaForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  // Proper picker functions using the showHarga*Picker flags + itemList / customerList (loaded on tab activate)
  const openHargaItemPicker = () => {
    setHargaItemSearch("");
    setShowHargaItemPicker(true);
  };
  const closeHargaItemPicker = () => {
    setShowHargaItemPicker(false);
  };
  const selectHargaItem = (item: any) => {
    setHargaForm((prev) => ({
      ...prev,
      item_id: item.id,
      item_kode: item.kode || "",
      item_nama: item.nama || item.nama_barang || "",
    }));
    setShowHargaItemPicker(false);
  };

  const openHargaCustomerPicker = () => {
    setHargaCustomerSearch("");
    setShowHargaCustomerPicker(true);
  };
  const closeHargaCustomerPicker = () => {
    setShowHargaCustomerPicker(false);
  };
  const selectHargaCustomer = (cust: any) => {
    setHargaForm((prev) => ({
      ...prev,
      customer_id: cust.id,
      customer_kode: cust.kode || "",
      customer_nama: cust.nama || cust.nama_customer || "",
    }));
    setShowHargaCustomerPicker(false);
  };

  const handleSaveHarga = async () => {
    if (!profile?.company_id) return;

    const { kode: existingKode, item_id, item_kode, item_nama, is_customer_specific, customer_id, customer_kode, customer_nama, harga, berlaku_mulai } = hargaForm;

    if (!item_id || harga <= 0 || !berlaku_mulai) {
      alert("Item, Harga, dan Berlaku Mulai wajib diisi.");
      return;
    }
    if (is_customer_specific && !customer_id) {
      alert("Pilih Customer jika skema harga customer diaktifkan.");
      return;
    }

    // Internal kode only (never shown or editable in UI per spec "kode harga tidak perlu")
    // Use existing on edit, otherwise generate a stable composite for DB (avoids collisions, satisfies possible NOT NULL)
    const internalKode = editingHargaId && existingKode
      ? existingKode
      : `HRG-${(item_kode || 'ITM').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)}-${is_customer_specific && customer_kode ? customer_kode.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8) : 'UMUM'}-${berlaku_mulai.replace(/-/g, '')}`;

    const payload: any = {
      company_id: profile.company_id,
      kode: internalKode,
      item_id,
      item_kode,
      item_nama,
      customer_id: is_customer_specific ? customer_id : null,
      customer_kode: is_customer_specific ? customer_kode : null,
      customer_nama: is_customer_specific ? customer_nama : null,
      harga: harga || 0,
      berlaku_mulai,
    };

    let error: any = null;
    if (editingHargaId) {
      const { error: updateErr } = await supabase.from("master_harga").update(payload).eq("id", editingHargaId);
      error = updateErr;
    } else {
      const { error: insertErr } = await supabase.from("master_harga").insert(payload);
      error = insertErr;
    }

    if (error) {
      console.error("Error saving harga:", error);
      alert("Gagal menyimpan harga: " + (error.message || JSON.stringify(error)));
      return;
    }

    closeHargaModal();
    await loadHarga();
  };

  const handleDeleteHarga = async (harga: any) => {
    if (!confirm(`Hapus harga untuk item ${harga.item_nama || harga.item_kode || ''}?`)) return;
    const { error } = await supabase.from("master_harga").delete().eq("id", harga.id);
    if (error) {
      alert("Gagal hapus: " + error.message);
      return;
    }
    await loadHarga();
  };

  const filteredHargaList = hargaList.filter((h: any) => {
    const matchesSearch =
      !hargaSearchTerm ||
      (h.item_nama && h.item_nama.toLowerCase().includes(hargaSearchTerm.toLowerCase())) ||
      (h.item_kode && h.item_kode.toLowerCase().includes(hargaSearchTerm.toLowerCase())) ||
      (h.customer_nama && h.customer_nama.toLowerCase().includes(hargaSearchTerm.toLowerCase())) ||
      (h.customer_kode && h.customer_kode.toLowerCase().includes(hargaSearchTerm.toLowerCase()));
    let matchesFilter = true;
    if (hargaFilterStatus === "customer") matchesFilter = !!h.customer_id;
    if (hargaFilterStatus === "umum") matchesFilter = !h.customer_id;
    return matchesSearch && matchesFilter;
  });

  const exportHarga = () => {
    const headers = ['Item (Kode)', 'Item Nama', 'Customer (atau Umum)', 'Harga', 'Berlaku Mulai'];
    const rows = filteredHargaList.map((h: any) => [
      h.item_kode || '',
      h.item_nama || '',
      h.customer_nama || h.customer_kode || 'Umum',
      h.harga,
      h.berlaku_mulai || ''
    ]);
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Master Harga');
    XLSX.writeFile(wb, 'master_harga_export.xlsx');
  };

  const handleHargaImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setHargaImportFile(file);
  };

  const handleImportHarga = async () => {
    if (!hargaImportFile || !profile?.company_id) {
      alert("Pilih file terlebih dahulu.");
      return;
    }
    setHargaImportLoading(true);
    setHargaImportProgress(0);
    // Demo for now
    setTimeout(() => {
      setHargaImportLoading(false);
      setHargaImportFile(null);
      setShowHargaImportModal(false);
      setHargaImportProgress(0);
      alert("Import Harga (demo). Data master harga sekarang terhubung ke Master Item & Master Customer lewat picker. Import masih demo.");
    }, 800);
  };

  const downloadHargaTemplate = () => {
    // No 'Kode' column (kode harga tidak perlu / internal only)
    const headers = ['Item (Kode)', 'Customer (Kode atau kosong untuk Umum)', 'Harga', 'Berlaku Mulai'];
    const sampleData = [
      ['ITM-001', '', 150000, new Date().toISOString().split("T")[0]],
      ['ITM-001', 'CUS-001', 140000, new Date().toISOString().split("T")[0]],
    ];
    const wsData = [headers, ...sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Harga');
    XLSX.writeFile(wb, 'template_master_harga.xlsx');
  };

  // Download template Excel for COA import
  const downloadCoaTemplate = () => {
    const headers = ['Kode', 'Nama Akun', 'Jenis', 'Saldo Normal', 'Saldo Awal', 'Induk (Kode Induk jika ada)'];
    const sampleData = [
      ['1100', 'Kas', 'Aset', 'Debit', 5000000, ''],
      ['1110', 'Bank BCA', 'Aset', 'Debit', 25000000, ''],
      ['1100-001', 'Kas Kecil', 'Aset', 'Debit', 500000, '1100'],
      ['2100', 'Hutang Usaha', 'Kewajiban', 'Kredit', 0, ''],
      ['3100', 'Modal Disetor', 'Ekuitas', 'Kredit', 100000000, ''],
      ['4100', 'Pendapatan Penjualan', 'Pendapatan', 'Kredit', 0, ''],
      ['5100', 'Beban Pokok Penjualan', 'Beban', 'Debit', 0, ''],
    ];
    const wsData = [headers, ...sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template COA');
    XLSX.writeFile(wb, 'template_import_coa.xlsx');
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImportCoa = async () => {
    if (!importFile || !profile?.company_id) {
      alert("Pilih file Excel terlebih dahulu.");
      return;
    }

    setImportLoading(true);
    setImportProgress(0);

    try {
      const buffer = await importFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        throw new Error("File kosong atau tidak ada baris data.");
      }

      const headers = jsonData[0].map((h: any) => (h ? h.toString().trim().toLowerCase() : ''));
      const rows = jsonData.slice(1);

      // Map header indices
      const colMap: { [key: string]: number } = {};
      headers.forEach((h, i) => {
        if (h.includes('kode') && !h.includes('induk')) colMap.kode = i;
        if (h.includes('nama')) colMap.nama = i;
        if (h.includes('jenis')) colMap.jenis = i;
        if (h.includes('saldo normal')) colMap.saldoNormal = i;
        if (h.includes('saldo awal')) colMap.saldoAwal = i;
        if (h.includes('induk')) colMap.induk = i;
      });

      if (colMap.kode === undefined || colMap.nama === undefined || colMap.jenis === undefined || colMap.saldoNormal === undefined) {
        throw new Error("Format header tidak sesuai. Gunakan template yang disediakan.");
      }

      // Load existing for parent resolution
      const { data: existingCoa } = await supabase
        .from("coa")
        .select("id, code")
        .eq("company_id", profile.company_id);

      const codeToId: { [code: string]: string } = {};
      existingCoa?.forEach((c: any) => {
        codeToId[c.code] = c.id;
      });

      // Sort rows by code length for hierarchy (parents first)
      const sortedRows = [...rows].sort((a, b) => {
        const codeA = (a[colMap.kode] || '').toString().length;
        const codeB = (b[colMap.kode] || '').toString().length;
        return codeA - codeB;
      });

      let successCount = 0;
      const failedRows: string[] = [];
      const total = sortedRows.length;
      const currentBatchCodes = new Set<string>();

      for (let i = 0; i < sortedRows.length; i++) {
        const row = sortedRows[i];
        const rowNum = i + 2;

        try {
          const kode = (row[colMap.kode] || '').toString().trim();
          const nama = (row[colMap.nama] || '').toString().trim();
          const jenis = (row[colMap.jenis] || '').toString().trim();
          const saldoNormal = (row[colMap.saldoNormal] || '').toString().trim();
          const saldoAwalVal = colMap.saldoAwal !== undefined ? row[colMap.saldoAwal] : 0;
          const indukKode = colMap.induk !== undefined && row[colMap.induk] ? row[colMap.induk].toString().trim() : '';

          // Duplicate code check (in DB or within this import file)
          if (codeToId[kode] || currentBatchCodes.has(kode)) {
            failedRows.push(`Baris ${rowNum}: Kode "${kode}" sudah ada di database atau di baris sebelumnya dalam file ini`);
            continue;
          }

          if (!kode || !nama || !jenis || !saldoNormal) {
            failedRows.push(`Baris ${rowNum}: Kolom wajib kosong (Kode, Nama, Jenis, Saldo Normal)`);
            continue;
          }

          const validJenis = ['Aset', 'Kewajiban', 'Ekuitas', 'Pendapatan', 'Beban'];
          if (!validJenis.includes(jenis)) {
            failedRows.push(`Baris ${rowNum}: Jenis "${jenis}" tidak valid`);
            continue;
          }

          if (!['Debit', 'Kredit'].includes(saldoNormal)) {
            failedRows.push(`Baris ${rowNum}: Saldo Normal harus "Debit" atau "Kredit"`);
            continue;
          }

          let saldoAwal = 0;
          if (saldoAwalVal !== undefined && saldoAwalVal !== null && saldoAwalVal !== '') {
            const strVal = saldoAwalVal.toString().replace(/\./g, '').replace(',', '.');
            saldoAwal = parseFloat(strVal) || 0;
          }

          let parent_id = null;
          if (indukKode) {
            parent_id = codeToId[indukKode] || null;
            if (!parent_id) {
              failedRows.push(`Baris ${rowNum}: Induk dengan kode "${indukKode}" tidak ditemukan`);
              continue;
            }
          }

          const { error: insertError } = await supabase.from("coa").insert({
            company_id: profile.company_id,
            code: kode,
            name: nama,
            type: jenis,
            normal_balance: saldoNormal,
            saldo_awal: saldoAwal,
            parent_id: parent_id,
          });

          if (insertError) {
            failedRows.push(`Baris ${rowNum}: ${insertError.message}`);
          } else {
            successCount++;
            currentBatchCodes.add(kode);
            // Update map for children in this import (query the new id)
            const { data: inserted } = await supabase
              .from("coa")
              .select("id")
              .eq("code", kode)
              .eq("company_id", profile.company_id)
              .single();
            if (inserted) {
              codeToId[kode] = inserted.id;
            }
          }
        } catch (rowErr: any) {
          failedRows.push(`Baris ${rowNum}: ${rowErr.message || 'Error tidak diketahui'}`);
        }

        const progress = Math.round(((i + 1) / total) * 100);
        setImportProgress(progress);
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      setImportLoading(false);
      setImportProgress(0);
      setImportFile(null);
      setShowImportModal(false);

      await loadCoa();

      if (successCount > 0) {
        alert(`✅ Berhasil mengimport ${successCount} akun COA.`);
      }
      if (failedRows.length > 0) {
        const msg = `❌ Gagal memproses ${failedRows.length} baris:\n` + failedRows.slice(0, 8).join('\n') + (failedRows.length > 8 ? '\n... (lihat console untuk lengkap)' : '');
        console.error('Failed import rows:', failedRows);
        alert(msg);
      }
    } catch (err: any) {
      setImportLoading(false);
      setImportProgress(0);
      alert("Gagal memproses file: " + (err.message || err));
      console.error(err);
    }
  };

  const openAddCoaModal = () => {
    setEditingCoaId(null);
    setCoaForm({
      type: "Aset",
      parent_id: null,
      code: "",
      name: "",
      normal_balance: "Debit",
      saldo_awal: 0,
    });
    setShowCoaModal(true);
  };

  const openEditCoaModal = (coa: any) => {
    setEditingCoaId(coa.id);
    setCoaForm({
      type: coa.type,
      parent_id: coa.parent_id || null,
      code: coa.code,
      name: coa.name,
      normal_balance: coa.normal_balance,
      saldo_awal: coa.saldo_awal || 0,
    });
    setShowCoaModal(true);
  };

  const closeCoaModal = () => {
    setShowCoaModal(false);
    setEditingCoaId(null);
  };

  const parseIndonesianNumber = (str: string): number => {
    if (!str) return 0;
    // Remove thousand separators (.), replace decimal comma with dot
    const cleaned = str.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const handleCoaFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setCoaForm((prev) => {
      const updated = { ...prev };

      if (name === "saldo_awal") {
        const inputVal = value;
        updated.saldo_awal = parseIndonesianNumber(inputVal);

        // Keep pending decimal separator so user can continue typing the decimals
        setTimeout(() => {
          if (saldoInputRef.current && /[.,]$/.test(inputVal)) {
            const formatted = updated.saldo_awal.toLocaleString('id-ID');
            saldoInputRef.current.value = formatted + ',';
            const len = saldoInputRef.current.value.length;
            saldoInputRef.current.setSelectionRange(len, len);
          }
        }, 0);
      } else {
        // Cast to allow dynamic key from form input
        (updated as Record<string, any>)[name] = value;

        // If type changes, reset parent (because parents must match type)
        if (name === "type") {
          updated.parent_id = null;
          updated.code = "";
        }

        // If parent changes, clear code (user will input suffix)
        if (name === "parent_id") {
          if (value === "" || value === "none") {
            updated.parent_id = null;
          } else {
            updated.parent_id = value;
          }
          updated.code = ""; // reset suffix
        }
      }

      return updated;
    });
  };

  const handleSaveCoa = async () => {
    if (!profile?.company_id) return;
    if (!coaForm.name.trim()) {
      alert("Nama Akun wajib diisi");
      return;
    }

    let finalCode = coaForm.code.trim();

    if (coaForm.parent_id && !editingCoaId) {
      const parent = coaList.find((c: any) => c.id === coaForm.parent_id);
      if (parent) {
        const suffix = coaForm.code ? coaForm.code.padStart(3, "0") : "001";
        finalCode = `${parent.code}-${suffix}`;
      }
    }

    if (!finalCode) {
      alert("Kode akun wajib diisi");
      return;
    }

    // Duplicate check for new accounts
    if (!editingCoaId) {
      const { data: existing } = await supabase
        .from("coa")
        .select("id")
        .eq("company_id", profile.company_id)
        .eq("code", finalCode)
        .single();

      if (existing) {
        alert(`Kode "${finalCode}" sudah digunakan di perusahaan ini.`);
        setCoaModalLoading(false);
        return;
      }
    }

    setCoaModalLoading(true);

    const rawSaldo = parseFloat(coaForm.saldo_awal as any) || 0;
    const roundedSaldo = roundValue(rawSaldo, decimalSettings.decimal_places, decimalSettings.rounding_method);

    const payload = {
      code: finalCode,
      name: coaForm.name.trim(),
      type: coaForm.type,
      normal_balance: coaForm.normal_balance,
      saldo_awal: roundedSaldo,
      parent_id: coaForm.parent_id || null,
    };

    let error: any = null;
    if (editingCoaId) {
      const { error: updateError } = await supabase
        .from("coa")
        .update(payload)
        .eq("id", editingCoaId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("coa").insert({
        company_id: profile.company_id,
        ...payload,
      });
      error = insertError;
    }

    if (error) {
      console.error("Error saving COA:", error);
      alert("Gagal menyimpan akun: " + error.message);
    } else {
      await loadCoa();
      closeCoaModal();
    }

    setCoaModalLoading(false);
  };

  const handleDeleteCoa = async (coa: any) => {
    const hasChildren = coaList.some((c: any) => c.parent_id === coa.id);
    if (hasChildren) {
      alert("Tidak bisa menghapus karena masih ada akun anak di bawahnya.");
      return;
    }

    if (!confirm(`Hapus akun "${coa.name}" (${coa.code})?`)) return;

    const { error } = await supabase.from("coa").delete().eq("id", coa.id);

    if (error) {
      console.error("Error deleting COA:", error);
      alert("Gagal menghapus akun: " + error.message);
    } else {
      await loadCoa();
    }
  };

  const loadDefaultCoa = async () => {
    if (!profile?.company_id) return;

    const existingCodes = new Set(coaList.map((c: any) => c.code));

    const toInsert = DEFAULT_COA.filter((d) => !existingCodes.has(d.code)).map((d) => ({
      company_id: profile.company_id,
      ...d,
      parent_id: null,
    }));

    if (toInsert.length === 0) {
      alert("Akun default sudah tersedia semua.");
      return;
    }

    const { error } = await supabase.from("coa").insert(toInsert);

    if (error) {
      console.error("Error loading default COA:", error);
      alert("Gagal memuat akun default: " + error.message);
    } else {
      await loadCoa();
      alert(`${toInsert.length} akun default berhasil dimuat.`);
    }
  };

  const filteredCoaList = coaList.filter((coa: any) => {
    const matchesSearch =
      !searchTerm ||
      coa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coa.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || coa.type === filterType;

    return matchesSearch && matchesType;
  });

  // Load decimal settings as soon as we have company (independent of tab, for global use later)
  useEffect(() => {
    if (profile?.company_id) {
      loadDecimalSettings(profile.company_id);
    }
  }, [profile?.company_id]);

  // Load COA when profile is available and tab is coa
  useEffect(() => {
    if (profile?.company_id && activeTab === "coa") {
      loadCoa();
    }
  }, [profile?.company_id, activeTab]);

  // Load currencies & rates when tab is currency
  useEffect(() => {
    if (profile?.company_id && activeTab === "currency") {
      loadCurrencies();
      loadExchangeRates();
    }
  }, [profile?.company_id, activeTab]);

  // Load Items when tab is item
  useEffect(() => {
    if (profile?.company_id && activeTab === "item") {
      loadItems();
      loadItemCategories();
      loadItemUnits();
      // Also ensure COA list is available for picker
      if (coaList.length === 0) {
        loadCoa();
      }
    }
  }, [profile?.company_id, activeTab]);

  // Load Suppliers when tab is supplier
  useEffect(() => {
    if (profile?.company_id && activeTab === "supplier") {
      loadSuppliers();
      // ensure COA for hutang picker
      if (coaList.length === 0) {
        loadCoa();
      }
    }
  }, [profile?.company_id, activeTab]);

  // Load Customers when tab is customer
  useEffect(() => {
    if (profile?.company_id && activeTab === "customer") {
      loadCustomers();
      if (coaList.length === 0) {
        loadCoa();
      }
    }
  }, [profile?.company_id, activeTab]);

  // Load Harga when tab is harga
  useEffect(() => {
    if (profile?.company_id && activeTab === "harga") {
      loadHarga();
      loadItems();      // for item picker in form
      loadCustomers();  // for customer picker when checkbox checked
      if (coaList.length === 0) {
        loadCoa();
      }
    }
  }, [profile?.company_id, activeTab]);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Data Master</h1>
          <p className="text-sm text-slate-600">Kelola data master perusahaan (COA, Item, Supplier, Customer, dll)</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("coa")}
            className={`px-5 py-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
              activeTab === "coa"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText size={16} /> Master COA
          </button>
          <button
            onClick={() => setActiveTab("currency")}
            className={`px-5 py-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
              activeTab === "currency"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <DollarSign size={16} /> Master Mata Uang
          </button>
          <button
            onClick={() => setActiveTab("item")}
            className={`px-5 py-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
              activeTab === "item"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Package size={16} /> Master Item
          </button>
          <button
            onClick={() => setActiveTab("supplier")}
            className={`px-5 py-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
              activeTab === "supplier"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users size={16} /> Master Supplier
          </button>
          <button
            onClick={() => setActiveTab("customer")}
            className={`px-5 py-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
              activeTab === "customer"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck size={16} /> Master Customer
          </button>
          <button
            onClick={() => setActiveTab("harga")}
            className={`px-5 py-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
              activeTab === "harga"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Tag size={16} /> Master Harga
          </button>
        </div>

        <div className="max-w-6xl mx-auto">
          {activeTab === "coa" && (
            <div className="w-full max-w-6xl mx-auto rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="mb-6">
                {/* Title + action buttons row */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <FileText size={20} /> Master COA (Chart of Accounts)
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Daftar akun standar akuntansi untuk pembukuan.
                    </p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition border border-blue-200"
                    >
                      <Upload size={16} /> Import COA
                    </button>
                    <button
                      onClick={loadDefaultCoa}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                    >
                      Muat Akun Default
                    </button>

                    <button
                      onClick={() => {
                        setTempDecimalPlaces(decimalSettings.decimal_places);
                        setTempRoundingMethod(decimalSettings.rounding_method);
                        setShowDecimalModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition border border-blue-200"
                    >
                      <Settings size={16} />
                      Desimal
                    </button>

                    <button
                      onClick={openAddCoaModal}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                    >
                      <Plus size={16} /> Tambah Akun
                    </button>
                  </div>
                </div>

                {/* Filters row - minimalis & elegan */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {/* Search with icon */}
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Kode atau nama akun..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Type filter */}
                  <div className="min-w-[160px]">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">Semua Jenis</option>
                      <option value="Aset">Aset</option>
                      <option value="Kewajiban">Kewajiban</option>
                      <option value="Ekuitas">Ekuitas</option>
                      <option value="Pendapatan">Pendapatan</option>
                      <option value="Beban">Beban</option>
                    </select>
                  </div>
                </div>
              </div>

              {coaList.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
                  <FileText className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-slate-700">Belum ada akun COA.</p>
                  <p className="text-sm text-slate-600 mt-1">Klik "Muat Akun Default" untuk memulai dengan akun standar akuntansi.</p>
                </div>
              ) : filteredCoaList.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
                  <FileText className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-slate-700">Tidak ada akun yang cocok dengan filter/pencarian.</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="overflow-y-auto max-h-[480px]">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-white sticky top-0 z-10">
                        <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Kode</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Nama Akun</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Induk</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Jenis</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Saldo Normal</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Saldo Awal</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-sm">
                      {filteredCoaList.map((coa) => (
                        <tr key={coa.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-slate-900">{coa.code}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{coa.name}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {coa.parent_id 
                              ? (coaList.find((c: any) => c.id === coa.parent_id)?.name || "-")
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                              {coa.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2.5 py-0.5 text-xs rounded-full ${
                              coa.normal_balance === "Debit" 
                                ? "bg-blue-100 text-blue-700" 
                                : "bg-orange-100 text-orange-700"
                            }`}>
                              {coa.normal_balance}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm text-slate-900">
                            {(coa.saldo_awal || 0).toLocaleString('id-ID', {
                              minimumFractionDigits: decimalSettings.decimal_places,
                              maximumFractionDigits: decimalSettings.decimal_places,
                            })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditCoaModal(coa)}
                                className="p-1.5 rounded-md text-blue-600 hover:bg-blue-100 transition"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteCoa(coa)}
                                className="p-1.5 rounded-md text-red-600 hover:bg-red-100 transition"
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              )}

              <div className="mt-4 text-xs text-slate-600">
                Akun default mengikuti standar akuntansi Indonesia (SAK). Anda dapat menambah akun sesuai kebutuhan perusahaan.
              </div>

              {/* Decimal Settings Modal */}
              {showDecimalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                  <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">Pengaturan Desimal</h3>
                      <button onClick={() => setShowDecimalModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Angka Desimal</label>
                        <select
                          value={tempDecimalPlaces}
                          onChange={(e) => setTempDecimalPlaces(parseInt(e.target.value))}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                        >
                          <option value={0}>Tidak ditampilkan (0)</option>
                          <option value={1}>1 angka belakang koma</option>
                          <option value={2}>2 angka belakang koma</option>
                          <option value={3}>3 angka belakang koma</option>
                          <option value={4}>4 angka belakang koma</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembulatan</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="radio"
                              name="rounding"
                              value="runup"
                              checked={tempRoundingMethod === 'runup'}
                              onChange={() => setTempRoundingMethod('runup')}
                            />
                            Runup (5-9 naik)
                          </label>
                          <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="radio"
                              name="rounding"
                              value="rundown"
                              checked={tempRoundingMethod === 'rundown'}
                              onChange={() => setTempRoundingMethod('rundown')}
                            />
                            Rundown (0-4 turun)
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        onClick={() => setShowDecimalModal(false)}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                      >
                        Batal
                      </button>
                      <button
                        onClick={saveDecimalSettings}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Import COA Modal */}
              {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                  <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-slate-900">Import COA dari Excel</h3>
                      <button onClick={() => { setShowImportModal(false); setImportFile(null); setImportProgress(0); }} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="text-slate-700 mb-2">Ikuti format template untuk hasil terbaik.</p>
                        <button
                          onClick={downloadCoaTemplate}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-300 text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Upload size={16} /> Download Contoh Format Excel
                        </button>
                      </div>

                      <div>
                        <label className="block text-slate-800 mb-1 font-medium">Pilih File Excel</label>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition disabled:opacity-50">
                          <Upload size={16} />
                          Pilih File
                          <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleImportFileChange}
                            className="hidden"
                            disabled={importLoading}
                          />
                        </label>
                        {importFile && (
                          <p className="mt-1 text-xs text-slate-600">File: {importFile.name}</p>
                        )}
                      </div>

                      {importLoading && (
                        <div>
                          <div className="flex justify-between text-xs mb-1 text-slate-700">
                            <span>Memproses...</span>
                            <span>{importProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all"
                              style={{ width: `${importProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        onClick={() => { setShowImportModal(false); setImportFile(null); setImportProgress(0); }}
                        disabled={importLoading}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-50"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleImportCoa}
                        disabled={!importFile || importLoading}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:bg-emerald-300"
                      >
                        {importLoading ? "Memproses..." : "Import Sekarang"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Master Item Modal (modeled after COA import) */}
          {showItemImportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-slate-900">Import Master Item dari Excel</h3>
                  <button onClick={() => { setShowItemImportModal(false); setItemImportFile(null); setItemImportProgress(0); }} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-slate-700 mb-2">Ikuti format template untuk hasil terbaik. Kolom wajib: Kode, Nama Item, Kategori, Satuan, Status. Kolom opsional: Kode COA.</p>
                    <button
                      onClick={downloadItemTemplate}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-300 text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Upload size={16} /> Download Template Excel
                    </button>
                  </div>

                  <div>
                    <label className="block text-slate-800 mb-1 font-medium">Pilih File Excel</label>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition disabled:opacity-50">
                      <Upload size={16} />
                      Pilih File
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleItemImportFileChange}
                        className="hidden"
                        disabled={itemImportLoading}
                      />
                    </label>
                    {itemImportFile && (
                      <p className="mt-1 text-xs text-slate-600">File: {itemImportFile.name}</p>
                    )}
                  </div>

                  {itemImportLoading && (
                    <div>
                      <div className="flex justify-between text-xs mb-1 text-slate-700">
                        <span>Memproses...</span>
                        <span>{itemImportProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${itemImportProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => { setShowItemImportModal(false); setItemImportFile(null); setItemImportProgress(0); }}
                    disabled={itemImportLoading}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleImportItem}
                    disabled={!itemImportFile || itemImportLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:bg-emerald-300"
                  >
                    {itemImportLoading ? "Memproses..." : "Import Sekarang"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "currency" && (
            <div className="w-full max-w-6xl mx-auto rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <DollarSign size={20} /> Master Mata Uang
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Daftar mata uang &amp; kurs manual (sederhana untuk UMKM). Hanya satu Base Currency.
                    </p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={loadDefaultCurrencies}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                    >
                      Muat Default
                    </button>
                    <button
                      onClick={() => openUpdateRateModal()}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition border border-blue-200"
                    >
                      <DollarSign size={16} /> Update Kurs
                    </button>
                    <button
                      onClick={openAddCurrencyModal}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                    >
                      <Plus size={16} /> Tambah Mata Uang
                    </button>
                  </div>
                </div>
              </div>

              {currencyList.length === 0 ? (
                <div className="text-center py-10 border border-slate-200 rounded-2xl bg-slate-50">
                  <DollarSign className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                  <p className="text-slate-700">Belum ada mata uang.</p>
                  <p className="text-sm text-slate-500 mt-1">Klik "Muat Default" atau "Tambah Mata Uang".</p>
                </div>
              ) : (
                <>
                  <div className="overflow-hidden border border-slate-200 rounded-2xl">
                    <div className="overflow-y-auto max-h-[420px]">
                      <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-white sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Kode</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Nama</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Simbol</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Desimal</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {currencyList.map((c: any) => (
                            <tr key={c.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-mono text-slate-900">{c.code}</td>
                              <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                              <td className="px-4 py-3 text-slate-700">{c.symbol || "—"}</td>
                              <td className="px-4 py-3 text-center text-slate-700">{c.decimal_places}</td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1.5">
                                  {c.is_base && (
                                    <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium">
                                      Base
                                    </span>
                                  )}
                                  <span className={`inline-block px-2.5 py-0.5 text-xs rounded-full ${c.is_active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
                                    {c.is_active ? "Aktif" : "Nonaktif"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openUpdateRateModal(c.code)}
                                    className="p-1.5 rounded-md text-blue-600 hover:bg-blue-100 transition"
                                    title="Update Kurs"
                                  >
                                    <DollarSign size={15} />
                                  </button>
                                  <button
                                    onClick={() => openEditCurrencyModal(c)}
                                    className="p-1.5 rounded-md text-blue-600 hover:bg-blue-100 transition"
                                    title="Edit"
                                  >
                                    <Pencil size={15} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCurrency(c)}
                                    className="p-1.5 rounded-md text-red-600 hover:bg-red-100 transition"
                                    title="Hapus"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {exchangeRateList.length > 0 && (
                    <div className="mt-5">
                      <div className="text-xs font-medium text-slate-700 mb-1.5">Riwayat Kurs Terbaru</div>
                      <div className="text-xs text-slate-600 space-y-0.5 max-h-24 overflow-auto pr-1">
                        {exchangeRateList.slice(0, 6).map((r: any) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between border-b border-slate-100 py-0.5 last:border-none group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-slate-700">{r.currency_code}</span>
                              <span className="truncate">{r.rate_date} → {Number(r.rate).toLocaleString("id-ID")}</span>
                              <span className="text-slate-500">{r.source}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRate(r);
                              }}
                              className="ml-2 p-0.5 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition rounded hover:bg-red-50"
                              title="Hapus riwayat kurs ini"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="mt-4 text-xs text-slate-600">
                Kurs bersifat manual. Base currency (misal IDR) biasanya rate = 1. Gunakan helper getExchangeRate() untuk modul lain.
              </div>
            </div>
          )}

          {activeTab === "item" && (
            <div className="w-full max-w-6xl mx-auto rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <Package size={20} /> Master Item
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Kelola daftar barang, jasa, dan produk. Kode otomatis per kategori.
                    </p>
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    <button
                      onClick={() => setShowItemSettingsModal(true)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-2xl transition flex items-center justify-center"
                      title="Pengaturan Kategori & Satuan"
                    >
                      <Settings size={16} />
                    </button>
                    <button
                      onClick={() => setShowItemImportModal(true)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-2xl transition"
                    >
                      <Upload size={15} /> Import
                    </button>
                    <button
                      onClick={exportItems}
                      className="px-3 py-2 text-sm text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-2xl transition"
                    >
                      Export
                    </button>
                    <button
                      onClick={openAddItemModal}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm"
                    >
                      <Plus size={15} /> Tambah Item
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="relative flex-1 min-w-[260px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Cari kode atau nama item..."
                      value={itemSearchTerm}
                      onChange={(e) => setItemSearchTerm(e.target.value)}
                      className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                    />
                  </div>

                  <select
                    value={itemFilterKategori}
                    onChange={(e) => setItemFilterKategori(e.target.value)}
                    className="px-3 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white min-w-[140px]"
                  >
                    <option value="all">Semua Kategori</option>
                    {itemCategories.map((cat: any) => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>

                  <select
                    value={itemFilterSatuan}
                    onChange={(e) => setItemFilterSatuan(e.target.value)}
                    className="px-3 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white min-w-[120px]"
                  >
                    <option value="all">Semua Satuan</option>
                    {itemUnits.map((u: any) => (
                      <option key={u.name} value={u.name}>{u.name}</option>
                    ))}
                  </select>

                  <select
                    value={itemFilterStatus}
                    onChange={(e) => setItemFilterStatus(e.target.value)}
                    className="px-3 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="all">Semua Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {itemList.length === 0 ? (
                <div className="text-center py-12 border border-slate-200 rounded-2xl bg-slate-50">
                  <Package className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-slate-700 font-medium">Belum ada item</p>
                  <p className="text-sm text-slate-500 mt-1">Mulai dengan menambahkan item atau import dari template.</p>
                  <button onClick={openAddItemModal} className="mt-4 px-4 py-2 bg-emerald-500 text-white text-sm rounded-2xl">Tambah Item Pertama</button>
                </div>
              ) : filteredItemList.length === 0 ? (
                <div className="text-center py-8 text-slate-600">Tidak ada hasil yang cocok dengan pencarian/filter Anda.</div>
              ) : (
                <div className="overflow-hidden border border-slate-200 rounded-2xl">
                  <div className="overflow-y-auto max-h-[480px]">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Kode</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Nama Item</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Kategori</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Satuan</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Status</th>
                          <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredItemList.map((item: any) => (
                          <tr key={item.id} className="hover:bg-slate-50/70">
                            <td className="px-5 py-3.5 font-mono text-sm text-slate-900">{item.kode}</td>
                            <td className="px-5 py-3.5 font-medium text-slate-900">{item.nama}</td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{item.kategori}</span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-700">{item.satuan}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => openEditItemModal(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition" title="Edit">
                                  <Pencil size={15} />
                                </button>
                                <button onClick={() => handleDeleteItem(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition" title="Hapus">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-slate-600">
                Tip: Buka <span className="font-medium text-emerald-700">Pengaturan Kategori &amp; Satuan</span> untuk mengelola prefix kode per kategori.
              </div>
            </div>
          )}

          {activeTab === "supplier" && (
            <div className="w-full max-w-6xl mx-auto rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <Users size={20} /> Master Supplier
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Daftar pemasok/vendor. Kode otomatis, terhubung ke akun hutang COA.
                    </p>
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    <button
                      onClick={openSupplierSettingsModal}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-2xl transition flex items-center justify-center"
                      title="Pengaturan Kode & Syarat Pembayaran"
                    >
                      <Settings size={16} />
                    </button>
                    <button
                      onClick={() => setShowSupplierImportModal(true)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-2xl transition"
                    >
                      <Upload size={15} /> Import
                    </button>
                    <button
                      onClick={exportSuppliers}
                      className="px-3 py-2 text-sm text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-2xl transition"
                    >
                      Export
                    </button>
                    <button
                      onClick={openAddSupplierModal}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm"
                    >
                      <Plus size={15} /> Tambah Supplier
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="relative flex-1 min-w-[260px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Cari kode atau nama supplier..."
                      value={supplierSearchTerm}
                      onChange={(e) => setSupplierSearchTerm(e.target.value)}
                      className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                    />
                  </div>
                  <select
                    value={supplierFilterSyarat}
                    onChange={(e) => setSupplierFilterSyarat(e.target.value)}
                    className="px-3 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white min-w-[140px]"
                  >
                    <option value="all">Semua Syarat</option>
                    {syaratPembayaranList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    value={supplierFilterStatus}
                    onChange={(e) => setSupplierFilterStatus(e.target.value)}
                    className="px-3 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="all">Semua Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {supplierList.length === 0 ? (
                <div className="text-center py-12 border border-slate-200 rounded-2xl bg-slate-50">
                  <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-slate-700 font-medium">Belum ada supplier</p>
                  <p className="text-sm text-slate-500 mt-1">Mulai dengan menambahkan supplier atau import dari template.</p>
                  <button onClick={openAddSupplierModal} className="mt-4 px-4 py-2 bg-emerald-500 text-white text-sm rounded-2xl">Tambah Supplier Pertama</button>
                </div>
              ) : filteredSupplierList.length === 0 ? (
                <div className="text-center py-8 text-slate-600">Tidak ada hasil yang cocok dengan pencarian/filter Anda.</div>
              ) : (
                <div className="overflow-hidden border border-slate-200 rounded-2xl">
                  <div className="overflow-y-auto max-h-[480px]">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Kode</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Nama Supplier</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Kontak</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Telepon</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">NPWP</th>
                          <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600">Limit Kredit</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Status</th>
                          <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredSupplierList.map((s: any) => (
                          <tr key={s.id} className="hover:bg-slate-50/70">
                            <td className="px-5 py-3.5 font-mono text-sm font-medium text-slate-800">{s.kode}</td>
                            <td className="px-5 py-3.5 font-medium text-slate-900">{s.nama}</td>
                            <td className="px-5 py-3.5 text-slate-700">{s.kontak || "-"}</td>
                            <td className="px-5 py-3.5 text-slate-700">{s.telepon || "-"}</td>
                            <td className="px-5 py-3.5 text-slate-700 font-mono text-xs">{s.npwp || "-"}</td>
                            <td className="px-5 py-3.5 text-right font-mono text-slate-900">{Number(s.limit_kredit || 0).toLocaleString("id-ID")}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${s.status === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openEditSupplierModal(s)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition" title="Edit">
                                  <Pencil size={15} />
                                </button>
                                <button onClick={() => handleDeleteSupplier(s)} className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition" title="Hapus">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-slate-600">
                Tip: Buka Pengaturan untuk atur prefix kode dan syarat pembayaran. Hubungkan ke akun hutang via COA picker.
              </div>
            </div>
          )}

          {activeTab === "customer" && (
            <div className="w-full max-w-6xl mx-auto rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <UserCheck size={20} /> Master Customer
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Daftar pelanggan/customer. Kode otomatis, terhubung ke akun piutang COA.
                    </p>
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    <button
                      onClick={() => setShowCustomerSettingsModal(true)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-2xl transition flex items-center justify-center"
                      title="Pengaturan Kode & Syarat Pembayaran"
                    >
                      <Settings size={16} />
                    </button>
                    <button
                      onClick={() => setShowCustomerImportModal(true)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-2xl transition"
                    >
                      <Upload size={15} /> Import
                    </button>
                    <button
                      onClick={exportCustomers}
                      className="px-3 py-2 text-sm text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-2xl transition"
                    >
                      Export
                    </button>
                    <button
                      onClick={openAddCustomerModal}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm"
                    >
                      <Plus size={15} /> Tambah Customer
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="relative flex-1 min-w-[260px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Cari kode atau nama customer..."
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                    />
                  </div>
                  <select
                    value={customerFilterSyarat}
                    onChange={(e) => setCustomerFilterSyarat(e.target.value)}
                    className="px-3 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white min-w-[140px]"
                  >
                    <option value="all">Semua Syarat</option>
                    {customerSyaratList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    value={customerFilterStatus}
                    onChange={(e) => setCustomerFilterStatus(e.target.value)}
                    className="px-3 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="all">Semua Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {customerList.length === 0 ? (
                <div className="text-center py-12 border border-slate-200 rounded-2xl bg-slate-50">
                  <UserCheck className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-slate-700 font-medium">Belum ada customer</p>
                  <p className="text-sm text-slate-500 mt-1">Mulai dengan menambahkan customer atau import dari template.</p>
                  <button onClick={openAddCustomerModal} className="mt-4 px-4 py-2 bg-emerald-500 text-white text-sm rounded-2xl">Tambah Customer Pertama</button>
                </div>
              ) : filteredCustomerList.length === 0 ? (
                <div className="text-center py-8 text-slate-600">Tidak ada hasil yang cocok dengan pencarian/filter Anda.</div>
              ) : (
                <div className="overflow-hidden border border-slate-200 rounded-2xl">
                  <div className="overflow-y-auto max-h-[480px]">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Kode</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Nama Customer</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Kontak</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Telepon</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">NPWP</th>
                          <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600">Limit Kredit</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Status</th>
                          <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredCustomerList.map((c: any) => (
                          <tr key={c.id} className="hover:bg-slate-50/70">
                            <td className="px-5 py-3.5 font-mono text-sm font-medium text-slate-800">{c.kode}</td>
                            <td className="px-5 py-3.5 font-medium text-slate-900">{c.nama}</td>
                            <td className="px-5 py-3.5 text-slate-700">{c.kontak || "-"}</td>
                            <td className="px-5 py-3.5 text-slate-700">{c.telepon || "-"}</td>
                            <td className="px-5 py-3.5 text-slate-700 font-mono text-xs">{c.npwp || "-"}</td>
                            <td className="px-5 py-3.5 text-right font-mono text-slate-900">{Number(c.limit_kredit || 0).toLocaleString("id-ID")}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${c.status === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openMemberCard(c)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-xl transition" title="Kartu Member">
                                  <CreditCard size={15} />
                                </button>
                                <button onClick={() => openEditCustomerModal(c)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition" title="Edit">
                                  <Pencil size={15} />
                                </button>
                                <button onClick={() => handleDeleteCustomer(c)} className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition" title="Hapus">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-slate-600">
                Tip: Buka Pengaturan untuk atur prefix kode dan syarat pembayaran. Hubungkan ke akun piutang via COA picker.
              </div>
            </div>
          )}

          {activeTab === "harga" && (
            <div className="w-full max-w-6xl mx-auto rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="mb-6">
                {/* Title + buttons on one clean horizontal row */}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    <Tag size={20} /> Master Harga
                  </h2>
                  <div className="flex gap-2 items-center flex-wrap">
                    <button
                      onClick={() => setShowHargaImportModal(true)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-2xl transition"
                    >
                      <Upload size={15} /> Import
                    </button>
                    <button
                      onClick={exportHarga}
                      className="px-3 py-2 text-sm text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-2xl transition"
                    >
                      Export
                    </button>
                    <button
                      onClick={openAddHargaModal}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm"
                    >
                      <Plus size={15} /> Tambah Harga
                    </button>
                  </div>
                </div>

                {/* Ringkas note below the title row (no longer pushes buttons) */}
                <p className="mb-4 text-sm text-slate-600">
                  Daftar harga jual per item (dari Master Item). Centang skema customer untuk harga khusus.
                </p>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="relative flex-1 min-w-[260px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Cari item atau customer..."
                      value={hargaSearchTerm}
                      onChange={(e) => setHargaSearchTerm(e.target.value)}
                      className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                    />
                  </div>
                  <select
                    value={hargaFilterStatus}
                    onChange={(e) => setHargaFilterStatus(e.target.value)}
                    className="px-3 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="all">Semua</option>
                    <option value="customer">Harga Khusus Customer</option>
                    <option value="umum">Harga Umum (berlaku untuk Item)</option>
                  </select>
                </div>
              </div>

              {hargaList.length === 0 ? (
                <div className="text-center py-12 border border-slate-200 rounded-2xl bg-slate-50">
                  <Tag className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-slate-700 font-medium">Belum ada harga</p>
                  <p className="text-sm text-slate-500 mt-1">Mulai dengan menambahkan harga (pilih dari Master Item &amp; Customer) atau import dari template.</p>
                  <button onClick={openAddHargaModal} className="mt-4 px-4 py-2 bg-emerald-500 text-white text-sm rounded-2xl">Tambah Harga Pertama</button>
                </div>
              ) : filteredHargaList.length === 0 ? (
                <div className="text-center py-8 text-slate-600">Tidak ada hasil yang cocok dengan pencarian/filter Anda.</div>
              ) : (
                <div className="overflow-hidden border border-slate-200 rounded-2xl">
                  <div className="overflow-y-auto max-h-[480px]">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Item Barang</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Customer / Umum</th>
                          <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600">Harga</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Berlaku Mulai</th>
                          <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredHargaList.map((h: any) => (
                          <tr key={h.id} className="hover:bg-slate-50/70">
                            <td className="px-5 py-3.5">
                              <div className="font-medium text-slate-900">{h.item_nama || h.item_kode || '-'}</div>
                              {h.item_kode && <div className="text-xs font-mono text-emerald-700">{h.item_kode}</div>}
                            </td>
                            <td className="px-5 py-3.5 text-sm">
                              {h.customer_id ? (
                                <span>
                                  <span className="font-mono text-emerald-700">{h.customer_kode}</span>{" "}
                                  <span className="text-slate-900 font-medium">{h.customer_nama}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">Umum (untuk item ini)</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-right font-mono text-emerald-700 font-medium">{Number(h.harga || 0).toLocaleString("id-ID")}</td>
                            <td className="px-5 py-3.5 text-slate-700">{h.berlaku_mulai || "-"}</td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openEditHargaModal(h)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition" title="Edit">
                                  <Pencil size={15} />
                                </button>
                                <button onClick={() => handleDeleteHarga(h)} className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition" title="Hapus">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-slate-600">
                Catatan: Centang skema harga customer di form untuk memilih customer dari Master Customer. Harga tanpa centang berlaku untuk semua customer (umum per item). Pilih tanggal berlaku mulai. Tidak ada status/kode yang diatur manual.
              </div>
            </div>
          )}
        </div>

        {/* COA Add Modal */}
        {showCoaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingCoaId ? "Edit Akun COA" : "Tambah Akun COA"}
                </h3>
                <button onClick={closeCoaModal} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* 1. Pilih Jenis Akun */}
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">Jenis Akun</label>
                  <select
                    name="type"
                    value={coaForm.type}
                    onChange={handleCoaFormChange}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Aset">Aset</option>
                    <option value="Kewajiban">Kewajiban</option>
                    <option value="Ekuitas">Ekuitas</option>
                    <option value="Pendapatan">Pendapatan</option>
                    <option value="Beban">Beban</option>
                  </select>
                </div>

                {/* 2. Pilih Induk Akun */}
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">Induk Akun</label>
                  <select
                    name="parent_id"
                    value={coaForm.parent_id || "none"}
                    onChange={handleCoaFormChange}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="none">Tidak Ada Induk</option>
                    {coaList
                      .filter((c: any) => 
                        c.type === coaForm.type && 
                        c.id !== coaForm.parent_id &&
                        (!editingCoaId || c.id !== editingCoaId)
                      )
                      .map((parent: any) => (
                        <option key={parent.id} value={parent.id}>
                          {parent.code} - {parent.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Kode Akun + Preview */}
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">Kode Akun</label>

                  {editingCoaId ? (
                    // Saat edit, tampilkan kode penuh yang bisa diubah
                    <input
                      name="code"
                      value={coaForm.code}
                      onChange={handleCoaFormChange}
                      placeholder="1100"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  ) : coaForm.parent_id ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          value={coaList.find((c: any) => c.id === coaForm.parent_id)?.code || ""}
                          disabled
                          className="w-24 border border-slate-300 rounded-xl px-3 py-2 text-sm bg-slate-100 text-slate-600"
                        />
                        <span className="flex items-center text-slate-500">-</span>
                        <input
                          name="code"
                          value={coaForm.code}
                          onChange={handleCoaFormChange}
                          placeholder="001"
                          className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600">
                        Preview kode: <span className="font-mono font-semibold">{previewCode}</span>
                      </div>
                    </div>
                  ) : (
                    <input
                      name="code"
                      value={coaForm.code}
                      onChange={handleCoaFormChange}
                      placeholder="1100"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  )}
                </div>

                {/* 3. Saldo Normal */}
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">Saldo Normal</label>
                  <select
                    name="normal_balance"
                    value={coaForm.normal_balance}
                    onChange={handleCoaFormChange}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Debit">Debit</option>
                    <option value="Kredit">Kredit</option>
                  </select>
                </div>

                {/* 4. Saldo Awal */}
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">Saldo Awal</label>
                  <input
                    ref={saldoInputRef}
                    type="text"
                    name="saldo_awal"
                    value={coaForm.saldo_awal ? coaForm.saldo_awal.toLocaleString('id-ID') : ''}
                    onChange={handleCoaFormChange}
                    placeholder="0"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-right text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Nama Akun */}
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">Nama Akun</label>
                  <input
                    name="name"
                    value={coaForm.name}
                    onChange={handleCoaFormChange}
                    placeholder="Kas Kecil"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeCoaModal}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveCoa}
                  disabled={coaModalLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:bg-emerald-300"
                >
                  {coaModalLoading ? "Menyimpan..." : editingCoaId ? "Simpan Perubahan" : "Simpan Akun"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Currency Add/Edit Modal */}
        {showCurrencyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingCurrencyId ? "Edit Mata Uang" : "Tambah Mata Uang"}
                </h3>
                <button onClick={closeCurrencyModal} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kode (contoh: IDR, USD)</label>
                  <input
                    name="code"
                    value={currencyForm.code}
                    onChange={handleCurrencyFormChange}
                    placeholder="IDR"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 uppercase"
                    disabled={!!editingCurrencyId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Mata Uang</label>
                  <input
                    name="name"
                    value={currencyForm.name}
                    onChange={handleCurrencyFormChange}
                    placeholder="Indonesian Rupiah"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Simbol</label>
                    <input
                      name="symbol"
                      value={currencyForm.symbol}
                      onChange={handleCurrencyFormChange}
                      placeholder="Rp"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Angka Desimal</label>
                    <select
                      name="decimal_places"
                      value={currencyForm.decimal_places}
                      onChange={handleCurrencyFormChange}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      <option value={0}>0 (bulat)</option>
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name="is_base"
                      checked={currencyForm.is_base}
                      onChange={handleCurrencyFormChange}
                    />
                    Jadikan Base Currency
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={currencyForm.is_active}
                      onChange={handleCurrencyFormChange}
                    />
                    Aktif
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeCurrencyModal}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveCurrency}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600"
                >
                  {editingCurrencyId ? "Simpan Perubahan" : "Simpan Mata Uang"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Kurs Modal */}
        {showRateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-900">Update Kurs Manual</h3>
                <button onClick={() => setShowRateModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mata Uang</label>
                  <select
                    name="currency_code"
                    value={rateForm.currency_code}
                    onChange={handleRateFormChange}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    {currencyList
                      .filter((c: any) => c.is_active)
                      .map((c: any) => (
                        <option key={c.id} value={c.code}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Kurs</label>
                    <input
                      type="date"
                      name="rate_date"
                      value={rateForm.rate_date}
                      onChange={handleRateFormChange}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kurs (Rate)</label>
                    <input
                      type="number"
                      step="0.000001"
                      name="rate"
                      value={rateForm.rate}
                      onChange={handleRateFormChange}
                      placeholder="16000.00"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-right text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sumber (opsional)</label>
                  <input
                    name="source"
                    value={rateForm.source}
                    onChange={handleRateFormChange}
                    placeholder="Manual / BI / Google"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowRateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                  disabled={rateModalLoading}
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveRate}
                  disabled={rateModalLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:bg-emerald-300"
                >
                  {rateModalLoading ? "Menyimpan..." : "Simpan Kurs"}
                </button>
              </div>

              <p className="mt-3 text-[11px] text-slate-500">
                Kurs yang dimasukkan akan digunakan sebagai referensi (ambil yang terbaru ≤ tanggal).
              </p>
            </div>
          </div>
        )}

        {/* Master Item Add/Edit Modal */}
        {showItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingItemId ? "Edit Item" : "Tambah Item"}
                </h3>
                <button onClick={closeItemModal} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                {/* Kode Item - full width for better spacing with locked prefix */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kode Item</label>
                    {(() => {
                      const cat = itemCategories.find((c: any) => c.name === itemForm.kategori);
                      const prefix = cat?.code_prefix || '';
                      const suffix = itemForm.kode && prefix && itemForm.kode.startsWith(prefix)
                        ? itemForm.kode.slice(prefix.length)
                        : '001';
                      return (
                        <div className="flex max-w-[210px]">
                          <div className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-sm font-mono text-emerald-700 flex items-center select-none whitespace-nowrap">
                            {prefix}
                          </div>
                          <input
                            type="text"
                            value={suffix}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, '');
                              const len = cat?.code_length || 3;
                              const padded = digits.padStart(len, '0');
                              const newKode = prefix + padded;
                              setItemForm((prev) => ({ ...prev, kode: newKode }));
                            }}
                            className="flex-1 border border-slate-300 rounded-r-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                            placeholder="001"
                          />
                        </div>
                      );
                    })()}
                    <p className="text-[10px] text-emerald-600 mt-1">Prefix otomatis dari kategori. Edit hanya nomor di belakangnya.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Item</label>
                    <input
                      name="nama"
                      value={itemForm.nama}
                      onChange={handleItemFormChange}
                      placeholder="Laptop Dell Inspiron"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                    <select
                      name="kategori"
                      value={itemForm.kategori}
                      onChange={handleItemFormChange}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      {itemCategories.map((cat: any) => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Satuan</label>
                    <select
                      name="satuan"
                      value={itemForm.satuan}
                      onChange={handleItemFormChange}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      {itemUnits.map((u: any) => (
                        <option key={u.name} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>



                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={itemForm.status}
                    onChange={handleItemFormChange}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>

                {/* COA Selection - the key feature */}
                <div className="pt-2 border-t">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Akun COA</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 border border-slate-300 bg-slate-50 rounded-xl px-3 py-2 text-sm">
                      {itemForm.coa_code && itemForm.coa_name ? (
                        <span>
                          <span className="font-mono text-emerald-700">{itemForm.coa_code}</span>{" "}
                          <span className="text-slate-800">{itemForm.coa_name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Belum dipilih</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={openCoaPickerForItem}
                      className="px-3 py-2 text-sm border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                    >
                      <Search size={14} /> Pilih Akun COA
                    </button>
                  </div>

                  <div className="mt-3 flex items-start gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2.5 rounded-2xl">
                    <input
                      type="checkbox"
                      name="bulk_apply"
                      checked={bulkApplyCoa}
                      onChange={handleItemFormChange}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <label className="text-sm text-emerald-700">
                      Terapkan akun COA ini ke semua item dengan kategori yang sama
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeItemModal}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveItem}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600"
                >
                  {editingItemId ? "Simpan Perubahan" : "Simpan Item"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COA Picker Modal for Item */}
        {showCoaPickerForItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg text-slate-900">Pilih Akun COA</h3>
                <button onClick={closeCoaPickerForItem} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari kode atau nama akun..."
                  value={coaItemSearch}
                  onChange={(e) => setCoaItemSearch(e.target.value)}
                  className="w-full pl-9 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="max-h-[280px] overflow-auto border border-slate-200 rounded-2xl">
                {coaList.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-600">Memuat daftar COA...</div>
                ) : (
                  (() => {
                    const filtered = coaList.filter((c: any) =>
                      c.code.toLowerCase().includes(coaItemSearch.toLowerCase()) ||
                      c.name.toLowerCase().includes(coaItemSearch.toLowerCase())
                    );
                    return filtered.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">Tidak ada hasil untuk pencarian ini</div>
                    ) : (
                      filtered.map((c: any) => (
                        <div
                          key={c.id}
                          onClick={() => selectCoaForItem(c)}
                          className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-sm border-b last:border-none"
                        >
                          <div>
                            <span className="font-mono text-emerald-700">{c.code}</span>{" "}
                            <span className="text-slate-800">{c.name}</span>
                          </div>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{c.type}</span>
                        </div>
                      ))
                    );
                  })()
                )}
              </div>

              <div className="mt-3 text-[11px] text-slate-500">
                Pilih akun persediaan untuk barang, akun pendapatan untuk jasa, atau akun HPP sesuai kebutuhan.
              </div>
            </div>
          </div>
        )}

        {/* Modal Pengaturan Kategori & Satuan - Lebih Rapi & Luas */}
        {showItemSettingsModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="px-6 py-5 border-b flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Pengaturan Kategori &amp; Satuan</h3>
                  <p className="text-sm text-slate-700">Kelola kategori beserta prefix kode-nya dan daftar satuan</p>
                </div>
                <button onClick={() => setShowItemSettingsModal(false)} className="text-slate-400 hover:text-slate-600 p-2">
                  <X size={22} />
                </button>
              </div>

              <div className="p-6 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Kategori Column */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <h4 className="font-semibold text-slate-900 mb-1">Kategori</h4>
                    <p className="text-xs text-slate-600 mb-4">Setiap kategori punya prefix kode sendiri. Kode item otomatis di-generate saat pilih kategori.</p>

                    {/* Add/Edit Form - Selalu terlihat, lebih lebar */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className="text-xs font-medium text-slate-700 block mb-1">Nama Kategori</label>
                          <input 
                            value={categoryForm.name} 
                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} 
                            placeholder="Barang Jadi" 
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 block mb-1">Prefix Kode</label>
                          <input 
                            value={categoryForm.code_prefix} 
                            onChange={(e) => setCategoryForm({ ...categoryForm, code_prefix: e.target.value.toUpperCase() })} 
                            placeholder="BJ" 
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 focus:border-emerald-500 focus:outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 block mb-1">Digit</label>
                          <select 
                            value={categoryForm.code_length} 
                            onChange={(e) => setCategoryForm({ ...categoryForm, code_length: parseInt(e.target.value) })} 
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                          >
                            <option value={2}>2 digit</option>
                            <option value={3}>3 digit</option>
                            <option value={4}>4 digit</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={saveCategory} 
                          className="flex-1 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition"
                        >
                          {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                        </button>
                        {editingCategory && (
                          <button 
                            onClick={() => { setEditingCategory(null); setCategoryForm({ name: "", code_prefix: "", code_length: 3 }); }} 
                            className="px-4 py-2 text-sm border border-slate-300 text-slate-700 hover:bg-white rounded-xl transition"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-emerald-600 mt-2">Contoh: Prefix "BJ" + 3 digit = BJ-001, BJ-002...</p>
                    </div>

                    {/* List Kategori - hanya list yang scroll, form di atas tetap */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden text-sm bg-white">
                      <div className="max-h-[220px] overflow-y-auto">
                        {itemCategories.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-600">Belum ada kategori. Isi form di atas untuk menambah.</div>
                        ) : itemCategories.map((cat: any) => (
                          <div key={cat.id || cat.name} className="flex items-center justify-between px-4 py-2.5 border-b last:border-b-0 hover:bg-slate-50">
                            <div>
                              <span className="font-medium text-slate-900">{cat.name}</span>
                              <span className="ml-2 font-mono text-xs text-emerald-700">{cat.code_prefix} • {cat.code_length} digit</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => editCategory(cat)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg" title="Edit">
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => deleteCategory(cat)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg" title="Hapus">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Satuan Column */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-800">Satuan</h4>
                        <p className="text-xs text-slate-600">Daftar unit pengukuran item</p>
                      </div>
                    </div>

                    {/* Form Satuan - Selalu terlihat, input diperkecil, tombol diatur agar tidak overflow */}
                    <div className="flex gap-2 mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 items-center">
                      <input 
                        value={unitForm.name} 
                        onChange={(e) => setUnitForm({ name: e.target.value })} 
                        placeholder="Nama satuan (Unit, Kg, Liter...)" 
                        className="flex-1 max-w-[160px] border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none" 
                      />
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={saveUnit} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-xl transition whitespace-nowrap">
                          {editingUnit ? 'Simpan' : 'Tambah'}
                        </button>
                        {editingUnit && (
                          <button 
                            onClick={() => { setEditingUnit(null); setUnitForm({ name: "" }); }} 
                            className="px-4 py-2 border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-sm transition"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </div>

                    {/* List Satuan - hanya list yang scroll, form di atas tetap */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden text-sm bg-white">
                      <div className="max-h-[220px] overflow-y-auto">
                        {itemUnits.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-600">Belum ada satuan.</div>
                        ) : itemUnits.map((unit: any) => (
                          <div key={unit.id || unit.name} className="flex items-center justify-between px-4 py-2.5 border-b last:border-b-0 hover:bg-slate-50">
                            <span className="font-medium text-slate-900">{unit.name}</span>
                            <div className="flex gap-1">
                              <button onClick={() => editUnit(unit)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg" title="Edit">
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => deleteUnit(unit)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg" title="Hapus">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-white border-t text-xs text-slate-700">
                <strong>Catatan:</strong> Pilih kategori di form Item → kode otomatis sesuai prefix kategori tersebut. 
                Edit atau hapus di sini akan langsung memperbarui pilihan di form dan filter.
              </div>
            </div>
          </div>
        )}

        {/* Master Supplier Add/Edit Modal (modeled after Item) */}
        {showSupplierModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingSupplierId ? "Edit Supplier" : "Tambah Supplier"}
                </h3>
                <button onClick={closeSupplierModal} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kode Supplier</label>
                    <div className="flex max-w-[180px]">
                      <div className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-sm font-mono text-emerald-700 flex items-center select-none whitespace-nowrap">
                        {supplierCodePrefix}
                      </div>
                      <input
                        type="text"
                        value={supplierForm.kode && supplierForm.kode.startsWith(supplierCodePrefix) 
                          ? supplierForm.kode.slice(supplierCodePrefix.length) 
                          : ''}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '');
                          const len = supplierCodeLength;
                          const padded = digits.padStart(len, '0');
                          const newKode = supplierCodePrefix + padded;
                          setSupplierForm((prev) => ({ ...prev, kode: newKode }));
                        }}
                        className="flex-1 border border-slate-300 rounded-r-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                        placeholder="001"
                      />
                    </div>
                    <p className="text-[10px] text-emerald-600 mt-1">Prefix otomatis. Edit hanya nomor di belakangnya.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Supplier</label>
                    <input
                      name="nama"
                      value={supplierForm.nama}
                      onChange={handleSupplierFormChange}
                      placeholder="PT Supplier Maju"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kontak / PIC</label>
                    <input
                      name="kontak"
                      value={supplierForm.kontak}
                      onChange={handleSupplierFormChange}
                      placeholder="Budi Santoso"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telepon</label>
                    <input
                      name="telepon"
                      value={supplierForm.telepon}
                      onChange={handleSupplierFormChange}
                      placeholder="021-12345678"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    name="email"
                    value={supplierForm.email}
                    onChange={handleSupplierFormChange}
                    placeholder="budi@supplier.com"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
                  <input
                    name="alamat"
                    value={supplierForm.alamat}
                    onChange={handleSupplierFormChange}
                    placeholder="Jl. Industri No. 123, Jakarta"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">NPWP</label>
                    <input
                      name="npwp"
                      value={supplierForm.npwp}
                      onChange={handleSupplierFormChange}
                      placeholder="12.345.678.9-012.000"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Limit Kredit (Rp)</label>
                    <input
                      type="text"
                      name="limit_kredit"
                      value={supplierForm.limit_kredit ? supplierForm.limit_kredit.toLocaleString("id-ID") : ""}
                      onChange={handleSupplierFormChange}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-right text-slate-900 focus:outline-none focus:border-emerald-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Syarat Pembayaran</label>
                    <select
                      name="syarat_pembayaran"
                      value={supplierForm.syarat_pembayaran}
                      onChange={handleSupplierFormChange}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      {syaratPembayaranList.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={supplierForm.status}
                      onChange={handleSupplierFormChange}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>

                {/* COA Hutang (reuse concept from Item) */}
                <div className="pt-2 border-t">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Akun Hutang Usaha (COA)</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 border border-slate-300 bg-slate-50 rounded-xl px-3 py-2 text-sm">
                      {supplierForm.coa_code && supplierForm.coa_name ? (
                        <span>
                          <span className="font-mono text-emerald-700">{supplierForm.coa_code}</span>{" "}
                          <span className="text-slate-800">{supplierForm.coa_name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Belum dipilih</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={openSupplierCoaPicker}
                      className="px-3 py-2 text-sm border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                    >
                      <Search size={14} /> Pilih Akun Hutang
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeSupplierModal}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveSupplier}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600"
                >
                  {editingSupplierId ? "Simpan Perubahan" : "Simpan Supplier"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Supplier Settings Modal (prefix + syarat pembayaran list) */}
        {showSupplierSettingsModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Pengaturan Kode & Syarat Pembayaran</h3>
                <button onClick={() => setShowSupplierSettingsModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 text-sm">
                {/* Prefix */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prefix Kode Supplier</label>
                  <input
                    type="text"
                    value={tempSupplierCodePrefix}
                    onChange={(e) => setTempSupplierCodePrefix(e.target.value.toUpperCase())}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="SUP-"
                  />
                  <p className="text-[10px] text-emerald-600 mt-1">Contoh: SUP-001 (3 digit)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Panjang Nomor</label>
                  <select
                    value={tempSupplierCodeLength}
                    onChange={(e) => setTempSupplierCodeLength(parseInt(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={2}>2 digit</option>
                    <option value={3}>3 digit</option>
                    <option value={4}>4 digit</option>
                  </select>
                </div>

                {/* Syarat Pembayaran list (CRUD sederhana, pakai temp) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Syarat Pembayaran</label>
                    <button
                      onClick={() => {
                        const newSyarat = prompt("Nama syarat pembayaran baru:");
                        if (newSyarat && newSyarat.trim() && !tempSyaratPembayaranList.includes(newSyarat.trim())) {
                          setTempSyaratPembayaranList([...tempSyaratPembayaranList, newSyarat.trim()]);
                        }
                      }}
                      className="text-xs px-2 py-1 bg-emerald-500 text-white rounded-xl"
                    >
                      + Tambah
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden text-sm bg-white max-h-[140px] overflow-y-auto">
                    {tempSyaratPembayaranList.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between px-3 py-2 border-b last:border-b-0 hover:bg-slate-50">
                        <span className="font-medium text-slate-900">{s}</span>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus syarat "${s}"?`)) {
                              setTempSyaratPembayaranList(tempSyaratPembayaranList.filter((x) => x !== s));
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    // Simpan perubahan ke state utama
                    setSupplierCodePrefix(tempSupplierCodePrefix);
                    setSupplierCodeLength(tempSupplierCodeLength);
                    setSyaratPembayaranList([...tempSyaratPembayaranList]);
                    setShowSupplierSettingsModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600"
                >
                  Simpan
                </button>
                <button onClick={() => setShowSupplierSettingsModal(false)} className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50">Tutup</button>
              </div>
            </div>
          </div>
        )}

        {/* Supplier Import Modal (demo, can expand like Item) */}
        {showSupplierImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-900">Import Master Supplier dari Excel</h3>
                <button onClick={() => { setShowSupplierImportModal(false); setSupplierImportFile(null); setSupplierImportProgress(0); }} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <p className="text-slate-700">Ikuti template. Kolom wajib: Kode, Nama Supplier, Status. Opsional: Kontak, Telepon, dll + Kode Akun Hutang.</p>
                <button onClick={downloadSupplierTemplate} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-300 text-blue-600 hover:bg-blue-50 transition">
                  <Upload size={16} /> Download Template Excel
                </button>

                <div>
                  <label className="block text-slate-800 mb-1 font-medium">Pilih File Excel</label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Upload size={16} />
                    Pilih File
                    <input type="file" accept=".xlsx,.xls" onChange={handleSupplierImportFileChange} className="hidden" />
                  </label>
                  {supplierImportFile && <p className="mt-1 text-xs text-slate-600">File: {supplierImportFile.name}</p>}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setShowSupplierImportModal(false); setSupplierImportFile(null); }} className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50">Batal</button>
                <button onClick={handleImportSupplier} disabled={!supplierImportFile || supplierImportLoading} className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:bg-emerald-300">
                  {supplierImportLoading ? "Memproses..." : "Import"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Master Customer Add/Edit Modal (modeled after Supplier) */}
        {showCustomerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingCustomerId ? "Edit Customer" : "Tambah Customer"}
                </h3>
                <button onClick={closeCustomerModal} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kode Customer</label>
                    <div className="flex max-w-[260px]">
                      <div className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-sm font-mono text-emerald-700 flex items-center select-none whitespace-nowrap">
                        {customerCodePrefix}
                      </div>
                      <input
                        type="text"
                        value={customerForm.kode && customerForm.kode.startsWith(customerCodePrefix) 
                          ? customerForm.kode.slice(customerCodePrefix.length) 
                          : ''}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '');
                          const len = customerCodeLength;
                          const padded = digits.padStart(len, '0');
                          const newKode = customerCodePrefix + padded;
                          setCustomerForm((prev) => ({ ...prev, kode: newKode }));
                        }}
                        className="flex-1 border border-slate-300 rounded-r-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                        placeholder="001"
                      />
                    </div>
                    <p className="text-[10px] text-emerald-600 mt-1">Prefix otomatis. Edit hanya nomor di belakangnya.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Customer</label>
                    <input
                      name="nama"
                      value={customerForm.nama}
                      onChange={handleCustomerFormChange}
                      placeholder="PT Customer Setia"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kontak / PIC</label>
                    <input
                      name="kontak"
                      value={customerForm.kontak}
                      onChange={handleCustomerFormChange}
                      placeholder="Andi Wijaya"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telepon</label>
                    <input
                      name="telepon"
                      value={customerForm.telepon}
                      onChange={handleCustomerFormChange}
                      placeholder="021-987654"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    name="email"
                    value={customerForm.email}
                    onChange={handleCustomerFormChange}
                    placeholder="andi@customer.com"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
                  <input
                    name="alamat"
                    value={customerForm.alamat}
                    onChange={handleCustomerFormChange}
                    placeholder="Jl. Merdeka No.45, Jakarta"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">NPWP</label>
                    <input
                      name="npwp"
                      value={customerForm.npwp}
                      onChange={handleCustomerFormChange}
                      placeholder="98.765.432.1-098.000"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Limit Kredit (Rp)</label>
                    <input
                      type="text"
                      name="limit_kredit"
                      value={customerForm.limit_kredit ? customerForm.limit_kredit.toLocaleString("id-ID") : ""}
                      onChange={handleCustomerFormChange}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-right text-slate-900 focus:outline-none focus:border-emerald-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Syarat Pembayaran</label>
                    <select
                      name="syarat_pembayaran"
                      value={customerForm.syarat_pembayaran}
                      onChange={handleCustomerFormChange}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      {customerSyaratList.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={customerForm.status}
                      onChange={handleCustomerFormChange}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>

                {/* COA Piutang */}
                <div className="pt-2 border-t">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Akun Piutang Usaha (COA)</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 border border-slate-300 bg-slate-50 rounded-xl px-3 py-2 text-sm">
                      {customerForm.coa_code && customerForm.coa_name ? (
                        <span>
                          <span className="font-mono text-emerald-700">{customerForm.coa_code}</span>{" "}
                          <span className="text-slate-800">{customerForm.coa_name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Belum dipilih</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={openCustomerCoaPicker}
                      className="px-3 py-2 text-sm border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                    >
                      <Search size={14} /> Pilih Akun Piutang
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeCustomerModal}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveCustomer}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600"
                >
                  {editingCustomerId ? "Simpan Perubahan" : "Simpan Customer"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Settings Modal */}
        {showCustomerSettingsModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Pengaturan Kode & Syarat Pembayaran</h3>
                <button onClick={() => setShowCustomerSettingsModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 text-sm">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prefix Kode Customer</label>
                  <input
                    type="text"
                    value={tempCustomerCodePrefix}
                    onChange={(e) => setTempCustomerCodePrefix(e.target.value.toUpperCase())}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="CUS-"
                  />
                  <p className="text-[10px] text-emerald-600 mt-1">Contoh: CUS-001 (3 digit)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Panjang Nomor</label>
                  <select
                    value={tempCustomerCodeLength}
                    onChange={(e) => setTempCustomerCodeLength(parseInt(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={2}>2 digit</option>
                    <option value={3}>3 digit</option>
                    <option value={4}>4 digit</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Syarat Pembayaran</label>
                    <button
                      onClick={() => {
                        const newSyarat = prompt("Nama syarat pembayaran baru:");
                        if (newSyarat && newSyarat.trim() && !tempCustomerSyaratList.includes(newSyarat.trim())) {
                          setTempCustomerSyaratList([...tempCustomerSyaratList, newSyarat.trim()]);
                        }
                      }}
                      className="text-xs px-2 py-1 bg-emerald-500 text-white rounded-xl"
                    >
                      + Tambah
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden text-sm bg-white max-h-[140px] overflow-y-auto">
                    {tempCustomerSyaratList.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between px-3 py-2 border-b last:border-b-0 hover:bg-slate-50">
                        <span className="font-medium text-slate-900">{s}</span>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus syarat "${s}"?`)) {
                              setTempCustomerSyaratList(tempCustomerSyaratList.filter((x) => x !== s));
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setCustomerCodePrefix(tempCustomerCodePrefix);
                    setCustomerCodeLength(tempCustomerCodeLength);
                    setCustomerSyaratList([...tempCustomerSyaratList]);
                    setShowCustomerSettingsModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600"
                >
                  Simpan
                </button>
                <button onClick={() => setShowCustomerSettingsModal(false)} className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50">Tutup</button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Import Modal (demo) */}
        {showCustomerImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-900">Import Master Customer dari Excel</h3>
                <button onClick={() => { setShowCustomerImportModal(false); setCustomerImportFile(null); setCustomerImportProgress(0); }} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <p className="text-slate-700">Ikuti template. Kolom wajib: Kode, Nama Customer, Status. Opsional: Kontak, dll + Kode Akun Piutang.</p>
                <button onClick={downloadCustomerTemplate} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-300 text-blue-600 hover:bg-blue-50 transition">
                  <Upload size={16} /> Download Template Excel
                </button>

                <div>
                  <label className="block text-slate-800 mb-1 font-medium">Pilih File Excel</label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Upload size={16} />
                    Pilih File
                    <input type="file" accept=".xlsx,.xls" onChange={handleCustomerImportFileChange} className="hidden" />
                  </label>
                  {customerImportFile && <p className="mt-1 text-xs text-slate-600">File: {customerImportFile.name}</p>}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setShowCustomerImportModal(false); setCustomerImportFile(null); }} className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50">Batal</button>
                <button onClick={handleImportCustomer} disabled={!customerImportFile || customerImportLoading} className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:bg-emerald-300">
                  {customerImportLoading ? "Memproses..." : "Import"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Member Card Preview Modal */}
        {showMemberCardModal && selectedCustomerForCard && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-slate-900">Preview Kartu Member</h3>
                  <button onClick={() => setShowMemberCardModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={22} />
                  </button>
                </div>

                {/* Preview Card */}
                <div id="member-card-preview" className="mx-auto border-4 border-emerald-600 rounded-2xl overflow-hidden bg-white shadow-inner" style={{ width: '320px', height: '200px' }}>
                  <div className="h-full flex flex-col p-4 bg-gradient-to-br from-white to-emerald-50 relative">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-emerald-600 font-bold text-xl tracking-tight">DIAUF.ID</div>
                        <div className="text-[10px] text-emerald-700 -mt-1">MEMBER</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-slate-500">Valid s/d</div>
                        <div className="text-xs font-medium text-emerald-700">
                          {new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex mt-2 gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-600 flex-shrink-0 flex items-center justify-center text-emerald-600 font-bold text-lg">
                        {(selectedCustomerForCard.nama || 'C').split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base text-slate-900 leading-tight truncate">{selectedCustomerForCard.nama}</div>
                        <div className="font-mono text-emerald-700 text-sm tracking-wider">{selectedCustomerForCard.kode}</div>
                        <div className="text-[10px] text-slate-600 mt-1 truncate">
                          {selectedCustomerForCard.kontak || selectedCustomerForCard.email || 'Member DIAUF.ID'}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="text-[9px] text-emerald-600 flex justify-between items-end font-medium tracking-wide">
                      <div>DIAUF.ID</div>
                      <div>www.diauf.id</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3">
                <button 
                  onClick={() => setShowMemberCardModal(false)} 
                  className="px-4 py-2 text-sm text-slate-700 border border-slate-300 hover:bg-white rounded-2xl transition"
                >
                  Tutup
                </button>
                <button 
                  onClick={downloadMemberCard} 
                  className="flex items-center gap-2 px-5 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl transition shadow-sm"
                >
                  <Download size={15} /> Download PNG
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Master Harga Add/Edit Modal */}
        {showHargaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingHargaId ? "Edit Harga" : "Tambah Harga"}
                </h3>
                <button onClick={closeHargaModal} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 text-sm">
                {/* Item (always) - now using proper picker */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Item Barang (dari Master Item)</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 border border-slate-300 bg-slate-50 rounded-xl px-3 py-2 text-sm">
                      {hargaForm.item_kode && hargaForm.item_nama ? (
                        <span><span className="font-mono text-emerald-700">{hargaForm.item_kode}</span> {hargaForm.item_nama}</span>
                      ) : (
                        <span className="text-slate-400">Belum dipilih — klik tombol di kanan</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={openHargaItemPicker}
                      className="px-3 py-2 text-sm border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                    >
                      <Search size={14} /> Pilih Item
                    </button>
                  </div>
                </div>

                {/* Checkbox for customer specific - FIXED: direct onChange to guarantee boolean (no more controlled->uncontrolled) */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_customer_specific"
                    checked={!!hargaForm.is_customer_specific}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setHargaForm((prev) => ({
                        ...prev,
                        is_customer_specific: checked,
                        customer_id: checked ? prev.customer_id : null,
                        customer_kode: checked ? prev.customer_kode : "",
                        customer_nama: checked ? prev.customer_nama : "",
                      }));
                    }}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <label htmlFor="is_customer_specific" className="text-sm text-slate-700 cursor-pointer select-none">
                    Skema harga customer (centang jika harga khusus untuk customer tertentu)
                  </label>
                </div>

                {/* Customer picker (only if checked) - now using proper picker */}
                {hargaForm.is_customer_specific && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer (dari Master Customer)</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 border border-slate-300 bg-slate-50 rounded-xl px-3 py-2 text-sm">
                        {hargaForm.customer_kode && hargaForm.customer_nama ? (
                          <span><span className="font-mono text-emerald-700">{hargaForm.customer_kode}</span> {hargaForm.customer_nama}</span>
                        ) : (
                          <span className="text-slate-400">Belum dipilih — klik tombol di kanan</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={openHargaCustomerPicker}
                        className="px-3 py-2 text-sm border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                      >
                        <Search size={14} /> Pilih Customer
                      </button>
                    </div>
                  </div>
                )}

                {/* Harga + Berlaku side by side for space */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Harga (Rp)</label>
                    <input
                      type="text"
                      name="harga"
                      value={hargaForm.harga ? hargaForm.harga.toLocaleString("id-ID") : ""}
                      onChange={handleHargaFormChange}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-right text-slate-900 focus:outline-none focus:border-emerald-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Berlaku Mulai</label>
                    <input
                      type="date"
                      name="berlaku_mulai"
                      value={hargaForm.berlaku_mulai}
                      onChange={handleHargaFormChange}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeHargaModal}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveHarga}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600"
                >
                  {editingHargaId ? "Simpan Perubahan" : "Simpan Harga"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Harga Settings Modal removed - no longer needed (no prefix/jenis management per latest spec) */}

        {/* Harga Import Modal (demo) */}
        {showHargaImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-900">Import Master Harga dari Excel</h3>
                <button onClick={() => { setShowHargaImportModal(false); setHargaImportFile(null); setHargaImportProgress(0); }} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <p className="text-slate-700">Ikuti template. Kolom wajib: Item (Kode), Harga, Berlaku Mulai. Opsional: Customer (Kode atau kosong untuk Umum). Kode harga di-generate otomatis internal.</p>
                <button onClick={downloadHargaTemplate} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-300 text-blue-600 hover:bg-blue-50 transition">
                  <Upload size={16} /> Download Template Excel
                </button>

                <div>
                  <label className="block text-slate-800 mb-1 font-medium">Pilih File Excel</label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Upload size={16} />
                    Pilih File
                    <input type="file" accept=".xlsx,.xls" onChange={handleHargaImportFileChange} className="hidden" />
                  </label>
                  {hargaImportFile && <p className="mt-1 text-xs text-slate-600">File: {hargaImportFile.name}</p>}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setShowHargaImportModal(false); setHargaImportFile(null); }} className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50">Batal</button>
                <button onClick={handleImportHarga} disabled={!hargaImportFile || hargaImportLoading} className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:bg-emerald-300">
                  {hargaImportLoading ? "Memproses..." : "Import"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Harga Item Picker Modal (searchable from master itemList) */}
        {showHargaItemPicker && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg text-slate-900">Pilih Item Barang (Master Item)</h3>
                <button onClick={closeHargaItemPicker} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari kode atau nama item..."
                  value={hargaItemSearch}
                  onChange={(e) => setHargaItemSearch(e.target.value)}
                  className="w-full pl-9 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="max-h-[320px] overflow-auto border border-slate-200 rounded-2xl">
                {itemList.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-600">Daftar Master Item kosong. Tambah item dulu di tab Master Item.</div>
                ) : (
                  (() => {
                    const filtered = itemList.filter((it: any) =>
                      (it.kode && it.kode.toLowerCase().includes(hargaItemSearch.toLowerCase())) ||
                      (it.nama && it.nama.toLowerCase().includes(hargaItemSearch.toLowerCase()))
                    );
                    return filtered.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">Tidak ada item cocok.</div>
                    ) : (
                      filtered.map((it: any) => (
                        <div
                          key={it.id}
                          onClick={() => selectHargaItem(it)}
                          className="px-4 py-2.5 hover:bg-emerald-50 cursor-pointer flex justify-between items-center text-sm border-b last:border-none"
                        >
                          <div>
                            <span className="font-mono text-emerald-700">{it.kode}</span>{" "}
                            <span className="text-slate-800">{it.nama}</span>
                          </div>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{it.kategori || it.satuan || ''}</span>
                        </div>
                      ))
                    );
                  })()
                )}
              </div>

              <div className="mt-3 text-[11px] text-slate-500">Item yang dipilih akan digunakan untuk harga ini. Pastikan Master Item sudah diisi.</div>
            </div>
          </div>
        )}

        {/* Harga Customer Picker Modal (searchable from master customerList) */}
        {showHargaCustomerPicker && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg text-slate-900">Pilih Customer (Master Customer)</h3>
                <button onClick={closeHargaCustomerPicker} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari kode atau nama customer..."
                  value={hargaCustomerSearch}
                  onChange={(e) => setHargaCustomerSearch(e.target.value)}
                  className="w-full pl-9 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="max-h-[320px] overflow-auto border border-slate-200 rounded-2xl">
                {customerList.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-600">Daftar Master Customer kosong. Tambah customer dulu di tab Master Customer.</div>
                ) : (
                  (() => {
                    const filtered = customerList.filter((c: any) =>
                      (c.kode && c.kode.toLowerCase().includes(hargaCustomerSearch.toLowerCase())) ||
                      (c.nama && c.nama.toLowerCase().includes(hargaCustomerSearch.toLowerCase()))
                    );
                    return filtered.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">Tidak ada customer cocok.</div>
                    ) : (
                      filtered.map((c: any) => (
                        <div
                          key={c.id}
                          onClick={() => selectHargaCustomer(c)}
                          className="px-4 py-2.5 hover:bg-emerald-50 cursor-pointer flex justify-between items-center text-sm border-b last:border-none"
                        >
                          <div>
                            <span className="font-mono text-emerald-700">{c.kode}</span>{" "}
                            <span className="text-slate-800">{c.nama}</span>
                          </div>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{c.tipe || 'Customer'}</span>
                        </div>
                      ))
                    );
                  })()
                )}
              </div>

              <div className="mt-3 text-[11px] text-slate-500">Hanya muncul kalau checkbox "Skema harga customer" dicentang. Harga ini khusus customer tersebut.</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DataMasterPage() {
  return (
    <Suspense fallback={null}>
      <DataMasterContent />
    </Suspense>
  );
}
