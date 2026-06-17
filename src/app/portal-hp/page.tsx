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

export default function PortalPelangganHP() {
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
    alamat: '',
    kota: '',
    kodePos: '',
    metodePembayaran: 'Transfer Bank',
  });

  // Load data
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
        setCategories(uniqueCats);
        setCustomers(custs || []);
      } catch (err) {
        const demo: Product[] = [
          { id: "p1", kode: "ITM-001", nama: "Beras Premium 5kg", kategori: "Sembako", harga: 65000 },
          { id: "p2", kode: "ITM-002", nama: "Minyak Goreng 2 Liter", kategori: "Sembako", harga: 32000 },
          { id: "p3", kode: "ITM-003", nama: "Gula Pasir 1kg", kategori: "Sembako", harga: 15000 },
          { id: "p4", kode: "ITM-004", nama: "Telur Ayam Kampung 1kg", kategori: "Protein", harga: 38000 },
          { id: "p5", kode: "ITM-005", nama: "Susu UHT 1 Liter", kategori: "Minuman", harga: 18500 },
        ];
        setProducts(demo);
        setCategories(["Semua", "Sembako", "Protein", "Minuman"]);
        setCustomers([
          { id: "c1", kode: "CUS-001", nama: "Budi Santoso", email: "budi@example.com" },
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
    setCart((prev) => prev.map((item) => item.id === id ? { ...item, qty: newQty } : item));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

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
    setCart([]);
  };

  const handleCheckout = () => {
    if (!isLoggedIn || !currentCustomer) {
      setIsCartOpen(false);
      setShowAuthModal(true);
      return;
    }
    if (cart.length === 0) return;

    setCheckoutForm({
      alamat: currentCustomer.alamat || 'Jl. Contoh No. 123',
      kota: currentCustomer.kota || 'Jakarta',
      kodePos: currentCustomer.kodePos || '12345',
      metodePembayaran: 'Transfer Bank',
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
      alamat: checkoutForm.alamat,
      kota: checkoutForm.kota,
      metodePembayaran: checkoutForm.metodePembayaran,
    };

    setMyOrders((prev) => [newOrder, ...prev]);
    setLastOrder(newOrder);
    setIsCheckoutOpen(false);
    setShowSuccess(true);
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex justify-center">
      {/* Phone Frame for HP Demo */}
      <div className="w-full max-w-[390px] border border-slate-300 rounded-[3rem] overflow-hidden shadow-2xl bg-white my-4" style={{ height: 'calc(100vh - 2rem)' }}>
        <div className="h-6 bg-black flex items-center justify-center">
          <div className="w-20 h-1 bg-slate-400 rounded-full"></div>
        </div>

        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#041833] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xs">DH</span>
              </div>
              <div className="font-bold text-lg tracking-tighter text-[#041833]">DIAUF BELANJA</div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setIsCartOpen(true)} className="relative p-2">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </button>

              {isLoggedIn && currentCustomer ? (
                <button onClick={logout} className="p-2 text-slate-500">
                  <LogOut size={18} />
                </button>
              ) : (
                <button onClick={() => { setAuthMode("login"); setShowAuthModal(true); }} className="p-2 text-slate-600">
                  <User size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari produk..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-transparent focus:border-emerald-500 rounded-2xl text-sm"
              />
            </div>
          </div>
        </nav>

        {/* Categories */}
        <div className="px-4 pt-3 pb-2 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-full border transition whitespace-nowrap ${selectedCategory === cat ? 'bg-[#041833] text-white border-[#041833]' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="px-4 py-4 grid grid-cols-2 gap-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-white border border-slate-200 rounded-2xl p-3">
                <div className="h-20 bg-slate-100 rounded-xl mb-2 flex items-center justify-center text-4xl">🛒</div>
                <div className="text-xs font-medium leading-tight line-clamp-2 mb-1">{product.nama}</div>
                <div className="text-[10px] text-slate-500 mb-2">{product.kode}</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-emerald-600">Rp {product.harga.toLocaleString("id-ID")}</div>
                  <button onClick={() => addToCart(product)} className="text-[10px] px-2 py-1 bg-[#041833] text-white rounded-xl">Beli</button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-xs text-slate-500">Tidak ada produk.</div>
          )}
        </div>

        {/* Bottom nav for mobile feel */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto bg-white border-t flex justify-around py-2 text-xs">
          <div className="text-center">Home</div>
          <div className="text-center" onClick={() => setIsCartOpen(true)}>Keranjang ({cartCount})</div>
          <div className="text-center">Pesanan</div>
          <div className="text-center" onClick={() => { setAuthMode("login"); setShowAuthModal(true); }}>Akun</div>
        </div>

        {/* Cart */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex items-end">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsCartOpen(false)} />
            <div className="relative w-full bg-white rounded-t-3xl p-4 max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div className="font-semibold">Keranjang</div>
                <button onClick={() => setIsCartOpen(false)}><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-auto space-y-3 text-sm">
                {cart.length > 0 ? cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>{item.nama} x{item.qty}</div>
                    <div className="flex gap-2 items-center">
                      <button onClick={() => updateCartQty(item.id, item.qty-1)}>-</button>
                      <button onClick={() => updateCartQty(item.id, item.qty+1)}>+</button>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500">x</button>
                      <div>Rp {(item.harga*item.qty).toLocaleString("id-ID")}</div>
                    </div>
                  </div>
                )) : <div>Keranjang kosong</div>}
              </div>
              {cart.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex justify-between font-semibold mb-3">
                    <span>Total</span>
                    <span>Rp {cartTotal.toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className="w-full bg-emerald-500 text-white py-3 rounded-2xl">Lanjut Checkout</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white w-full max-w-[320px] rounded-3xl p-6">
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold">{authMode === "login" ? "Masuk" : "Daftar"}</h3>
                <button onClick={() => setShowAuthModal(false)}><X /></button>
              </div>
              {authMode === "login" ? (
                <>
                  <input type="email" placeholder="Email" className="w-full border rounded-2xl px-4 py-3 mb-3" id="hp-login-email" />
                  <button onClick={() => { const email = (document.getElementById("hp-login-email") as HTMLInputElement).value || "demo@pelanggan.com"; handleLogin(email); }} className="w-full bg-[#041833] text-white py-3 rounded-2xl font-semibold">Masuk</button>
                  <div className="text-center mt-3 text-sm">Belum punya akun? <button onClick={() => setAuthMode("register")} className="text-emerald-600">Daftar</button></div>
                </>
              ) : (
                <>
                  <input type="text" placeholder="Nama" className="w-full border rounded-2xl px-4 py-3 mb-3" id="hp-reg-nama" />
                  <input type="email" placeholder="Email" className="w-full border rounded-2xl px-4 py-3 mb-3" id="hp-reg-email" />
                  <button onClick={() => { const nama = (document.getElementById("hp-reg-nama") as HTMLInputElement).value || "Pelanggan Baru"; const email = (document.getElementById("hp-reg-email") as HTMLInputElement).value || "baru@pelanggan.com"; handleRegister(nama, email); }} className="w-full bg-emerald-500 text-white py-3 rounded-2xl font-semibold">Daftar</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Checkout */}
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[110] bg-white p-4 overflow-auto">
            <div className="max-w-[360px] mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setIsCheckoutOpen(false)}><ArrowLeft size={20} /></button>
                <h3 className="font-semibold text-lg">Checkout</h3>
              </div>

              <div className="space-y-4">
                <div className="border rounded-2xl p-3">
                  <div className="font-medium mb-2">Ringkasan</div>
                  {cart.map((item, i) => <div key={i} className="flex justify-between text-sm"><span>{item.nama} x{item.qty}</span><span>Rp {(item.harga*item.qty).toLocaleString("id-ID")}</span></div>)}
                  <div className="flex justify-between font-semibold mt-2 pt-2 border-t"><span>Total</span><span className="text-emerald-600">Rp {cartTotal.toLocaleString("id-ID")}</span></div>
                </div>

                <div>
                  <div className="text-sm mb-1">Alamat</div>
                  <textarea value={checkoutForm.alamat} onChange={e => setCheckoutForm({...checkoutForm, alamat: e.target.value})} className="w-full border rounded-2xl p-3 text-sm" rows={2} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input value={checkoutForm.kota} onChange={e => setCheckoutForm({...checkoutForm, kota: e.target.value})} placeholder="Kota" className="border rounded-2xl p-3 text-sm" />
                  <input value={checkoutForm.kodePos} onChange={e => setCheckoutForm({...checkoutForm, kodePos: e.target.value})} placeholder="Kode Pos" className="border rounded-2xl p-3 text-sm" />
                </div>

                <div>
                  <div className="text-sm mb-1">Pembayaran</div>
                  <select value={checkoutForm.metodePembayaran} onChange={e => setCheckoutForm({...checkoutForm, metodePembayaran: e.target.value})} className="w-full border rounded-2xl p-3 text-sm">
                    <option>Transfer Bank</option>
                    <option>COD</option>
                  </select>
                </div>

                <button onClick={handleConfirmCheckout} className="w-full py-3 bg-emerald-500 text-white rounded-2xl font-semibold mt-4">Konfirmasi Pesanan</button>
              </div>
            </div>
          </div>
        )}

        {/* Success */}
        {showSuccess && lastOrder && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white w-full max-w-[320px] rounded-3xl p-6 text-center">
              <CheckCircle className="mx-auto text-emerald-500 w-12 h-12 mb-3" />
              <div className="font-semibold">Pesanan Berhasil!</div>
              <div className="text-xs mt-1">{lastOrder.no_so}</div>
              <button onClick={() => {setShowSuccess(false); setLastOrder(null);}} className="mt-4 w-full py-2.5 bg-[#041833] text-white rounded-2xl text-sm">OK</button>
            </div>
          </div>
        )}

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white w-full max-w-[300px] rounded-3xl p-6">
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold">{authMode === "login" ? "Masuk" : "Daftar"}</h3>
                <button onClick={() => setShowAuthModal(false)}><X /></button>
              </div>
              {authMode === "login" ? (
                <>
                  <input type="email" placeholder="Email" className="w-full border rounded-2xl px-4 py-3 mb-3 text-sm" id="hp-login" />
                  <button onClick={() => {const e = (document.getElementById("hp-login") as HTMLInputElement).value || "demo@pelanggan.com"; handleLogin(e);}} className="w-full bg-[#041833] text-white py-3 rounded-2xl text-sm font-semibold">Masuk</button>
                  <div className="text-center mt-3 text-xs">Belum punya akun? <span onClick={() => setAuthMode("register")} className="text-emerald-600">Daftar</span></div>
                </>
              ) : (
                <>
                  <input type="text" placeholder="Nama" className="w-full border rounded-2xl px-4 py-3 mb-3 text-sm" id="hp-reg-nama" />
                  <input type="email" placeholder="Email" className="w-full border rounded-2xl px-4 py-3 mb-3 text-sm" id="hp-reg-email" />
                  <button onClick={() => {const n = (document.getElementById("hp-reg-nama") as HTMLInputElement).value || "Pelanggan Baru"; const e = (document.getElementById("hp-reg-email") as HTMLInputElement).value || "baru@pelanggan.com"; handleRegister(n, e);}} className="w-full bg-emerald-500 text-white py-3 rounded-2xl text-sm font-semibold">Daftar</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
