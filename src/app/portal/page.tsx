"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  ShoppingCart,
  Search,
  User,
  LogOut,
  Plus,
  Minus,
  X,
  CheckCircle,
  Package,
  Clock,
  ArrowLeft,
  History,
  Home,
  Pencil,
  Save,
  MapPin,
  Phone,
} from "lucide-react";

type Product = {
  id: string;
  kode: string;
  nama: string;
  kategori?: string;
  harga: number;
};

type CartItem = Product & { qty: number };

type Customer = {
  id: string;
  kode: string;
  nama: string;
  email?: string;
  telepon?: string;
  alamat?: string;
};

export default function PortalPelanggan() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const [customers, setCustomers] = useState<Customer[]>([]);

  // Demo my orders
  const [myOrders, setMyOrders] = useState<any[]>([]);

  // Initial dummy data for Status Pesanan & Riwayat Belanja demo
  const initialDummyOrders = [
    // Active orders (untuk tab Status Pesanan)
    {
      id: "ord1", no_so: "SO-2026-0142", tanggal: "2026-06-15", customer: { nama: "Budi Santoso" },
      items: [{ nama: "Beras Premium 5kg", qty: 2, harga: 65000 }, { nama: "Minyak Goreng 2 Liter", qty: 1, harga: 32000 }],
      total: 162000, status: "Menunggu Pembayaran",
      namaPenerima: "Budi Santoso", alamat: "Jl. Sudirman No. 45", kota: "Jakarta Selatan", metodePembayaran: "Transfer Bank"
    },
    {
      id: "ord2", no_so: "SO-2026-0141", tanggal: "2026-06-14", customer: { nama: "Siti Rahayu" },
      items: [{ nama: "Gula Pasir 1kg", qty: 3, harga: 15000 }, { nama: "Telur Ayam Kampung 1kg", qty: 2, harga: 38000 }],
      total: 121000, status: "Menunggu Konfirmasi",
      namaPenerima: "Siti Rahayu", alamat: "Jl. Gatot Subroto No. 88", kota: "Jakarta Pusat", metodePembayaran: "E-Wallet (OVO/GoPay)"
    },
    {
      id: "ord3", no_so: "SO-2026-0140", tanggal: "2026-06-13", customer: { nama: "Ahmad Wijaya" },
      items: [{ nama: "Kopi Bubuk 250g", qty: 4, harga: 42000 }],
      total: 168000, status: "Dalam Proses",
      namaPenerima: "Ahmad Wijaya", alamat: "Jl. Thamrin No. 12", kota: "Jakarta", metodePembayaran: "Transfer Bank"
    },
    {
      id: "ord4", no_so: "SO-2026-0139", tanggal: "2026-06-12", customer: { nama: "Dewi Lestari" },
      items: [{ nama: "Susu UHT 1 Liter", qty: 5, harga: 18500 }, { nama: "Beras Premium 5kg", qty: 1, harga: 65000 }],
      total: 157500, status: "Dalam Pengantaran",
      namaPenerima: "Dewi Lestari", alamat: "Jl. Kuningan No. 77", kota: "Jakarta Selatan", metodePembayaran: "COD (Bayar di Tempat)"
    },
    // History - Selesai
    {
      id: "ord5", no_so: "SO-2026-0135", tanggal: "2026-06-05", customer: { nama: "Budi Santoso" },
      items: [{ nama: "Minyak Goreng 2 Liter", qty: 2, harga: 32000 }],
      total: 64000, status: "Selesai",
      namaPenerima: "Budi Santoso", alamat: "Jl. Sudirman No. 45", kota: "Jakarta Selatan", metodePembayaran: "Transfer Bank"
    },
    {
      id: "ord6", no_so: "SO-2026-0130", tanggal: "2026-05-28", customer: { nama: "Siti Rahayu" },
      items: [{ nama: "Gula Pasir 1kg", qty: 5, harga: 15000 }],
      total: 75000, status: "Selesai",
      namaPenerima: "Siti Rahayu", alamat: "Jl. Gatot Subroto No. 88", kota: "Jakarta Pusat", metodePembayaran: "E-Wallet (OVO/GoPay)"
    },
    // Failed orders
    {
      id: "ord7", no_so: "SO-2026-0128", tanggal: "2026-05-20", customer: { nama: "Ahmad Wijaya" },
      items: [{ nama: "Kopi Bubuk 250g", qty: 2, harga: 42000 }],
      total: 84000, status: "Gagal", catatanGagal: "Tidak terbayar",
      namaPenerima: "Ahmad Wijaya", alamat: "Jl. Thamrin No. 12", kota: "Jakarta", metodePembayaran: "Transfer Bank"
    },
    {
      id: "ord8", no_so: "SO-2026-0125", tanggal: "2026-05-15", customer: { nama: "Dewi Lestari" },
      items: [{ nama: "Telur Ayam Kampung 1kg", qty: 3, harga: 38000 }],
      total: 114000, status: "Gagal", catatanGagal: "Ditolak",
      namaPenerima: "Dewi Lestari", alamat: "Jl. Kuningan No. 77", kota: "Jakarta Selatan", metodePembayaran: "COD (Bayar di Tempat)"
    },
  ];
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    namaPenerima: '',
    alamat: '',
    kota: '',
    kodePos: '',
    metodePembayaran: 'Transfer Bank',
  });

  // Bottom nav + panels (for responsive HP + desktop quick access)
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [ordersFilter, setOrdersFilter] = useState<'active' | 'all'>('active');
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Controlled auth inputs (no more DOM queries)
  const [authEmail, setAuthEmail] = useState("");
  const [authNama, setAuthNama] = useState("");

  // Dummy accounts (pakai akun dummy dulu untuk testing cepat)
  const dummyCustomers: Customer[] = [
    { id: "dc1", kode: "CUS-101", nama: "Budi Santoso", email: "budi.santoso@example.com", telepon: "0812-3456-7890", alamat: "Jl. Sudirman No. 45, Jakarta Selatan" },
    { id: "dc2", kode: "CUS-102", nama: "Siti Rahayu", email: "siti.rahayu@example.com", telepon: "0813-9876-5432", alamat: "Jl. Gatot Subroto No. 88, Jakarta Pusat" },
    { id: "dc3", kode: "CUS-103", nama: "Ahmad Wijaya", email: "ahmad.wijaya@example.com", telepon: "0821-1122-3344", alamat: "Jl. Thamrin No. 12, Jakarta" },
    { id: "dc4", kode: "CUS-104", nama: "Dewi Lestari", email: "dewi.lestari@example.com", telepon: "0856-7788-9900", alamat: "Jl. Kuningan No. 77, Jakarta Selatan" },
  ];

  // Profile editing (dummy mode)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    nama: "",
    email: "",
    telepon: "",
    alamat: "",
  });

  // Load master data (items + harga + customers for demo login)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [{ data: items }, { data: hargas }, { data: custs }] = await Promise.all([
          supabase.from("master_items").select("id, kode, nama, kategori").order("nama"),
          supabase.from("master_harga").select("item_id, harga, customer_id").order("berlaku_mulai", { ascending: false }),
          supabase.from("master_customers").select("id, kode, nama, email"),
        ]);

        const productList: Product[] = (items || []).map((item: any) => {
          // Prefer general price (no customer_id) for public view
          const generalHarga = (hargas || []).filter((h: any) => h.item_id === item.id && !h.customer_id);
          const harga = generalHarga.length > 0 ? generalHarga[0].harga : 0;

          return {
            id: item.id,
            kode: item.kode,
            nama: item.nama,
            kategori: item.kategori || "Lainnya",
            harga,
          };
        });

        setProducts(productList);

        const catList = productList.map((p) => p.kategori).filter((c): c is string => !!c);
        const uniqueCats = ["Semua", ...new Set(catList)];
        setCategories(uniqueCats);

        setCustomers(custs || []);
      } catch (err) {
        console.error("Gagal load data, pakai demo:", err);
        // Fallback demo data
        const demo: Product[] = [
          { id: "p1", kode: "ITM-001", nama: "Beras Premium 5kg", kategori: "Sembako", harga: 65000 },
          { id: "p2", kode: "ITM-002", nama: "Minyak Goreng 2 Liter", kategori: "Sembako", harga: 32000 },
          { id: "p3", kode: "ITM-003", nama: "Gula Pasir 1kg", kategori: "Sembako", harga: 15000 },
          { id: "p4", kode: "ITM-004", nama: "Telur Ayam Kampung 1kg", kategori: "Protein", harga: 38000 },
          { id: "p5", kode: "ITM-005", nama: "Susu UHT 1 Liter", kategori: "Minuman", harga: 18500 },
          { id: "p6", kode: "ITM-006", nama: "Kopi Bubuk 250g", kategori: "Minuman", harga: 42000 },
        ];
        setProducts(demo);
        setCategories(["Semua", "Sembako", "Protein", "Minuman"]);
        // pakai akun dummy untuk sekarang
        setCustomers([
          { id: "dc1", kode: "CUS-101", nama: "Budi Santoso", email: "budi.santoso@example.com", telepon: "0812-3456-7890", alamat: "Jl. Sudirman No. 45, Jakarta Selatan" },
          { id: "dc2", kode: "CUS-102", nama: "Siti Rahayu", email: "siti.rahayu@example.com", telepon: "0813-9876-5432", alamat: "Jl. Gatot Subroto No. 88, Jakarta Pusat" },
          { id: "dc3", kode: "CUS-103", nama: "Ahmad Wijaya", email: "ahmad.wijaya@example.com", telepon: "0821-1122-3344", alamat: "Jl. Thamrin No. 12, Jakarta" },
          { id: "dc4", kode: "CUS-104", nama: "Dewi Lestari", email: "dewi.lestari@example.com", telepon: "0856-7788-9900", alamat: "Jl. Kuningan No. 77, Jakarta Selatan" },
        ]);
      }
    };

    loadData();
  }, []);

  // Persist myOrders, cart, and login for better demo (survive refresh)
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem("portal_myOrders");
      let ordersToUse = initialDummyOrders;

      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (parsed.length > 0) {
          // Keep demo dummies + any additional orders created by user (e.g. from checkout)
          const existingNos = new Set(initialDummyOrders.map(o => o.no_so));
          const additional = parsed.filter(o => !existingNos.has(o.no_so));
          ordersToUse = [...initialDummyOrders, ...additional];
        }
      }

      setMyOrders(ordersToUse);

      const savedCart = localStorage.getItem("portal_cart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedCustomer = localStorage.getItem("portal_customer");
      if (savedCustomer) {
        const cust = JSON.parse(savedCustomer);
        setCurrentCustomer(cust);
        setIsLoggedIn(true);
      }
    } catch (e) {
      setMyOrders(initialDummyOrders);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("portal_myOrders", JSON.stringify(myOrders));
  }, [myOrders]);

  useEffect(() => {
    localStorage.setItem("portal_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (currentCustomer) {
      localStorage.setItem("portal_customer", JSON.stringify(currentCustomer));
    }
  }, [currentCustomer]);

  const filteredProducts = products
    .filter((p) => {
      const matchSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === "Semua" || p.kategori === selectedCategory;
      return matchSearch && matchCat;
    });

  // Cart
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exist = prev.findIndex((i) => i.id === product.id);
      if (exist >= 0) {
        const updated = [...prev];
        updated[exist].qty += 1;
        return updated;
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (id: string, newQty: number) => {
    if (newQty < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: newQty } : item))
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.harga * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  // Simple auth (demo) — now using controlled inputs
  const handleLogin = () => {
    const email = authEmail.trim() || "demo@pelanggan.com";
    const found = customers.find((c) => c.email?.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentCustomer(found);
      setIsLoggedIn(true);
      setShowAuthModal(false);
    } else {
      // For demo, allow any email as new customer
      const newCust: Customer = {
        id: "cust-" + Date.now(),
        kode: "CUS-" + Math.floor(1000 + Math.random() * 9000),
        nama: email.split("@")[0],
        email,
      };
      setCustomers((prev) => [...prev, newCust]);
      setCurrentCustomer(newCust);
      setIsLoggedIn(true);
      setShowAuthModal(false);
    }
    setAuthEmail("");
    setAuthNama("");
  };

  const handleRegister = () => {
    const nama = authNama.trim() || "Pelanggan Baru";
    const email = authEmail.trim() || "baru@pelanggan.com";
    const newCust: Customer = {
      id: "cust-" + Date.now(),
      kode: "CUS-" + Math.floor(1000 + Math.random() * 9000),
      nama,
      email,
    };
    setCustomers((prev) => [...prev, newCust]);
    setCurrentCustomer(newCust);
    setIsLoggedIn(true);
    setShowAuthModal(false);
    setAuthEmail("");
    setAuthNama("");
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentCustomer(null);
    setIsEditingProfile(false);
    localStorage.removeItem("portal_customer");
    // keep orders/cart for demo history
  };

  // Dummy login (pakai akun dummy)
  const loginAsDummy = (cust: Customer) => {
    setCurrentCustomer(cust);
    setIsLoggedIn(true);
    setIsAccountOpen(true); // keep drawer open after switching
    setIsEditingProfile(false);
  };

  // Start editing profile (dummy)
  const startEditProfile = () => {
    if (!currentCustomer) return;
    setEditForm({
      nama: currentCustomer.nama || "",
      email: currentCustomer.email || "",
      telepon: currentCustomer.telepon || "",
      alamat: currentCustomer.alamat || "",
    });
    setIsEditingProfile(true);
  };

  const cancelEditProfile = () => {
    setIsEditingProfile(false);
  };

  const saveProfile = () => {
    if (!currentCustomer) return;

    const updated: Customer = {
      ...currentCustomer,
      nama: editForm.nama.trim() || currentCustomer.nama,
      email: editForm.email.trim() || currentCustomer.email,
      telepon: editForm.telepon.trim() || currentCustomer.telepon,
      alamat: editForm.alamat.trim() || currentCustomer.alamat,
    };

    setCurrentCustomer(updated);
    setIsEditingProfile(false);

    // Persist immediately
    localStorage.setItem("portal_customer", JSON.stringify(updated));
  };

  // Checkout
  const handleCheckout = () => {
    if (!isLoggedIn || !currentCustomer) {
      setIsCartOpen(false);
      setIsAccountOpen(true); // buka Akun Saya dengan dummy accounts untuk login cepat
      return;
    }

    if (cart.length === 0) return;

    // Pre-fill checkout form from customer if possible (demo)
    setCheckoutForm({
      namaPenerima: currentCustomer.nama || '',
      alamat: currentCustomer.alamat || 'Jl. Contoh Alamat Pelanggan No. 123',
      kota: 'Jakarta',
      kodePos: '12345',
      metodePembayaran: 'Transfer Bank',
    });

    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmCheckout = () => {
    if (!currentCustomer || cart.length === 0) return;

    // Basic validation
    if (!checkoutForm.alamat.trim()) {
      alert("Mohon isi alamat pengiriman.");
      return;
    }

    const newOrder = {
      id: "ORD-" + Date.now(),
      no_so: "SO-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-4),
      tanggal: new Date().toISOString().split("T")[0],
      customer: currentCustomer,
      items: [...cart],
      total: cartTotal,
      status: "Menunggu Konfirmasi",
      namaPenerima: checkoutForm.namaPenerima || currentCustomer.nama,
      alamat: checkoutForm.alamat,
      kota: checkoutForm.kota,
      metodePembayaran: checkoutForm.metodePembayaran,
    };

    setMyOrders((prev) => [newOrder, ...prev]);
    setLastOrder(newOrder);
    setIsCheckoutOpen(false);
    setShowSuccess(true);
    setCart([]);

    // In real app this would call API to create Sales Order in internal system
    console.log("Pesanan masuk ke sistem internal Penjualan:", newOrder);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 overflow-x-hidden"> {/* pb for fixed bottom nav (responsive on HP) */}
      {/* Navbar - Clean, like modern retail apps */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-[#041833] rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg tracking-tighter">DH</span>
                </div>
                <div>
                  <div className="font-bold text-2xl tracking-tighter text-[#041833]">DIAUF</div>
                  <div className="text-[10px] text-emerald-600 -mt-1 font-medium tracking-[1px]">BELANJA</div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-6">
              <div className="relative">
                <Search className="absolute left-3.5 top-2.5 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari produk..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-transparent focus:border-emerald-500 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 hover:bg-slate-50 transition relative"
              >
                <ShoppingCart size={18} />
                <span className="hidden sm:inline text-sm font-medium">Keranjang</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Akun (replaces the old "Masuk" button) - always opens Akun Saya experience */}
              <button
                onClick={() => setIsAccountOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-slate-200 hover:bg-slate-50 transition"
                title="Akun Saya"
              >
                <User size={18} />
                {isLoggedIn && currentCustomer && (
                  <span className="hidden md:block text-sm text-slate-600 max-w-[90px] truncate">
                    {currentCustomer.nama.split(" ")[0]}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero / Welcome */}
      <div className="bg-[#041833] text-white">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Belanja Kebutuhan Harian</h1>
            <p className="mt-3 text-lg text-emerald-400">Harga transparan • Produk segar • Pengiriman cepat</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium border transition whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#041833] text-white border-[#041833]"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white border border-slate-200 rounded-3xl p-3 sm:p-4 flex flex-col hover:shadow-lg hover:border-slate-300 transition-all"
              >
                <div className="aspect-[4/3] bg-slate-100 rounded-2xl mb-3 sm:mb-4 flex items-center justify-center text-6xl sm:text-7xl text-slate-300">
                  🛒
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-slate-900 leading-tight mb-1 group-hover:text-emerald-700 transition">
                    {product.nama}
                  </div>
                  <div className="text-xs text-slate-500">{product.kode}</div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xl font-semibold text-emerald-600">
                    Rp {product.harga.toLocaleString("id-ID")}
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-[#041833] hover:bg-[#0a2540] text-white rounded-2xl transition flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Beli
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500">
              Tidak ada produk yang cocok dengan pencarian Anda.
            </div>
          )}
        </div>
      </div>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsCartOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-full sm:max-w-md bg-white shadow-2xl flex flex-col">
            <div className="p-5 sm:p-6 border-b flex items-center justify-between">
              <div>
                <div className="font-semibold text-xl">Keranjang Anda</div>
                {isLoggedIn && currentCustomer && (
                  <div className="text-xs text-emerald-700 mt-0.5">
                    {currentCustomer.nama} • {currentCustomer.kode}
                  </div>
                )}
              </div>
              <button onClick={() => setIsCartOpen(false)}><X size={22} /></button>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium leading-tight text-slate-900">{item.nama}</div>
                      <div className="text-emerald-600 text-sm">Rp {item.harga.toLocaleString("id-ID")}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          onClick={() => updateCartQty(item.id, item.qty - 1)} 
                          className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-lg leading-none"
                        >
                          −
                        </button>
                        <span className="px-3 font-medium text-sm min-w-[24px] text-center">{item.qty}</span>
                        <button 
                          onClick={() => updateCartQty(item.id, item.qty + 1)} 
                          className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-lg leading-none"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="ml-auto text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                    <div className="font-semibold text-right text-slate-900 whitespace-nowrap">
                      Rp {(item.harga * item.qty).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-slate-400 text-5xl mb-3">🛒</div>
                  <div className="font-medium text-slate-700">Keranjang kosong</div>
                  <p className="text-sm text-slate-500 mt-1">Tambahkan produk dari halaman utama</p>
                  <button 
                    onClick={() => setIsCartOpen(false)} 
                    className="mt-4 px-5 py-2 text-sm border border-slate-300 rounded-2xl hover:bg-slate-50"
                  >
                    Lanjut Belanja
                  </button>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 sm:p-6 border-t bg-white">
                <div className="flex justify-between text-base sm:text-lg font-semibold mb-4">
                  <span>Total Belanja</span>
                  <span className="text-emerald-600">Rp {cartTotal.toLocaleString("id-ID")}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold py-3.5 rounded-2xl transition text-sm sm:text-base"
                >
                  {isLoggedIn && currentCustomer 
                    ? "Lanjut ke Checkout" 
                    : "Login untuk Checkout"}
                </button>

                {!isLoggedIn && (
                  <p className="text-center text-xs text-slate-500 mt-3">
                    Pilih akun demo di halaman Akun untuk melanjutkan
                  </p>
                )}

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full mt-2 text-sm text-slate-600 hover:text-slate-800 py-2"
                >
                  Lanjut Belanja
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md sm:rounded-3xl rounded-t-3xl p-6 sm:p-7">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl">{authMode === "login" ? "Masuk" : "Daftar Pelanggan Baru"}</h3>
              <button onClick={() => setShowAuthModal(false)}><X /></button>
            </div>

            {authMode === "login" ? (
              <>
                <input
                  type="email"
                  placeholder="Email Anda"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-3 mb-3 text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleLogin}
                  className="w-full bg-[#041833] text-white py-3 rounded-2xl font-semibold"
                >
                  Masuk
                </button>
                <div className="text-center mt-4 text-sm">
                  Belum punya akun?{" "}
                  <button onClick={() => setAuthMode("register")} className="text-emerald-600 font-medium">Daftar di sini</button>
                </div>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={authNama}
                  onChange={(e) => setAuthNama(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-3 mb-3 text-sm focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-3 mb-3 text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleRegister}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-semibold"
                >
                  Daftar &amp; Masuk
                </button>
              </>
            )}

            <div className="mt-4 text-xs text-center text-slate-500">
              Demo • Data akan tersimpan sementara di browser
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal / Halaman Checkout (Mobile Responsive) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b bg-white sticky top-0 z-10">
              <button onClick={() => setIsCheckoutOpen(false)} className="p-2 -ml-2 text-slate-600 hover:text-slate-900">
                <ArrowLeft size={20} />
              </button>
              <h3 className="font-semibold text-lg">Checkout</h3>
              <div className="w-8" />
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
              {/* Order Summary */}
              <div>
                <h4 className="font-semibold text-sm mb-3 text-slate-700">Ringkasan Pesanan</h4>
                <div className="space-y-2 text-sm border border-slate-200 rounded-2xl p-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.nama} × {item.qty}</span>
                      <span className="font-medium">Rp {(item.harga * item.qty).toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-emerald-600">Rp {cartTotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div>
                <h4 className="font-semibold text-sm mb-3 text-slate-700">Informasi Pengiriman</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Nama Penerima</label>
                    <input
                      type="text"
                      value={checkoutForm.namaPenerima}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, namaPenerima: e.target.value })}
                      className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="Nama penerima"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Alamat Lengkap</label>
                    <textarea
                      value={checkoutForm.alamat}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, alamat: e.target.value })}
                      rows={2}
                      className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="Alamat lengkap"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Kota</label>
                      <input
                        type="text"
                        value={checkoutForm.kota}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, kota: e.target.value })}
                        className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                        placeholder="Kota"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Kode Pos</label>
                      <input
                        type="text"
                        value={checkoutForm.kodePos}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, kodePos: e.target.value })}
                        className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                        placeholder="Kode Pos"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div>
                <h4 className="font-semibold text-sm mb-3 text-slate-700">Metode Pembayaran</h4>
                <select
                  value={checkoutForm.metodePembayaran}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, metodePembayaran: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="COD (Bayar di Tempat)">COD (Bayar di Tempat)</option>
                  <option value="E-Wallet (OVO/GoPay)">E-Wallet (OVO/GoPay)</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t bg-white sticky bottom-0">
              <div className="flex justify-between text-base font-semibold mb-4 px-1">
                <span>Total Pembayaran</span>
                <span className="text-emerald-600">Rp {cartTotal.toLocaleString("id-ID")}</span>
              </div>
              <button
                onClick={handleConfirmCheckout}
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold py-3.5 rounded-2xl transition text-base"
              >
                Konfirmasi &amp; Buat Pesanan
              </button>
              <p className="text-center text-xs text-slate-500 mt-2">Dengan melanjutkan, Anda menyetujui syarat &amp; ketentuan.</p>
            </div>
          </div>
        </div>
      )}

      {/* Orders / Status + Riwayat Drawer (opened from bottom nav) - fixed with same reliable absolute right pattern as Akun & Keranjang */}
      {isOrdersOpen && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsOrdersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-full sm:max-w-md bg-white shadow-2xl flex flex-col">
            <div className="p-4 sm:p-6 border-b flex items-center justify-between">
              <div className="font-semibold text-xl">Pesanan Saya</div>
              <button onClick={() => setIsOrdersOpen(false)}><X size={22} /></button>
            </div>

            {/* Filter tabs - responsive for HP */}
            <div className="px-4 sm:px-6 pt-3 pb-2 flex gap-2 border-b">
              <button
                onClick={() => setOrdersFilter('active')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm rounded-2xl font-medium border transition ${ordersFilter === 'active' ? 'bg-[#041833] text-white border-[#041833]' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                Status Pesanan
              </button>
              <button
                onClick={() => setOrdersFilter('all')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm rounded-2xl font-medium border transition ${ordersFilter === 'all' ? 'bg-[#041833] text-white border-[#041833]' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                Riwayat Pesanan
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-4">
              {(() => {
                const activeStatuses = ["Menunggu Pembayaran", "Menunggu Konfirmasi", "Dalam Proses", "Dalam Pengantaran"];
                const historyStatuses = ["Selesai", "Gagal"];

                const filtered = ordersFilter === 'active'
                  ? myOrders.filter((o: any) => activeStatuses.includes(o.status))
                  : myOrders.filter((o: any) => historyStatuses.includes(o.status));

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-500">
                      {ordersFilter === 'active' ? 'Belum ada pesanan aktif.' : 'Belum ada riwayat pesanan.'}
                    </div>
                  );
                }

                return filtered.map((order: any, idx: number) => {
                  let badgeClass = "bg-slate-100 text-slate-700";
                  if (["Menunggu Pembayaran", "Menunggu Konfirmasi"].includes(order.status)) {
                    badgeClass = "bg-amber-100 text-amber-700";
                  } else if (["Dalam Proses", "Dalam Pengantaran"].includes(order.status)) {
                    badgeClass = "bg-blue-100 text-blue-700";
                  } else if (order.status === "Selesai") {
                    badgeClass = "bg-emerald-100 text-emerald-700";
                  } else if (order.status === "Gagal") {
                    badgeClass = "bg-red-100 text-red-700";
                  }

                  return (
                    <div key={idx} className="border border-slate-200 rounded-3xl p-3 sm:p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0">
                          <div className="font-mono font-semibold text-emerald-700 text-sm truncate">{order.no_so}</div>
                          <div className="text-[10px] text-slate-500">{order.tanggal}</div>
                        </div>
                        <span className={`text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-medium whitespace-nowrap ${badgeClass}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm space-y-0.5 mt-2">
                        {order.items?.slice(0, 3).map((it: any, i: number) => (
                          <div key={i} className="flex justify-between text-slate-700">
                            <span className="truncate">{it.nama} × {it.qty}</span>
                            <span className="ml-2 whitespace-nowrap">Rp {(it.harga * it.qty).toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="text-[10px] text-slate-500">+{order.items.length - 3} item lainnya</div>
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t flex justify-between text-sm font-semibold">
                        <span>Total</span>
                        <span className="text-emerald-600">Rp {order.total.toLocaleString('id-ID')}</span>
                      </div>

                      {order.namaPenerima || order.alamat ? (
                        <div className="mt-1.5 text-[10px] text-slate-500 leading-tight">
                          {order.namaPenerima && <div>Penerima: {order.namaPenerima}</div>}
                          {order.alamat && <div className="line-clamp-1">{order.alamat}, {order.kota}</div>}
                          {order.metodePembayaran && <div>Bayar: {order.metodePembayaran}</div>}
                        </div>
                      ) : null}

                      {order.status === 'Gagal' && order.catatanGagal && (
                        <div className="mt-2 text-[10px] text-red-600 bg-red-50 p-1.5 rounded-lg">
                          Alasan gagal: {order.catatanGagal}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            <div className="p-4 sm:p-6 border-t text-[10px] sm:text-xs text-center text-slate-500">
              Pesanan akan muncul di sistem internal Penjualan untuk diproses.
            </div>
          </div>
        </div>
      )}

      {/* Akun Saya - Right side drawer (exact same pattern as Keranjang & Pesanan Saya for reliability).
         Mobile: full width slide from side (responsif HP). Desktop: side panel. 
         Backdrop only closes when clicking the dark area. Inner content fully clickable. */}
      {isAccountOpen && (
        <div className="fixed inset-0 z-[110]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsAccountOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-full sm:max-w-md lg:max-w-lg bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b bg-white">
              <div className="font-semibold text-xl">Akun Saya</div>
              <button onClick={() => setIsAccountOpen(false)} className="p-1 -mr-1"><X size={22} /></button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* NOT LOGGED IN: Dummy account picker */}
              {!currentCustomer && (
                <div>
                  <div className="text-center mb-4">
                    <div className="mx-auto w-12 h-12 bg-[#041833] rounded-2xl flex items-center justify-center mb-3">
                      <User size={24} className="text-white" />
                    </div>
                    <div className="font-semibold text-lg">Selamat datang di DIAUF Belanja</div>
                    <p className="text-sm text-slate-600 mt-1">Pilih akun demo untuk mulai berbelanja</p>
                  </div>

                  <div className="space-y-2">
                    {dummyCustomers.map((cust) => (
                      <button
                        key={cust.id}
                        onClick={() => loginAsDummy(cust)}
                        className="w-full flex items-center gap-3 p-3 border border-slate-200 hover:border-[#041833] hover:bg-slate-50 rounded-2xl transition text-left"
                      >
                        <div className="w-10 h-10 bg-[#041833] text-white rounded-xl flex items-center justify-center font-bold flex-shrink-0">
                          {cust.nama[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900 truncate">{cust.nama}</div>
                          <div className="text-xs font-mono text-emerald-700">{cust.kode}</div>
                          <div className="text-xs text-slate-500 truncate">{cust.email}</div>
                        </div>
                        <div className="text-emerald-600 text-sm font-medium">Pilih →</div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 text-center text-xs text-slate-500">
                    Data dummy • Perubahan tersimpan di browser
                  </div>
                </div>
              )}

              {/* LOGGED IN: Profile + edit + stats + quick links */}
              {currentCustomer && (
                <>
                  {/* Profile Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-[#041833] rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                      {currentCustomer.nama?.[0] || 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xl text-slate-900 leading-tight">{currentCustomer.nama}</div>
                      <div className="font-mono text-sm text-emerald-700 mt-0.5">{currentCustomer.kode}</div>
                      {currentCustomer.email && (
                        <div className="text-sm text-slate-600 mt-1 truncate">{currentCustomer.email}</div>
                      )}
                    </div>
                  </div>

                  {/* Edit Profile */}
                  {isEditingProfile ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 space-y-3">
                      <div className="font-semibold text-sm text-slate-700 mb-1 flex items-center gap-2">
                        <Pencil size={16} /> Edit Profil (Dummy)
                      </div>

                      <div>
                        <label className="text-xs text-slate-600">Nama Lengkap</label>
                        <input
                          value={editForm.nama}
                          onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                          className="w-full mt-1 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-600">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full mt-1 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-600">Telepon</label>
                        <input
                          value={editForm.telepon}
                          onChange={(e) => setEditForm({ ...editForm, telepon: e.target.value })}
                          className="w-full mt-1 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                          placeholder="08xx-xxxx-xxxx"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-600">Alamat Pengiriman Utama</label>
                        <textarea
                          value={editForm.alamat}
                          onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                          rows={2}
                          className="w-full mt-1 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={cancelEditProfile}
                          className="flex-1 py-2.5 border border-slate-300 rounded-2xl text-sm font-medium hover:bg-white"
                        >
                          Batal
                        </button>
                        <button
                          onClick={saveProfile}
                          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
                        >
                          <Save size={16} /> Simpan Perubahan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentCustomer.telepon && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone size={18} className="text-slate-400" />
                          <span className="text-slate-700">{currentCustomer.telepon}</span>
                        </div>
                      )}
                      {currentCustomer.alamat && (
                        <div className="flex items-start gap-3 text-sm">
                          <MapPin size={18} className="text-slate-400 mt-0.5" />
                          <span className="text-slate-700">{currentCustomer.alamat}</span>
                        </div>
                      )}

                      <button
                        onClick={startEditProfile}
                        className="mt-2 flex items-center gap-2 text-sm text-[#041833] hover:text-emerald-600 font-medium"
                      >
                        <Pencil size={16} /> Edit Profil
                      </button>
                    </div>
                  )}

                  {/* Ringkasan Belanja */}
                  <div className="border border-slate-200 rounded-3xl p-4">
                    <div className="font-semibold text-sm text-slate-700 mb-3">Ringkasan Belanja</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-slate-500 text-xs">Total Pesanan</div>
                        <div className="font-semibold text-xl text-slate-900">{myOrders.length}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Total Belanja</div>
                        <div className="font-semibold text-xl text-emerald-600">
                          Rp {myOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0).toLocaleString("id-ID")}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Pesanan Aktif</div>
                        <div className="font-semibold text-xl text-amber-600">
                          {myOrders.filter((o: any) => o.status !== "Selesai").length}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Status Terakhir</div>
                        <div className="font-semibold text-sm text-slate-900 mt-1">
                          {myOrders[0]?.status || "Belum ada pesanan"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick links */}
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-2">AKSI CEPAT</div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setIsAccountOpen(false);
                          setOrdersFilter("active");
                          setIsOrdersOpen(true);
                        }}
                        className="w-full text-left px-4 py-3 bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl text-sm flex items-center justify-between"
                      >
                        <span>Lihat Status Pesanan</span>
                        <span className="text-emerald-600">→</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsAccountOpen(false);
                          setOrdersFilter("all");
                          setIsOrdersOpen(true);
                        }}
                        className="w-full text-left px-4 py-3 bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl text-sm flex items-center justify-between"
                      >
                        <span>Lihat Riwayat Pesanan</span>
                        <span className="text-emerald-600">→</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom action bar */}
            <div className="p-4 sm:p-5 border-t bg-white">
              {currentCustomer ? (
                <button
                  onClick={() => {
                    logout();
                    setIsAccountOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-2xl font-semibold"
                >
                  <LogOut size={18} /> Keluar dari Akun
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsAccountOpen(false);
                    setAuthMode("login");
                    setShowAuthModal(true);
                  }}
                  className="w-full py-3 bg-[#041833] hover:bg-[#0a2540] text-white rounded-2xl font-semibold text-sm"
                >
                  Masuk dengan Email Lain
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && lastOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-8 text-center">
            <CheckCircle className="mx-auto text-emerald-500 w-16 h-16 mb-4" />
            <h3 className="text-2xl font-semibold">Pesanan Berhasil Dibuat!</h3>
            <p className="mt-2 text-slate-600">Nomor Pesanan Anda:</p>
            <div className="font-mono text-xl font-semibold text-emerald-600 mt-1">{lastOrder.no_so}</div>
            <div className="mt-6 text-left text-sm bg-slate-50 p-4 rounded-2xl">
              <div>Total: <span className="font-semibold">Rp {lastOrder.total.toLocaleString("id-ID")}</span></div>
              <div className="text-emerald-600 mt-1">Status: Menunggu Konfirmasi</div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setLastOrder(null);
                  // Open orders drawer focused on active
                  setOrdersFilter('active');
                  setIsOrdersOpen(true);
                }}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold"
              >
                Lihat Status Pesanan
              </button>
              <button
                onClick={() => { setShowSuccess(false); setLastOrder(null); }}
                className="w-full py-3 bg-[#041833] text-white rounded-2xl font-semibold"
              >
                Kembali Berbelanja
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 text-xs text-center text-slate-500 border-t mt-10">
        Portal Pelanggan DIAUF • Tampilan demo • Data terhubung dengan sistem utama
      </div>

      {/* Fixed Bottom Navigation — always visible (fixed), no horizontal swipe on HP, responsive */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-[90] overflow-x-hidden">
        <div className="max-w-7xl mx-auto overflow-x-hidden">
          <div className="grid grid-cols-4 w-full text-[9px] sm:text-[10px]">
            {[
              { key: 'home', label: 'Home', icon: Home, action: () => {
                  setIsOrdersOpen(false);
                  setIsAccountOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } },
              { key: 'keranjang', label: 'Keranjang', icon: ShoppingCart, action: () => setIsCartOpen(true) },
              { key: 'status', label: 'Status', icon: Package, action: () => { setOrdersFilter('active'); setIsOrdersOpen(true); } },
              { key: 'riwayat', label: 'Riwayat', icon: History, action: () => { setOrdersFilter('all'); setIsOrdersOpen(true); } },
            ].map((item) => {
              const Icon = item.icon;
              const count = item.key === 'keranjang' ? cartCount : 0;
              return (
                <button
                  key={item.key}
                  onClick={item.action}
                  className="flex flex-col items-center justify-center py-2 sm:py-3 text-slate-600 hover:text-[#041833] active:text-emerald-600 border-t-2 border-transparent active:border-emerald-500 transition relative min-w-0"
                >
                  <div className="relative">
                    <Icon size={18} />
                    {count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                        {count > 9 ? '9+' : count}
                      </span>
                    )}
                  </div>
                  <span className="mt-0.5 text-[8px] sm:text-[9px] font-medium tracking-tight truncate w-full text-center px-0.5">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
