"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "../component/Sidebar";

import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Bell,
  Building2,
  UserCircle2,
  CircleAlert,
  TriangleAlert,
  Info,
  Wallet,
  CreditCard,
  Package,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const [showExpenseDetail, setShowExpenseDetail] = useState(false);
  const [showSalesDetail, setShowSalesDetail] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Interactive operational expenses data
  const [expenses, setExpenses] = useState([
    { id: 1, name: 'Gaji', amount: 19 },
    { id: 2, name: 'Sewa', amount: 9 },
    { id: 3, name: 'BBM', amount: 7 },
    { id: 4, name: 'Listrik', amount: 6 },
    { id: 5, name: 'Lainnya', amount: 6.5 },
  ]);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budget = 50;
  const expensePercent = Math.round((totalExpense / budget) * 100);

  const updateExpense = (id: number, delta: number) => {
    setExpenses(prev =>
      prev.map(e =>
        e.id === id
          ? { ...e, amount: Math.max(0, Math.min(25, e.amount + delta)) } // cap per item for demo
          : e
      )
    );
  };

  const randomizeExpenses = () => {
    setExpenses(prev =>
      prev.map(e => ({
        ...e,
        amount: Math.round((Math.random() * 15 + 3) * 10) / 10, // 3-18 range
      }))
    );
  };
  const [profile, setProfile] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [timePeriod, setTimePeriod] = useState('Bulan Ini');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const isConsultant = !profile?.role || 
    profile.role.toLowerCase().includes('konsultan') || 
    profile.role.toLowerCase().includes('master');

  // Interactive Business Health Score - Professional Speedometer style
  const [healthScore, setHealthScore] = useState(82);

  // Animated score for needle entrance animation (starts at 0, then swings to target on mount)
  const [animatedHealthScore, setAnimatedHealthScore] = useState(0);

  const animateToScore = (newScore: number) => {
    setHealthScore(newScore);
    setAnimatedHealthScore(0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimatedHealthScore(newScore);
      });
    });
  };

  const reAnimate = () => {
    setAnimatedHealthScore(0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimatedHealthScore(healthScore);
      });
    });
  };

  useEffect(() => {
    // Small delay so the first render has needle at 0, then animate in
    const timer = setTimeout(() => {
      setAnimatedHealthScore(healthScore);
    }, 80);
    return () => clearTimeout(timer);
  }, [healthScore]); // re-triggers when "Simulasi" changes the score
  
useEffect(() => {
  const loadCompany = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profileData } =
      await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

    if (!profileData?.company_id) return;

    const { data: companyData } =
      await supabase
        .from("companies")
        .select("company_name")
        .eq("id", profileData.company_id)
        .single();

    setCompany(companyData);

    const { data: profileDataFull } =
  await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

setProfile(profileDataFull);
  };

  loadCompany();
}, []);

  // Live date & time - minimalist realtime
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      // Format elegan minimalis: hari singkat + tanggal + waktu realtime
      const dateStr = now.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      setCurrentDateTime(`${dateStr} • ${timeStr} WIB`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 30000); // update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
  <Sidebar
  collapsed={collapsed}
  setCollapsed={setCollapsed}
  currentRole={profile?.role}
/>



  <main
  className={`
    px-8 pb-8 pt-2
    transition-all
    duration-300
    ${collapsed ? "ml-24" : "ml-72"}
  `}
>

{/* DIAUF Premium Header - Sticky/Fixed at top so info bisnis, filter, and akun stay visible while scrolling the dashboard content below */}
<div className="sticky top-0 z-50 mb-4">
  <div className="rounded-3xl bg-white p-4 shadow-sm border border-slate-200">

  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

    {/* Company Info - lebih compact */}
    <div className="flex items-center gap-3">

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
        <Building2
          size={22}
          className="text-[#041833]"
        />
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {selectedClient || company?.company_name || "DIAUF"}
        </h1>

        {/* Minimalis elegan: subtitle + realtime date/time dalam satu baris */}
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
          <span>Dashboard Bisnis</span>
          <span className="text-slate-300">•</span>
          <span className="font-medium text-slate-400 tabular-nums tracking-[0.5px]">
            {currentDateTime || 'Memuat...'}
          </span>
        </div>
      </div>

    </div>

    {/* Right Side */}
    <div className="flex flex-wrap items-center gap-3">

      {/* Filter Pindah Klien - khusus untuk Konsultan agar mudah switch antar akun klien */}
      {isConsultant && (
        <select 
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 font-medium"
        >
          <option value="">Pindah Klien</option>
          <option value="PT ABC Indonesia">PT ABC Indonesia</option>
          <option value="CV Maju Jaya">CV Maju Jaya</option>
          <option value="PT Nusantara Sejahtera">PT Nusantara Sejahtera</option>
          <option value="PT Mapan Bersama">PT Mapan Bersama</option>
        </select>
      )}

      <select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
        <option>Semua Cabang</option>
        <option>Kantor Pusat</option>
        <option>Cabang Jakarta</option>
        <option>Cabang Bandung</option>
      </select>

      <select 
        value={timePeriod}
        onChange={(e) => {
          const val = e.target.value;
          setTimePeriod(val);
          if (val === 'custom' && !customStartDate) {
            // Auto isi default 7 hari terakhir saat pertama kali pilih custom
            const today = new Date();
            const start = new Date(today);
            start.setDate(today.getDate() - 7);
            setCustomStartDate(start.toISOString().split('T')[0]);
            setCustomEndDate(today.toISOString().split('T')[0]);
          }
          if (val !== 'custom') {
            setCustomStartDate('');
            setCustomEndDate('');
          }
        }}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
      >
        <option>Bulan Ini</option>
        <option>Hari Ini</option>
        <option>30 Hari</option>
        <option>90 Hari</option>
        <option>Tahun Ini</option>
        <option value="custom">Custom</option>
      </select>

      {/* Custom date range - muncul hanya kalau pilih Custom */}
      {timePeriod === 'custom' && (
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={customStartDate} 
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700"
          />
          <span className="text-xs text-slate-400">sampai</span>
          <input 
            type="date" 
            value={customEndDate} 
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700"
          />
        </div>
      )}

      {/* Notification */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="
            relative
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-slate-300
            bg-white
            transition
            hover:bg-slate-50
          "
        >
          <Bell
            size={18}
            className="text-slate-700"
          />

          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              h-4
              w-4
              items-center
              justify-center
              rounded-full
              bg-red-500
              text-[10px]
              font-bold
              text-white
            "
          >
            7
          </span>
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-lg z-50 overflow-hidden text-sm">
            <div className="px-4 py-3 border-b bg-slate-50 flex justify-between items-center">
              <span className="font-semibold text-[#0f172a]">Notifikasi</span>
              <button onClick={() => setShowNotifications(false)} className="text-xs text-[#475569] hover:text-[#0f172a]">Tutup</button>
            </div>

            <div className="max-h-[280px] overflow-y-auto divide-y">
              {/* Dummy notifications */}
              <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                <div className="flex justify-between">
                  <span className="font-medium text-[#0f172a]">Pembayaran diterima</span>
                  <span className="text-[10px] text-emerald-600">Baru</span>
                </div>
                <p className="text-xs text-[#475569] mt-0.5 line-clamp-2">Invoice #INV-2026-042 dari CV Maju Jaya telah lunas sebesar Rp 28 Jt.</p>
                <p className="text-[10px] text-[#64748b] mt-1">2 menit lalu</p>
              </div>

              <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                <div className="flex justify-between">
                  <span className="font-medium text-[#0f172a]">Stok persediaan rendah</span>
                </div>
                <p className="text-xs text-[#475569] mt-0.5 line-clamp-2">Tepung Premium tersisa 12 sak. Segera lakukan pembelian ulang.</p>
                <p className="text-[10px] text-[#64748b] mt-1">1 jam lalu</p>
              </div>

              <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                <div className="flex justify-between">
                  <span className="font-medium text-[#0f172a]">Laporan bulanan tersedia</span>
                </div>
                <p className="text-xs text-[#475569] mt-0.5 line-clamp-2">Laporan keuangan Mei 2026 sudah siap diunduh di modul Laporan.</p>
                <p className="text-[10px] text-[#64748b] mt-1">Kemarin</p>
              </div>

              <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                <div className="flex justify-between">
                  <span className="font-medium text-[#0f172a]">PO disetujui</span>
                </div>
                <p className="text-xs text-[#475569] mt-0.5 line-clamp-2">Purchase Order #PO-058 untuk supplier PT Sukses Abadi telah disetujui.</p>
                <p className="text-[10px] text-[#64748b] mt-1">2 hari lalu</p>
              </div>
            </div>

            <div className="p-3 border-t bg-slate-50 text-center">
              <button className="text-xs text-emerald-600 hover:underline font-medium">Tandai semua sebagai dibaca</button>
            </div>
          </div>
        )}
      </div>

      {/* User Profile - lebih compact */}
      <div
  onClick={() =>
    setShowUserMenu(!showUserMenu)
  }
  className="
    relative
    flex
    cursor-pointer
    items-center
    gap-2
    rounded-xl
    border
    border-slate-300
    bg-white
    px-3
    py-1.5
  "
>
        <UserCircle2
          size={24}
          className="text-slate-600"
        />

        <div>
          <p className="text-sm font-semibold text-slate-900">
  {profile?.full_name || "User"}
</p>

<p className="text-xs text-slate-500">
  {profile?.role || "Role"}
  </p>
</div>

{showUserMenu && (
    <div
      className="
        absolute
        right-0
        top-full
        z-50
        mt-2
        w-48
        rounded-xl
        border
        border-slate-200
        bg-white
        shadow-lg
      "
    >
      <button
        onClick={() => router.push('/akun-saya')}
        className="
          w-full
          px-4
          py-3
          text-left
          text-sm
          text-slate-700
          hover:bg-slate-50
        "
      >
        Akun Saya
      </button>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/login");
        }}
        className="
          w-full
          px-4
          py-3
          text-left
          text-sm
          text-red-600
          hover:bg-red-50
        "
      >
        Logout
      </button>
    </div>
  )}

</div>

    </div>

  </div>

</div>
</div>

        <div className="grid gap-6 lg:grid-cols-3 mb-6">

          {/* Kesehatan Bisnis - Ultra Precise Premium Gauge */}
          <div className="rounded-2xl bg-white p-8 shadow-[0_20px_25px_-5px_rgb(0,0,0,0.1),0_8px_10px_-6px_rgb(0,0,0,0.1)] border border-slate-100">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-semibold text-[#0f172a] tracking-[-0.3px]">Kesehatan Bisnis</h3>
                <p className="text-[11px] text-[#475569] mt-0.5">Overall performance score</p>
              </div>
              <div className="flex items-center gap-1">
                {[30, 55, 70, 100].map((score) => (
                  <button
                    key={score}
                    onClick={() => animateToScore(score)}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-lg border border-slate-200 text-[#0f172a] hover:bg-slate-50 transition"
                  >
                    {score}
                  </button>
                ))}
                <button
                  onClick={reAnimate}
                  className="text-xs font-medium px-4 py-1.5 rounded-xl border border-slate-200 text-[#0f172a] hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <RefreshCw size={13} /> Re-animate
                </button>
              </div>
            </div>

            {/* Precise Gauge */}
            <div className="flex justify-center mb-2">
              <div style={{ width: 240, height: 148 }}>
                <svg width="240" height="148" viewBox="0 0 240 148" className="overflow-visible">
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="30%" stopColor="#f59e0b" />
                      <stop offset="55%" stopColor="#facc15" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>

                  {/* Background track - thinner, cleaner */}
                  <path
                    d="M 32 122 A 88 88 0 0 1 208 122"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="22"
                    strokeLinecap="butt"
                  />

                  {/* Colored arc - elegant thickness, precise gradient */}
                  <path
                    d="M 32 122 A 88 88 0 0 1 208 122"
                    fill="none"
                    stroke="url(#gaugeGrad)"
                    strokeWidth="22"
                    strokeLinecap="butt"
                  />

                  {/* Needle - rotation based for super smooth swing like Recharts pie */}
                  {(() => {
                    const score = animatedHealthScore;
                    // Rotation: -90deg for 0 (left/red) to +90deg for 100 (right/green)
                    const rotation = -90 + (score / 100) * 180;
                    return (
                      <g 
                        style={{ 
                          transform: `rotate(${rotation}deg)`,
                          transformOrigin: '120px 122px',
                          transition: 'transform 900ms cubic-bezier(0.25, 0.1, 0.25, 1)'
                        }}
                      >
                        {/* Needle body pointing "up" in local space (rotates to arc) */}
                        <line 
                          x1="120" y1="122" 
                          x2="120" y2="34" 
                          stroke="#0f172a" 
                          strokeWidth="4.5" 
                          strokeLinecap="round" 
                        />
                        {/* Pivot */}
                        <circle cx="120" cy="122" r="9" fill="#0f172a" />
                        <circle cx="120" cy="122" r="5" fill="#f8fafc" />
                        {/* Tip - lands on the arc */}
                        <circle cx="120" cy="34" r="5" fill="#0f172a" />
                        <circle cx="120" cy="34" r="2" fill="#10b981" />
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* Score placed below the needle (above BAIK) - slightly smaller */}
            <div className="flex justify-center -mt-2 mb-1">
              <div className="flex items-baseline">
                <span className="text-[42px] font-semibold tracking-[-1.5px] text-[#0f172a] tabular-nums leading-none">
                  {healthScore}
                </span>
                <span className="text-xs font-medium text-[#64748b] ml-1 tracking-[-0.2px]">
                  /100
                </span>
              </div>
            </div>

            {/* Dynamic Status Label - adjusts based on score, color matches the gauge gradient */}
            {(() => {
              let statusText = 'PERLU PERHATIAN';
              let statusColor = '#ef4444'; // red for low
              if (healthScore >= 85) {
                statusText = 'SANGAT BAIK';
                statusColor = '#10b981'; // emerald
              } else if (healthScore >= 70) {
                statusText = 'BAIK';
                statusColor = '#10b981'; // emerald
              } else if (healthScore >= 55) {
                statusText = 'CUKUP';
                statusColor = '#facc15'; // yellow
              }
              return (
                <div className="flex justify-center mb-6">
                  <span 
                    className="text-sm font-semibold tracking-[0.5px]" 
                    style={{ color: statusColor }}
                  >
                    {statusText}
                  </span>
                </div>
              );
            })()}

            {/* 4 Metrics - horizontal, clean, dark text, mini bars with matching gradient */}
            <div className="grid grid-cols-4 gap-x-6">
              {[
                { label: "Profit", value: 88 },
                { label: "Likuiditas", value: 73 },
                { label: "Growth", value: 85 },
                { label: "Efisiensi", value: 78 },
              ].map((metric, index) => (
                <div key={index} className="flex flex-col">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-xs font-medium text-[#0f172a]">{metric.label}</span>
                    <span className="text-base font-semibold tabular-nums text-[#0f172a]">{metric.value}</span>
                  </div>
                  <div className="h-[3.5px] bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#ef4444] via-[#facc15] to-[#10b981] transition-all duration-700"
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">

            {/* Cash Flow - more elegant */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.5px] text-slate-600 font-medium">Cash Flow Bulan Ini</p>
                  <h3 className="mt-1 text-3xl font-semibold text-slate-900 tracking-tight">+ Rp 18 Jt</h3>
                </div>
                <div className="text-emerald-600">
                  <TrendingUp size={20} />
                </div>
              </div>

              <div className="mt-5 space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Kas Masuk</span>
                  <span className="font-semibold text-emerald-700">Rp 125 Jt</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Kas Keluar</span>
                  <span className="font-semibold text-red-600">Rp 107 Jt</span>
                </div>
                <div className="pt-1 border-t border-slate-100 flex justify-between text-xs">
                  <span className="text-slate-600">Net positif</span>
                  <span className="font-medium text-emerald-600">+ Rp 18 Jt</span>
                </div>
              </div>
            </div>

            {/* Beban Operasional - now fully interactive */}
            <div 
              onClick={() => setShowExpenseDetail(true)}
              className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.5px] text-[#0f172a] font-medium">Beban Operasional</p>
                  <h3 className="mt-1 text-3xl font-semibold text-[#0f172a] tracking-tight">Rp {totalExpense} Jt</h3>
                </div>
                <div className="text-emerald-600 group-hover:rotate-12 transition">
                  <TrendingDown size={20} />
                </div>
              </div>

              <p className="mt-1 text-sm text-emerald-700">{expensePercent}% dari budget bulan ini</p>

              <div className="mt-5">
                <div className="h-2.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: `${expensePercent}%` }} />
                </div>
                <div className="flex justify-between text-xs mt-1.5 text-[#475569]">
                  <span>Budget Rp {budget} Jt</span>
                  <span className="font-medium text-[#0f172a]">{expensePercent}%</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-emerald-700 group-hover:underline flex items-center gap-1">
                Klik untuk rincian & edit → 
                <button 
                  onClick={(e) => { e.stopPropagation(); randomizeExpenses(); }}
                  className="px-2 py-0.5 text-[10px] rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                >
                  Randomize
                </button>
              </div>
            </div>

</div>

        </div>

        {/* KPI - more premium cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
          <div
            onClick={() => setShowSalesDetail(true)}
            className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-600 font-medium tracking-wide">OMZET PENJUALAN</p>
                <div className="text-3xl font-semibold text-slate-900 tabular-nums tracking-tight mt-1">Rp 285 Jt</div>
              </div>
              <div className="text-emerald-600 group-hover:scale-110 transition"><TrendingUp size={18} /></div>
            </div>
            <div className="mt-2 text-emerald-700 text-sm font-medium flex items-center gap-1">+12% dari bulan lalu</div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-600 font-medium tracking-wide">SALDO KAS</p>
                <div className="text-3xl font-semibold text-slate-900 tabular-nums tracking-tight mt-1">Rp 96 Jt</div>
              </div>
              <div className="text-red-600"><TrendingDown size={18} /></div>
            </div>
            <div className="mt-2 text-red-600 text-sm font-medium">-3% dari bulan lalu</div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-600 font-medium tracking-wide">PIUTANG USAHA</p>
                <div className="text-3xl font-semibold text-slate-900 tabular-nums tracking-tight mt-1">Rp 43 Jt</div>
              </div>
            </div>
            <div className="mt-2 text-amber-700 text-sm font-medium">28 pelanggan aktif</div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-600 font-medium tracking-wide">HUTANG USAHA</p>
                <div className="text-3xl font-semibold text-slate-900 tabular-nums tracking-tight mt-1">Rp 21 Jt</div>
              </div>
            </div>
            <div className="mt-2 text-emerald-700 text-sm font-medium">Dalam kendali</div>
          </div>
        </div>

        {/* Grafik Penjualan - Real chart with Recharts */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 tracking-tight">Tren Penjualan</h3>
              <p className="text-xs text-slate-600">Dalam miliar Rupiah</p>
            </div>
            <select className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700">
              <option>6 Bulan Terakhir</option>
              <option>30 Hari</option>
              <option>90 Hari</option>
            </select>
          </div>

          <div className="h-64 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { bulan: 'Jan', nilai: 245 },
                { bulan: 'Feb', nilai: 268 },
                { bulan: 'Mar', nilai: 312 },
                { bulan: 'Apr', nilai: 289 },
                { bulan: 'Mei', nilai: 335 },
                { bulan: 'Jun', nilai: 298 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bulan" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickFormatter={(v) => v + ' jt'} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [`Rp ${value} Jt`, 'Penjualan']} 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                />
                <Line 
                  type="natural" 
                  dataKey="nilai" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6, fill: '#059669' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-1">Naik 12% dibanding periode sebelumnya</div>
        </div>

        {/* Row - Refined bank & team overview */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 tracking-tight mb-4">Posisi Kas & Bank</h3>

            <div className="space-y-2.5 text-sm">
              {[
                { name: 'Kas Besar', amount: 'Rp 40 Jt' },
                { name: 'Kas Kecil', amount: 'Rp 5 Jt' },
                { name: 'BCA', amount: 'Rp 31 Jt' },
                { name: 'Mandiri', amount: 'Rp 20 Jt' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
              <Users size={18} className="text-slate-700" /> Tim & Kehadiran
            </h3>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-2xl font-semibold text-slate-900 tabular-nums">32</div>
                <div className="text-xs text-slate-600">Karyawan Aktif</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-emerald-700 tabular-nums">29</div>
                <div className="text-xs text-slate-600">Hadir Hari Ini</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-amber-600 tabular-nums">3</div>
                <div className="text-xs text-slate-600">Belum Absen</div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom - Professional lists */}
        <div className="grid gap-6 lg:grid-cols-3">

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 tracking-tight mb-4">Top Customer</h3>
            <ol className="space-y-2 text-sm">
              {['PT ABC', 'CV Maju', 'PT XYZ', 'PT Nusantara', 'PT Mapan'].map((c, i) => (
                <li key={i} className="flex justify-between py-1 border-b border-slate-100 last:border-none">
                  <span className="text-slate-700">{i+1}. {c}</span>
                  <span className="text-emerald-700 font-medium text-xs">⭐</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 tracking-tight mb-4">Top Produk</h3>
            <ol className="space-y-2 text-sm">
              {['Tepung Premium', 'Roti Sobek', 'Donat', 'Croissant', 'Kopi Susu'].map((p, i) => (
                <li key={i} className="flex justify-between py-1 border-b border-slate-100 last:border-none">
                  <span className="text-slate-700">{i+1}. {p}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 tracking-tight mb-4">Persediaan Kritis</h3>

            <div className="space-y-2.5 text-sm">
              {[
                { item: 'Tepung', days: 3 },
                { item: 'Gula', days: 5 },
                { item: 'Mentega', days: 7 },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <span className="text-amber-700">{s.item}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">{s.days} hari</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => alert('Fitur Buat PO akan terhubung ke modul Pembelian')}
              className="mt-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 py-2.5 text-sm text-white font-semibold transition"
            >
              Buat Purchase Order
            </button>
          </div>

        </div>
{showExpenseDetail && (
  <div
    className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/40
      backdrop-blur-sm
    "
    onClick={() => setShowExpenseDetail(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="
        w-full
        max-w-lg
        rounded-3xl
        bg-white
        p-8
        shadow-xl
        border border-slate-100
      "
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#0f172a]">
          Rincian Beban Operasional
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={randomizeExpenses}
            className="text-xs px-3 py-1 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition"
          >
            Randomize
          </button>
          <button
            onClick={() => setShowExpenseDetail(false)}
            className="text-[#0f172a] hover:text-slate-500 transition text-lg leading-none"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Interactive Donut using conic-gradient */}
      <div className="flex justify-center mb-6">
        <div className="relative h-48 w-48">
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: (() => {
                let cumulative = 0;
                const stops = expenses.map((e, i) => {
                  const pct = (e.amount / totalExpense) * 100;
                  const start = cumulative;
                  cumulative += pct;
                  const color = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'][i % 5];
                  return `${color} ${start}% ${cumulative}%`;
                }).join(', ');
                return `conic-gradient(${stops})`;
              })()
            }}
          />
          <div className="absolute inset-[26px] bg-white rounded-full flex flex-col items-center justify-center border border-slate-100">
            <span className="text-xs text-[#475569]">Total</span>
            <span className="font-bold text-2xl text-[#0f172a] tabular-nums">Rp {totalExpense} Jt</span>
            <span className="text-xs text-emerald-700 font-medium">{expensePercent}% dari budget</span>
          </div>
        </div>
      </div>

      {/* Interactive expense list */}
      <div className="space-y-2 text-sm mb-6">
        {expenses.map((expense) => {
          const pct = totalExpense > 0 ? Math.round((expense.amount / totalExpense) * 100) : 0;
          return (
            <div 
              key={expense.id} 
              className="flex justify-between items-center p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group"
            >
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium text-[#0f172a]">{expense.name}</span>
                  <span className="font-semibold text-[#0f172a] tabular-nums">Rp {expense.amount} Jt</span>
                </div>
                <div className="mt-1 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>

              {/* Interactive controls */}
              <div className="flex items-center gap-1 ml-3 opacity-70 group-hover:opacity-100 transition">
                <button 
                  onClick={() => updateExpense(expense.id, -1)}
                  className="w-6 h-6 flex items-center justify-center text-lg leading-none border border-slate-200 rounded hover:bg-red-50 hover:text-red-600 active:scale-95 transition"
                >
                  –
                </button>
                <button 
                  onClick={() => updateExpense(expense.id, +1)}
                  className="w-6 h-6 flex items-center justify-center text-lg leading-none border border-slate-200 rounded hover:bg-emerald-50 hover:text-emerald-600 active:scale-95 transition"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-[#475569] border-t pt-4">
        Total Beban: <span className="font-semibold text-[#0f172a]">Rp {totalExpense} Jt</span> / Budget Rp {budget} Jt 
        <span className="ml-2 text-emerald-700">({expensePercent}%)</span>
        <br />
        <span className="text-[10px]">Klik + / – pada setiap item untuk mengubah (demo). Klik di luar untuk tutup.</span>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
}