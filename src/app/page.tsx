"use client";

import { useState } from "react";
import {
  BookOpen,
  Boxes,
  Building2,
  Calculator,
  ChartLine,
  ChartPie,
  Lock,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ReceiptText,
  Smartphone,
  Users,
  Bot,
  MapPinned,
} from "lucide-react";

const whatsappUrl = "https://wa.me/6281252510441";

const dashboardFeatures = [
  {
    icon: Smartphone,
    title: "Dashboard Owner",
    text: "Pantau usaha langsung dari HP kapan saja dengan tampilan yang mudah dipahami.",
  },
  {
    icon: Building2,
    title: "Multi Cabang",
    text: "Gabungkan data seluruh cabang dalam satu dashboard terpusat.",
  },
  {
    icon: Calculator,
    title: "HPP Produksi",
    text: "Hitung biaya produksi dan margin usaha dengan metode yang sesuai bisnis Anda.",
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
    note: "Soon Available",
  },
  {
    icon: Bot,
    title: "AI Business Insight",
    text: "AI membantu membaca data bisnis dan memberikan insight yang mudah dipahami owner.",
    note: "Roadmap",
  },
  {
    icon: Users,
    title: "SDM & Payroll",
    text: "Kelola absensi, penggajian, dan data karyawan dalam satu sistem.",
  },
  {
    icon: Boxes,
    title: "Stok & Aset",
    text: "Pantau persediaan barang dan aset perusahaan secara realtime.",
  },
];

const services = [
  {
    icon: BookOpen,
    title: "Pembukuan",
    text: "Pencatatan transaksi dan laporan keuangan yang rapi dan mudah dipahami.",
  },
  {
    icon: ChartPie,
    title: "Dashboard Bisnis",
    text: "Pantau omzet, laba, kas, hutang, piutang dan performa usaha.",
  },
  {
    icon: Users,
    title: "SDM & Payroll",
    text: "Kelola data karyawan, absensi dan penggajian.",
  },
  {
    icon: ReceiptText,
    title: "Pajak Usaha",
    text: "Pendampingan kepatuhan pajak dan administrasi perpajakan usaha.",
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
    <div className={`font-extrabold tracking-tight text-white ${className}`}>
      DIAUF<span className="text-emerald-500">.ID</span>
    </div>
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
  note,
}: {
  icon: typeof Smartphone;
  title: string;
  text: string;
  note?: string;
}) {
  return (
    <div className="rounded-[24px] bg-white p-[30px] text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-2 md:p-[35px]">
      <Icon className="mx-auto mb-5 h-10 w-10 text-emerald-500" strokeWidth={2.2} />
      <h3 className="mb-3 text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-[15px] leading-7 text-slate-600">{text}</p>
      {note && <p className="mt-2.5 font-semibold text-emerald-500">{note}</p>}
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
            <a href="#" aria-label="DIAUF.ID">
              <Logo className="text-[30px]" />
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
          <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_10px_30px_rgba(0,0,0,.06)]">
            <div className="grid bg-[#081120] font-bold text-white md:grid-cols-2">
              <div className="p-6 text-center">Finance Internal</div>
              <div className="p-6 text-center">DIAUF.ID</div>
            </div>
            {comparisons.map(([left, right]) => (
              <div
                key={left}
                className="grid border-b border-slate-100 last:border-b-0 md:grid-cols-2"
              >
                <div className="p-[22px] text-slate-700">{left}</div>
                <div className="p-[22px] font-semibold text-emerald-500">
                  {right}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="layanan" className="scroll-mt-20 py-[100px]">
        <div className="mx-auto w-[90%] max-w-[1200px]">
          <SectionTitle
            title="Layanan DIAUF.ID"
            text="Dirancang untuk membantu owner memahami bisnisnya tanpa harus tenggelam dalam data yang rumit."
          />
          <div className="grid gap-[25px] md:grid-cols-4">
            {services.map((service) => (
              <FeatureCard key={service.title} {...service} />
            ))}
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
              <Logo className="mb-[18px] text-[32px]" />
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
                Dashboard Owner
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
