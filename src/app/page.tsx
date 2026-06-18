"use client";

import { useState } from "react";
import {
  BookOpen,
  Boxes,
  Building2,
  Calculator,
  ChartLine,
  ChartPie,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Percent,
  ReceiptText,
  ShoppingBag,
  Smartphone,
  Users,
  Bot,
  MapPinned,
  Handshake,
  Store,
  Workflow,
} from "lucide-react";

const whatsappUrl = "https://wa.me/6281252510441";

const dashboardFeatures = [
  {
    icon: Smartphone,
    title: "Dashboard Responsif",
    text: "Pantau usaha dari desktop, tablet, atau HP dengan tampilan yang tetap nyaman digunakan.",
  },
  {
    icon: Building2,
    title: "Multi Cabang",
    text: "Gabungkan data seluruh cabang dalam satu dashboard terpusat.",
  },
  {
    icon: Calculator,
    title: "Modul Sesuai Jenis Usaha",
    text: "Sistem DIAUF.ID mengikuti karakter bisnis Anda, bukan memaksa bisnis mengikuti alur software.",
  },
  {
    icon: ChartLine,
    title: "Insight Bisnis",
    text: "Lihat tren penjualan, laba, arus kas dan performa usaha secara realtime.",
  },
];

const modernFeatures = [
  {
    icon: MapPinned,
    title: "GPS Armada",
    text: "Pantau kendaraan operasional, travel, atau armada pengiriman langsung dari dashboard.",
    badge: "Segera Hadir",
  },
  {
    icon: Bot,
    title: "AI Business Insight",
    text: "AI membantu membaca data bisnis dan memberikan insight yang mudah dipahami owner.",
    badge: "Dalam Pengembangan",
  },
  {
    icon: Users,
    title: "Manajemen SDM & Portal Karyawan",
    text: "Kelola data karyawan, absensi, payroll, dan akses mandiri karyawan dalam satu sistem yang terhubung.",
  },
  {
    icon: Boxes,
    title: "Stok & Aset",
    text: "Pantau persediaan barang dan aset perusahaan secara realtime.",
  },
  {
    icon: CreditCard,
    title: "POS Desktop & Mobile",
    text: "Transaksi kasir lebih cepat di toko, booth, maupun lapangan dengan data penjualan yang langsung masuk ke dashboard.",
  },
  {
    icon: Handshake,
    title: "CRM Terintegrasi",
    text: "Kelola prospek, pelanggan, follow up, dan riwayat komunikasi agar peluang penjualan tidak hilang di chat pribadi.",
  },
  {
    icon: ShoppingBag,
    title: "Rental Manajemen",
    text: "Pantau unit, jadwal sewa, pembayaran, deposit, dan status pengembalian dalam satu alur yang rapi.",
  },
  {
    icon: Store,
    title: "Toko Online Terintegrasi",
    text: "Berikan setiap user kanal jualan online yang tersambung dengan stok, harga, pesanan, dan data pelanggan.",
  },
];

const services = [
  {
    icon: BookOpen,
    title: "Pendampingan Seperti Punya CFO Sendiri",
    text: "Tim berpengalaman di bidang akuntansi dan pajak mendampingi penerapan sistem secara online maupun offline, bukan hanya menyerahkan software.",
  },
  {
    icon: ChartPie,
    title: "Satu Dashboard, Laporan Lebih Komprehensif",
    text: "Data keuangan, operasional, stok, pelanggan, dan performa usaha terhubung dalam satu platform agar owner melihat gambaran bisnis secara utuh.",
  },
  {
    icon: Percent,
    title: "Harga All-In yang Lebih Terjangkau",
    text: "DIAUF.ID dibangun agar UMKM juga bisa menikmati sistem dan laporan realtime yang biasanya hanya mudah diakses perusahaan besar.",
  },
  {
    icon: Workflow,
    title: "Flow Simpel, Desain Elegan Minimalis",
    text: "Alur sistem dibuat ringkas dan mudah dipahami, sehingga tim lebih cepat belajar, lebih nyaman memakai, dan lebih konsisten menerapkan.",
  },
];

const comparisons = [
  ["Gaji Rp4-8 juta per bulan", "Mulai Rp1,5 juta per bulan"],
  ["Risiko resign", "Sistem tetap berjalan"],
  ["Harus training karyawan baru", "Tim DIAUF langsung mendampingi"],
  ["Laporan sering terlambat", "Dashboard realtime"],
  ["Belum tentu memahami pajak", "Pendampingan pajak usaha"],
  ["Data tersebar di banyak file", "Satu sistem terintegrasi"],
];

const plans = [
  {
    id: "growth",
    name: "GROWTH",
    price: "Rp1,5 Jt",
    featured: false,
    items: [
      "Input transaksi oleh tim DIAUF",
      "Dashboard bisnis realtime",
      "Monitoring keuangan",
      "Insight bulanan",
      "Review arus kas",
      "Evaluasi hutang & piutang",
      "Support WhatsApp",
      "Kunjungan area Malang Raya",
    ],
  },
  {
    id: "business",
    name: "BUSINESS",
    price: "Rp2 Jt",
    featured: true,
    items: [
      "Semua fitur Growth",
      "Sistem POS",
      "Kelola stok barang",
      "Dashboard operasional",
      "Monitoring persediaan",
      "Pajak UMKM",
      "Multi user",
    ],
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    price: "Rp2,9 Jt",
    featured: false,
    items: [
      "Semua fitur Business",
      "SDM & Payroll",
      "Manajemen aset",
      "Multi cabang",
      "GPS Armada",
      "Kelola Pajak Usaha",
      "Prioritas support",
      "Pendampingan lebih intensif",
    ],
  },
];

const products = [
  {
    name: "DIAUF.ID",
    text: "Portal utama untuk sistem operasional bisnis terintegrasi.",
    logo: "/diauf-product-logo.png",
  },
  {
    name: "DIAUF Humanika",
    text: "Portal khusus SDM dan HRD.",
    logo: "/diauf-humanika-logo.png",
  },
  {
    name: "DIAUF-GO.ID",
    text: "Portal web jualan atau toko online klien.",
    logo: "/diauf-go-logo.png",
  },
  {
    name: "DIAUF RENTAL",
    text: "Portal manajemen rental.",
    logo: "/diauf-rental-logo.png",
  },
  {
    name: "ARTIKEL DIAUF",
    text: "Portal artikel dan bacaan bisnis.",
    logo: "/diauf-artikel-logo.png",
    badge: "Akses Gratis",
  },
  {
    name: "KALKULATOR BISNIS by DIAUF",
    text: "Portal hitung bisnis gratis seperti HPP, pajak, simulasi balik modal, dan lainnya.",
    logo: "/diauf-kalkulator-logo.png",
    badge: "Akses Gratis",
  },
];

const articles = [
  {
    title: "5 Kesalahan Keuangan UMKM",
    text: "Kesalahan yang sering membuat bisnis sulit berkembang meskipun omzet terus naik.",
  },
  {
    title: "Cara Menghitung HPP yang Benar",
    text: "Panduan sederhana menentukan harga pokok produksi agar tidak salah menentukan harga jual.",
  },
  {
    title: "Kapan UMKM Perlu Dashboard Bisnis?",
    text: "Tanda-tanda usaha sudah membutuhkan sistem dan data yang lebih terukur.",
  },
];

function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/diauf-logo.png"
      alt="DIAUF.ID"
      className={`block h-auto object-contain ${className}`}
    />
  );
}

function SectionTitle({
  title,
  text,
}: {
  title: string;
  text?: string;
}) {
  return (
    <div className="mx-auto mb-[60px] max-w-3xl text-center">
      <h2 className="mb-[15px] text-[34px] font-extrabold leading-tight text-slate-900 md:text-[42px]">
        {title}
      </h2>
      {text && <p className="text-base leading-7 text-slate-500">{text}</p>}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  text,
  badge,
}: {
  icon: typeof Smartphone;
  title: string;
  text: string;
  badge?: string;
}) {
  return (
    <div className="relative rounded-[24px] bg-white p-[30px] text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-2 md:p-[35px]">
      {badge && (
        <div className="absolute right-5 top-5 border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
          {badge}
        </div>
      )}
      <Icon className="mx-auto mb-5 h-10 w-10 text-emerald-500" strokeWidth={2.2} />
      <h3 className="mb-3 text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-[15px] leading-7 text-slate-600">{text}</p>
    </div>
  );
}

export default function Home() {
  const [openPlans, setOpenPlans] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const togglePlan = (id: string) => {
    setOpenPlans((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900">
      <header className="fixed left-0 top-0 z-[999] w-full bg-[#081120]/[.92] backdrop-blur-[10px]">
        <div className="mx-auto w-[90%] max-w-[1200px]">
          <nav className="flex h-20 items-center justify-between">
            <a href="#" aria-label="DIAUF.ID" className="inline-flex items-center">
              <Logo className="-ml-4 w-[188px] sm:-ml-5 sm:w-[218px]" />
            </a>

            <div className="hidden items-center gap-7 font-medium text-white md:flex">
              <a className="hover:text-emerald-300" href="#tentang">
                Tentang
              </a>
              <a className="hover:text-emerald-300" href="#layanan">
                Layanan
              </a>
              <a className="hover:text-emerald-300" href="#paket">
                Paket
              </a>
              <a className="hover:text-emerald-300" href="/artikel">
                Artikel
              </a>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-br from-emerald-500 to-emerald-600 px-[22px] py-3 font-bold shadow-[0_10px_25px_rgba(16,185,129,.35)] transition hover:-translate-y-0.5"
              >
                <Lock size={17} />
                Portal Klien
              </a>
            </div>

            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white md:hidden"
              onClick={() => setMobileMenuOpen((value) => !value)}
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>
          </nav>

          {mobileMenuOpen && (
            <div className="space-y-2 border-t border-white/10 py-4 text-white md:hidden">
              {[
                ["Tentang", "#tentang"],
                ["Layanan", "#layanan"],
                ["Paket", "#paket"],
                ["Artikel", "/artikel"],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-3 py-2 hover:bg-white/10"
                >
                  {label}
                </a>
              ))}
              <a
                href="/login"
                className="mt-2 inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-br from-emerald-500 to-emerald-600 px-[22px] py-3 font-bold"
              >
                <Lock size={17} />
                Portal Klien
              </a>
            </div>
          )}
        </div>
      </header>

      <section className="bg-gradient-to-br from-[#081120] to-[#13213b] pb-[90px] pt-[140px] text-white md:pb-[110px] md:pt-[150px]">
        <div className="mx-auto w-[90%] max-w-[1200px]">
          <div className="grid items-center gap-[60px] md:grid-cols-[1.1fr_.9fr]">
            <div>
              <div className="mb-5 inline-block rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-[13px] text-[#8fffe2]">
                SISTEM MANAJEMEN BISNIS UMKM
              </div>

              <h1 className="mb-[25px] max-w-3xl text-[42px] font-extrabold leading-[1.1] tracking-normal md:text-[62px]">
                Kelola Keuangan, Pajak, dan Operasional Usaha dalam Satu Sistem.
              </h1>

              <p className="mb-[35px] max-w-2xl text-lg leading-[1.7] text-slate-300 md:text-xl">
                DIAUF.ID membantu UMKM memiliki sistem yang terintegrasi mulai
                dari keuangan, stok, SDM, aset, armada, hingga pajak dengan
                pendampingan tim profesional.
              </p>

              <div className="mt-[30px] flex flex-wrap gap-[15px]">
                <a
                  href={whatsappUrl}
                  className="inline-flex items-center justify-center rounded-[14px] bg-emerald-500 px-8 py-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600"
                >
                  Konsultasi Gratis
                </a>
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center rounded-[14px] border border-white/20 bg-white/[.08] px-8 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[.15]"
                >
                  Lihat Demo
                </a>
              </div>
            </div>

            <div
              id="demo"
              className="overflow-hidden rounded-[24px] bg-white p-5 shadow-[0_25px_60px_rgba(0,0,0,.25)]"
            >
              <iframe
                className="aspect-video w-full rounded-[18px]"
                src="https://www.youtube.com/embed/P2uOenSRkug"
                title="Video Demo DIAUF.ID"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <section id="layanan" className="scroll-mt-20 py-[100px]">
        <div className="mx-auto w-[90%] max-w-[1200px]">
          <SectionTitle
            title="Kenapa DIAUF.ID Berbeda dengan Platform ERP Serupa?"
            text="DIAUF.ID bukan hanya sistem. Kami menggabungkan teknologi, pendampingan, laporan yang komprehensif, dan alur kerja yang mudah diterapkan untuk UMKM."
          />
          <div className="grid gap-[25px] md:grid-cols-4">
            {services.map((service) => (
              <FeatureCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-[100px]">
        <div className="mx-auto w-[90%] max-w-[1200px]">
          <SectionTitle
            title="Semua Data Bisnis dalam Satu Dashboard"
            text="Tidak hanya pembukuan. Pantau seluruh operasional usaha dalam satu sistem yang saling terhubung."
          />
          <div className="grid gap-[25px] md:grid-cols-4">
            {dashboardFeatures.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-[100px]">
        <div className="mx-auto w-[90%] max-w-[1200px]">
          <SectionTitle
            title="Fitur Modern untuk UMKM yang Bertumbuh"
            text="DIAUF.ID terus berkembang untuk membantu UMKM memiliki sistem yang biasanya hanya dimiliki perusahaan besar."
          />
          <div className="grid gap-[25px] md:grid-cols-4">
            {modernFeatures.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section id="tentang" className="scroll-mt-20 py-[100px]">
        <div className="mx-auto w-[90%] max-w-[1200px]">
          <SectionTitle title="Apa itu DIAUF.ID?" />
          <p className="mx-auto max-w-[900px] text-center text-lg leading-[1.9] text-slate-600">
            Nama DIAUF terinspirasi dari Abdurrahman bin Auf, salah satu sahabat
            Nabi yang dikenal sebagai pebisnis sukses, kaya raya, dan dermawan.
            DIAUF.ID hadir dengan harapan membantu UMKM Indonesia bertumbuh
            lebih cepat melalui sistem yang terukur, data yang jelas, dan
            pendampingan yang nyata. Bukan sekadar software, tetapi mitra yang
            membantu pemilik usaha memahami kondisi bisnisnya, mengambil
            keputusan berdasarkan data, dan membangun fondasi yang siap untuk
            scale up.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-[100px]">
        <div className="mx-auto w-[90%] max-w-[1200px]">
          <SectionTitle
            title="Mengapa Banyak UMKM Beralih ke DIAUF.ID?"
            text="Lebih hemat dibanding merekrut finance internal, namun tetap mendapatkan sistem, dashboard, dan pendampingan profesional."
          />
          <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,.08)]">
            <div className="grid gap-px bg-slate-200 md:grid-cols-2">
              <div className="bg-[#081120] px-7 py-6 text-white md:px-9">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Cara lama
                </p>
                <h3 className="mt-2 text-xl font-bold">Finance Internal</h3>
              </div>
              <div className="bg-[#081120] px-7 py-6 text-white md:px-9">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  Dengan sistem
                </p>
                <h3 className="mt-2 text-xl font-bold">DIAUF.ID</h3>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {comparisons.map(([left, right], index) => (
                <div
                  key={left}
                  className="grid gap-0 transition hover:bg-slate-50 md:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]"
                >
                  <div className="flex items-start gap-4 px-7 py-6 text-slate-600 md:px-9">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-bold text-slate-400">
                      {index + 1}
                    </span>
                    <p className="leading-7">{left}</p>
                  </div>
                  <div className="flex items-start gap-4 border-t border-slate-100 px-7 pb-6 text-slate-900 md:border-l md:border-t-0 md:px-9 md:py-6">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                      ✓
                    </span>
                    <p className="font-semibold leading-7 text-emerald-600">
                      {right}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="paket" className="scroll-mt-20 bg-slate-50 py-[100px]">
        <div className="mx-auto w-[90%] max-w-[1200px]">
          <SectionTitle
            title="Paket Layanan"
            text="Pilih layanan sesuai kebutuhan bisnis Anda."
          />
          <div className="grid gap-[30px] md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-[24px] p-10 shadow-[0_10px_30px_rgba(0,0,0,.06)] ${
                  plan.featured
                    ? "bg-[#081120] text-white md:scale-[1.04]"
                    : "bg-white text-slate-900"
                }`}
              >
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="my-5 text-[50px] font-extrabold leading-tight">
                  {plan.price}
                </div>
                <p className={plan.featured ? "text-slate-300" : "text-slate-500"}>
                  per bulan
                </p>
                <button
                  className="mt-5 font-bold text-emerald-500"
                  onClick={() => togglePlan(plan.id)}
                >
                  {openPlans[plan.id] ? "- Tutup Detail" : "+ Lihat Detail"}
                </button>
                {openPlans[plan.id] && (
                  <ul
                    className={`mt-5 space-y-2.5 border-t pt-5 ${
                      plan.featured ? "border-white/15" : "border-slate-100"
                    }`}
                  >
                    {plan.items.map((item) => (
                      <li key={item} className="leading-7">
                        <span className="text-emerald-500">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-[100px]">
        <div className="mx-auto w-[90%] max-w-[1200px]">
          <SectionTitle
            title="Produk DIAUF.ID"
            text="Ekosistem layanan DIAUF dirancang untuk mengikuti kebutuhan bisnis yang berbeda-beda."
          />
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-3 xl:grid-cols-6">
            {products.map((product) => (
              <div
                key={product.name}
                className="group flex min-h-[210px] flex-col border-t border-slate-200 pt-7 text-center transition hover:-translate-y-1"
              >
                <div className="mb-4 flex h-6 items-center justify-center">
                  {product.badge && (
                    <span className="border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="mb-6 flex h-32 items-center justify-center">
                  <div className="flex w-full items-center justify-center">
                    {product.logo ? (
                      <img
                        src={product.logo}
                        alt={product.name}
                        className="h-auto max-h-32 w-full object-contain transition group-hover:scale-[1.03]"
                      />
                    ) : (
                      <p className="text-[22px] font-extrabold leading-[1.12] text-slate-950 transition group-hover:text-emerald-600">
                        {product.name}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  {product.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="artikel" className="scroll-mt-20 bg-slate-50 py-[100px]">
        <div className="mx-auto w-[90%] max-w-[1200px]">
          <SectionTitle
            title="Artikel Terbaru"
            text="Insight dan edukasi untuk membantu UMKM bertumbuh lebih terarah."
          />
          <div className="grid gap-[25px] md:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.title}
                className="rounded-[24px] bg-white p-[30px] shadow-[0_10px_30px_rgba(0,0,0,.06)]"
              >
                <h3 className="mb-3 text-xl font-bold text-slate-900">
                  {article.title}
                </h3>
                <p className="leading-7 text-slate-600">{article.text}</p>
                <a
                  href="/artikel"
                  className="mt-[15px] inline-block font-bold text-emerald-500"
                >
                  Baca Artikel -&gt;
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#081120] to-[#13213b] py-[100px] text-center text-white">
        <div className="mx-auto w-[90%] max-w-[850px]">
          <h2 className="mb-5 text-[38px] font-extrabold leading-[1.2] md:text-[52px]">
            Saatnya Mengelola Bisnis Berdasarkan Data, Bukan Perasaan.
          </h2>
          <p className="mx-auto mb-[35px] max-w-[700px] text-lg leading-8 text-slate-300">
            Dapatkan sistem manajemen bisnis yang terintegrasi dan didampingi
            langsung oleh tim DIAUF.ID.
          </p>
          <a
            href={whatsappUrl}
            className="inline-flex items-center justify-center rounded-[14px] bg-emerald-500 px-8 py-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600"
          >
            Konsultasi Gratis
          </a>
        </div>
      </section>

      <footer className="bg-[#081120] pb-[30px] pt-20 text-slate-300">
        <div className="mx-auto w-[90%] max-w-[1200px]">
          <div className="grid gap-[50px] md:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <Logo className="mb-[18px] w-[220px]" />
              <p className="mb-3 max-w-[420px] leading-8">
                Kelola Keuangan, Pajak, dan Operasional Usaha dalam Satu
                Sistem.
              </p>
              <p className="mb-3 max-w-[420px] leading-8">
                Sistem manajemen bisnis UMKM yang didampingi tim profesional.
              </p>
            </div>

            <div>
              <h4 className="mb-5 font-bold text-white">Menu</h4>
              <a className="mb-3 block hover:text-emerald-500" href="#tentang">
                Tentang DIAUF.ID
              </a>
              <a className="mb-3 block hover:text-emerald-500" href="#layanan">
                Layanan
              </a>
              <a className="mb-3 block hover:text-emerald-500" href="#paket">
                Paket
              </a>
              <a className="mb-3 block hover:text-emerald-500" href="/artikel">
                Artikel
              </a>
            </div>

            <div>
              <h4 className="mb-5 font-bold text-white">Fitur Unggulan</h4>
              <a className="mb-3 block hover:text-emerald-500" href="#demo">
                Dashboard Responsif
              </a>
              <a className="mb-3 block hover:text-emerald-500" href="#demo">
                Multi Cabang
              </a>
              <a className="mb-3 block hover:text-emerald-500" href="#demo">
                GPS Armada
              </a>
              <a className="mb-3 block hover:text-emerald-500" href="#demo">
                AI Insight (Soon)
              </a>
            </div>

            <div>
              <h4 className="mb-5 font-bold text-white">Hubungi Kami</h4>
              <p className="mb-3 flex items-center gap-2.5">
                <Phone className="h-[18px] w-[18px] text-emerald-500" />
                0812-5251-0441
              </p>
              <p className="mb-3 flex items-center gap-2.5">
                <Mail className="h-[18px] w-[18px] text-emerald-500" />
                info@diauf.id
              </p>
              <p className="mb-3 flex items-center gap-2.5">
                <MapPin className="h-[18px] w-[18px] text-emerald-500" />
                Malang, Jawa Timur
              </p>
            </div>
          </div>

          <div className="mt-[50px] flex flex-wrap items-center justify-between gap-[15px] border-t border-white/[.08] pt-[25px] text-sm">
            <p>© 2026 DIAUF.ID. All Rights Reserved.</p>
            <p>Dibangun untuk membantu UMKM Indonesia tumbuh lebih terukur.</p>
          </div>
        </div>
      </footer>

      <a
        className="fixed bottom-5 right-5 z-[9999] flex h-14 w-14 items-center justify-center gap-2.5 rounded-full bg-[#25D366] font-semibold text-white shadow-[0_12px_30px_rgba(37,211,102,.35)] transition hover:-translate-y-0.5 sm:h-auto sm:w-auto sm:px-[22px] sm:py-3.5"
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle size={22} />
        <span className="hidden sm:inline">Konsultasi Gratis</span>
      </a>
    </main>
  );
}
