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
  ArrowLeft,
  Home,
  Package,
  History,
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
};

export default function DiaufGoToko() {
  // Load config from diauf-go settings
  const [config, setConfig] = useState({
    storeName: "TOKO SASA",
    themeColor: "#041833",
    logoUrl: null as string | null,
  });

  useEffect(() => {
    const saved = localStorage.getItem("diauf_go_config");
    if (saved) {
      try {
        const cfg = JSON.parse(saved);
        setConfig({
          storeName: cfg.storeName || "TOKO SASA",
          themeColor: cfg.themeColor || "#041833",
          logoUrl: cfg.logoUrl || null,
        });
      } catch {}
    }
  }, []);

  // Products from main DIAUF (master_items + master_harga) - nyambung ke portal utama
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

  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    namaPenerima: "",
    alamat: "",
    kota: "",
    kodePos: "",
    metodePembayaran: "Transfer Bank",
  });

  // For bottom nav orders (same as /portal)
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [ordersFilter, setOrdersFilter] = useState<'active' | 'all'>('active');
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Load products & prices from main DIAUF system (same as internal penjualan / data-master)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [{ data: items }, { data: hargas }, { data: custs }] = await Promise.all([
          supabase.from("master_items").select("id, kode, nama, kategori").order("nama"),
          supabase.from("master_harga").select("item_id, harga, customer_id").order("berlaku_mulai", { ascending: false }),
          supabase.from("master_customers").select("id, kode, nama, email"),
        ]);

        const productList: Product[] = (items || []).map((item: any) => {
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

        const uniqueCats = ["Semua", ...new Set(productList.map((p) => p.kategori).filter(Boolean))];
        setCategories(uniqueCats as string[]);

        setCustomers(custs || []);
      } catch (err) {
        console.error("Gagal load data master, pakai demo:", err);
        // Fallback demo - same as main portal
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
        setCustomers([
          { id: "c1", kode: "CUS-101", nama: "Budi Santoso", email: "budi.santoso@example.com" },
          { id: "c2", kode: "CUS-102", nama: "Siti Rahayu", email: "siti.rahayu@example.com" },
        ]);
      }
    };

    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
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

  // Simple auth using master customers (or demo)
  const handleLogin = (email: string) => {
    const found = customers.find((c) => c.email?.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentCustomer(found);
      setIsLoggedIn(true);
      setShowAuthModal(false);
    } else {
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
  };

  const handleRegister = (nama: string, email: string) => {
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
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentCustomer(null);
  };

  // Checkout - will create order (nyambung ke penjualan internal via local for demo)
  const handleCheckout = () => {
    if (!isLoggedIn || !currentCustomer) {
      setIsCartOpen(false);
      setShowAuthModal(true);
      return;
    }

    if (cart.length === 0) return;

    setCheckoutForm({
      namaPenerima: currentCustomer.nama || "",
      alamat: "Jl. Contoh Alamat Pelanggan No. 123",
      kota: "Jakarta",
      kodePos: "12345",
      metodePembayaran: "Transfer Bank",
    });

    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmCheckout = () => {
    if (!currentCustomer || cart.length === 0) return;

    const newOrder = {
      id: "ORD-" + Date.now(),
      no_so: "SO-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-4),
      tanggal: new Date().toISOString().split("T")[0],
      customer: currentCustomer,
      items: [...cart],
      total: cartTotal,
      status: "Menunggu Konfirmasi",
      namaPenerima: checkoutForm.namaPenerima,
      alamat: checkoutForm.alamat,
      kota: checkoutForm.kota,
      metodePembayaran: checkoutForm.metodePembayaran,
    };

    setMyOrders((prev) => [newOrder, ...prev]);
    setLastOrder(newOrder);
    setIsCheckoutOpen(false);
    setShowSuccess(true);
    setCart([]);

    // For demo: also save to local so internal penjualan could load if bridged
    try {
      const existing = JSON.parse(localStorage.getItem("portal_myOrders") || "[]");
      localStorage.setItem("portal_myOrders", JSON.stringify([newOrder, ...existing]));
    } catch {}
  };

  // Branded header style from config
  const brandStyle = { color: config.themeColor };

  const storeInitials = config.storeName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 overflow-x-hidden"> {/* pb for fixed bottom nav (responsive on HP) */}
      {/* Branded Navbar - uses config from DIAUF-GO.ID */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Client branded header (TOKO SASA by DIAUF-GO.ID + logo) - logo and name aligned, name smaller */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo Toko" className="w-8 h-8 rounded-xl object-cover border border-slate-200 flex-shrink-0" />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: config.themeColor }}
                  >
                    {storeInitials}
                  </div>
                )}
                <div>
                  <div className="font-bold text-sm tracking-tighter leading-none" style={{ color: config.themeColor }}>{config.storeName}</div>
                  <div className="text-[9px] text-slate-500 -mt-0.5">by DIAUF-GO.ID</div>
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
                  placeholder="Cari produk di toko..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-transparent focus:border-emerald-500 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Account - after branding is now on left. Cart is in bottom nav */}
              {isLoggedIn && currentCustomer ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="hidden md:block text-slate-600 text-xs">{currentCustomer.nama}</span>
                  <button onClick={logout} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-slate-100 rounded-xl transition">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setShowAuthModal(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                >
                  <User size={16} /> Masuk
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Welcome / Hero with store branding */}
      <div style={{ backgroundColor: config.themeColor }} className="text-white">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Selamat Datang di {config.storeName}</h1>
            <p className="mt-3 text-lg text-white/80">Belanja kebutuhan harian • Harga transparan • Pengiriman cepat</p>
            <p className="mt-1 text-sm text-white/60">by DIAUF-GO.ID</p>
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

      {/* Products - connected to main DIAUF master_items + master_harga */}
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
                  <div className="text-xl font-semibold" style={{ color: config.themeColor }}>
                    Rp {product.harga.toLocaleString("id-ID")}
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white rounded-2xl transition flex items-center gap-1.5"
                    style={{ backgroundColor: config.themeColor }}
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
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCartOpen(false)} />
          <div className="ml-auto w-full max-w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="font-semibold text-xl">Keranjang Anda</div>
              <button onClick={() => setIsCartOpen(false)}><X size={22} /></button>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium leading-tight">{item.nama}</div>
                      <div style={{ color: config.themeColor }} className="text-sm">Rp {item.harga.toLocaleString("id-ID")}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateCartQty(item.id, item.qty - 1)} className="w-7 h-7 border rounded-xl">-</button>
                        <span className="px-2 font-medium">{item.qty}</span>
                        <button onClick={() => updateCartQty(item.id, item.qty + 1)} className="w-7 h-7 border rounded-xl">+</button>
                        <button onClick={() => removeFromCart(item.id)} className="ml-auto text-xs text-red-500">Hapus</button>
                      </div>
                    </div>
                    <div className="font-semibold text-right">Rp {(item.harga * item.qty).toLocaleString("id-ID")}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500">Keranjang kosong</div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t">
                <div className="flex justify-between text-lg font-semibold mb-4">
                  <span>Total Belanja</span>
                  <span style={{ color: config.themeColor }}>Rp {cartTotal.toLocaleString("id-ID")}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full text-white font-semibold py-3.5 rounded-2xl transition"
                  style={{ backgroundColor: config.themeColor }}
                >
                  Lanjut ke Checkout
                </button>
                <p className="text-center text-xs text-slate-500 mt-3">Login diperlukan untuk melanjutkan pesanan</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders / Status + Riwayat Drawer (same as /portal) */}
      {isOrdersOpen && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsOrdersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-full sm:max-w-lg bg-white shadow-2xl flex flex-col">
            <div className="p-4 sm:p-6 border-b flex items-center justify-between">
              <div className="font-semibold text-xl">Pesanan Saya</div>
              <button onClick={() => setIsOrdersOpen(false)}><X size={22} /></button>
            </div>

            {/* Filter tabs */}
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
                  className="w-full border border-slate-300 rounded-2xl px-4 py-3 mb-3 text-sm focus:outline-none focus:border-emerald-500" 
                  id="login-email" 
                />
                <button
                  onClick={() => {
                    const email = (document.getElementById("login-email") as HTMLInputElement).value || "demo@pelanggan.com";
                    handleLogin(email);
                  }}
                  className="w-full text-white py-3 rounded-2xl font-semibold"
                  style={{ backgroundColor: config.themeColor }}
                >
                  Masuk
                </button>
                <div className="text-center mt-4 text-sm">
                  Belum punya akun?{" "}
                  <button onClick={() => setAuthMode("register")} className="font-medium" style={{ color: config.themeColor }}>Daftar di sini</button>
                </div>
              </>
            ) : (
              <>
                <input type="text" placeholder="Nama Lengkap" className="w-full border border-slate-300 rounded-2xl px-4 py-3 mb-3 text-sm focus:outline-none focus:border-emerald-500" id="reg-nama" />
                <input type="email" placeholder="Email" className="w-full border border-slate-300 rounded-2xl px-4 py-3 mb-3 text-sm focus:outline-none focus:border-emerald-500" id="reg-email" />
                <button
                  onClick={() => {
                    const nama = (document.getElementById("reg-nama") as HTMLInputElement).value || "Pelanggan Baru";
                    const email = (document.getElementById("reg-email") as HTMLInputElement).value || "baru@pelanggan.com";
                    handleRegister(nama, email);
                  }}
                  className="w-full text-white py-3 rounded-2xl font-semibold"
                  style={{ backgroundColor: config.themeColor }}
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

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-4 border-b bg-white sticky top-0 z-10">
              <button onClick={() => setIsCheckoutOpen(false)} className="p-2 -ml-2 text-slate-600 hover:text-slate-900">
                <ArrowLeft size={20} />
              </button>
              <h3 className="font-semibold text-lg">Checkout</h3>
              <div className="w-8" />
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
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
                    <span style={{ color: config.themeColor }}>Rp {cartTotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

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

            <div className="p-4 sm:p-6 border-t bg-white sticky bottom-0">
              <div className="flex justify-between text-base font-semibold mb-4 px-1">
                <span>Total Pembayaran</span>
                <span style={{ color: config.themeColor }}>Rp {cartTotal.toLocaleString("id-ID")}</span>
              </div>
              <button
                onClick={handleConfirmCheckout}
                className="w-full text-white font-semibold py-3.5 rounded-2xl transition text-base"
                style={{ backgroundColor: config.themeColor }}
              >
                Konfirmasi &amp; Buat Pesanan
              </button>
              <p className="text-center text-xs text-slate-500 mt-2">Dengan melanjutkan, Anda menyetujui syarat &amp; ketentuan.</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && lastOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-8 text-center">
            <CheckCircle className="mx-auto w-16 h-16 mb-4" style={{ color: config.themeColor }} />
            <h3 className="text-2xl font-semibold">Pesanan Berhasil Dibuat!</h3>
            <p className="mt-2 text-slate-600">Nomor Pesanan Anda:</p>
            <div className="font-mono text-xl font-semibold mt-1" style={{ color: config.themeColor }}>{lastOrder.no_so}</div>
            <div className="mt-6 text-left text-sm bg-slate-50 p-4 rounded-2xl">
              <div>Total: <span className="font-semibold">Rp {lastOrder.total.toLocaleString("id-ID")}</span></div>
              <div className="mt-1" style={{ color: config.themeColor }}>Status: Menunggu Konfirmasi</div>
            </div>
            <button 
              onClick={() => { setShowSuccess(false); setLastOrder(null); }} 
              className="mt-4 w-full py-3 text-white rounded-2xl font-semibold"
              style={{ backgroundColor: config.themeColor }}
            >
              Kembali Berbelanja
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 text-xs text-center text-slate-500 border-t mt-10">
        {config.storeName} • Portal Pelanggan via DIAUF-GO.ID • Barang &amp; harga tersinkron dengan DIAUF utama
      </div>

      {/* Fixed Bottom Navigation — same as /portal for HP responsiveness, no swipe, always visible */}
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
              { key: 'status', label: 'Status Pesanan', icon: Package, action: () => { setOrdersFilter('active'); setIsOrdersOpen(true); } },
              { key: 'riwayat', label: 'Riwayat Pesanan', icon: History, action: () => { setOrdersFilter('all'); setIsOrdersOpen(true); } },
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
