import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  CalendarDays,
  ChartLine,
  Clock3,
  FileText,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ARTIKEL DIAUF | Insight Bisnis UMKM",
  description:
    "Artikel DIAUF berisi insight keuangan, pajak, dashboard, operasional, dan manajemen UMKM.",
};

const latestNews = [
  "UMKM Mulai Naik Kelas Saat Laporan Keuangan Dibaca Setiap Pekan",
  "Cara Menentukan Harga Jual Tanpa Menebak Margin",
  "Checklist Pajak Bulanan untuk Pemilik Usaha Kecil",
  "Stok Sering Selisih? Mulai dari SOP Barang Masuk dan Keluar",
  "Dashboard Owner Membantu Bisnis Lebih Cepat Ambil Keputusan",
];

const channels = [
  "Keuangan",
  "Pajak",
  "Operasional",
  "SDM",
  "Stok",
  "Dashboard",
  "Konsultasi",
];

const heroArticle = {
  category: "Strategi Bisnis",
  title: "Bisnis Bertumbuh Lebih Sehat Saat Owner Membaca Data, Bukan Hanya Omzet",
  excerpt:
    "Omzet tinggi belum tentu berarti usaha sehat. Pelajari indikator sederhana yang perlu dipantau pemilik usaha agar keputusan operasional lebih terukur.",
  date: "18 Juni 2026",
  readTime: "6 menit baca",
};

const topStories = [
  {
    category: "Pajak UMKM",
    title: "Kapan UMKM Perlu Mulai Merapikan Administrasi Pajak?",
    date: "18 Juni 2026",
  },
  {
    category: "Keuangan",
    title: "Arus Kas Positif Tidak Selalu Berarti Laba Usaha Aman",
    date: "17 Juni 2026",
  },
  {
    category: "Operasional",
    title: "Tiga Kebiasaan Kecil yang Membuat Laporan Bulanan Lebih Cepat",
    date: "17 Juni 2026",
  },
];

const editorialPicks = [
  {
    icon: Calculator,
    category: "Keuangan",
    title: "Cara Membaca Laba Rugi untuk Owner Non-Akuntansi",
    excerpt:
      "Panduan ringan memahami pendapatan, beban, margin, dan titik yang perlu ditanyakan ke tim keuangan.",
  },
  {
    icon: ShieldCheck,
    category: "Pajak",
    title: "Dokumen Pajak yang Sebaiknya Disiapkan Setiap Bulan",
    excerpt:
      "Daftar dokumen dasar agar pelaporan dan pengecekan kewajiban pajak tidak menumpuk di akhir periode.",
  },
  {
    icon: ChartLine,
    category: "Dashboard",
    title: "Indikator Dashboard yang Paling Penting untuk UMKM",
    excerpt:
      "Mulai dari kas, piutang, stok, penjualan, hingga biaya operasional yang perlu dipantau secara rutin.",
  },
  {
    icon: BriefcaseBusiness,
    category: "Operasional",
    title: "SOP Sederhana Agar Data Cabang Tidak Berantakan",
    excerpt:
      "Langkah awal menyamakan format input, validasi transaksi, dan jadwal tutup buku antar cabang.",
  },
];

const popularArticles = [
  "5 Kesalahan Keuangan UMKM yang Sering Tidak Disadari",
  "Cara Menghitung HPP Produksi agar Harga Jual Tidak Rugi",
  "Checklist Tutup Buku Bulanan untuk Bisnis Kecil",
  "Kapan Owner Perlu Pisahkan Uang Pribadi dan Uang Usaha?",
  "Apa Saja Data yang Perlu Ada di Dashboard Bisnis?",
];

const guides = [
  "Template kontrol piutang mingguan",
  "Checklist stok opname sederhana",
  "Format review arus kas bulanan",
  "Daftar dokumen pajak usaha",
];

function Logo() {
  return (
    <a href="/" className="text-3xl font-extrabold tracking-tight text-white">
      DIAUF<span className="text-emerald-400">.ID</span>
    </a>
  );
}

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
          {title}
        </h2>
      </div>
      <a
        href="#"
        className="hidden items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 sm:flex"
      >
        Lihat semua
        <ArrowRight size={16} />
      </a>
    </div>
  );
}

export default function ArtikelDiaufPage() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="border-b border-emerald-500/20 bg-[#06152b] text-white">
        <div className="mx-auto flex h-11 max-w-7xl items-center overflow-hidden px-4 sm:px-6 lg:px-8">
          <div className="mr-4 shrink-0 bg-emerald-500 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-[#06152b]">
            Terbaru
          </div>
          <div className="flex min-w-0 gap-8 whitespace-nowrap text-sm text-slate-200">
            {latestNews.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-emerald-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <header className="bg-[#081120] text-white shadow-[0_12px_30px_rgba(4,24,51,0.22)]">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Logo />
              <div className="mt-3 flex items-center gap-3">
                <div className="bg-emerald-500 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.22em] text-[#081120]">
                  Artikel Diauf
                </div>
                <p className="hidden text-sm text-slate-300 sm:block">
                  Insight bisnis, pajak, dan operasional UMKM
                </p>
              </div>
            </div>

            <div className="hidden w-full max-w-sm items-center gap-2 border border-white/15 bg-white/5 px-4 py-3 md:flex">
              <Search size={18} className="text-slate-400" />
              <input
                aria-label="Cari artikel"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                placeholder="Cari artikel, pajak, HPP, dashboard..."
              />
            </div>

            <button
              className="inline-flex h-11 w-11 items-center justify-center border border-white/15 text-white md:hidden"
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        <nav className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
            {channels.map((channel, index) => (
              <a
                key={channel}
                href="#"
                className={`shrink-0 px-4 py-4 text-sm font-semibold transition ${
                  index === 0
                    ? "bg-emerald-500 text-[#081120]"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                {channel}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.55fr_.85fr] lg:px-8">
        <article className="group grid min-h-[390px] overflow-hidden bg-white shadow-sm md:grid-cols-[1fr_.95fr]">
          <div className="relative flex min-h-[300px] items-end bg-[#081120] p-8 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(16,185,129,0.35),transparent_34%),linear-gradient(135deg,#081120,#13213b)]" />
            <div className="absolute right-8 top-8 flex h-20 w-20 items-center justify-center border border-emerald-400/40 bg-emerald-400/10">
              <BookOpen size={34} className="text-emerald-300" />
            </div>
            <div className="relative">
              <p className="mb-3 inline-flex bg-emerald-500 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-[#081120]">
                {heroArticle.category}
              </p>
              <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight lg:text-[44px]">
                {heroArticle.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-col justify-between p-8">
            <div>
              <div className="mb-5 flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={16} />
                  {heroArticle.date}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 size={16} />
                  {heroArticle.readTime}
                </span>
              </div>
              <p className="text-lg leading-8 text-slate-600">
                {heroArticle.excerpt}
              </p>
            </div>

            <a
              href="#"
              className="mt-8 inline-flex w-fit items-center gap-2 bg-[#081120] px-5 py-3 text-sm font-bold text-white transition group-hover:bg-emerald-600"
            >
              Baca analisis
              <ArrowRight size={17} />
            </a>
          </div>
        </article>

        <aside className="bg-white p-6 shadow-sm">
          <SectionHeader eyebrow="Sorotan" title="Pilihan Redaksi" />
          <div className="space-y-5">
            {topStories.map((story) => (
              <article key={story.title} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                  {story.category}
                </p>
                <h3 className="text-lg font-extrabold leading-snug text-slate-950 hover:text-emerald-700">
                  <a href="#">{story.title}</a>
                </h3>
                <p className="mt-2 text-sm text-slate-500">{story.date}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_330px] lg:px-8">
        <div>
          <SectionHeader eyebrow="Artikel" title="Terbaru dari DIAUF" />
          <div className="grid gap-5 md:grid-cols-2">
            {editorialPicks.map(({ icon: Icon, ...article }) => (
              <article
                key={article.title}
                className="group bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center bg-emerald-50 text-emerald-600">
                    <Icon size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    {article.category}
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-extrabold leading-snug text-slate-950 group-hover:text-emerald-700">
                  <a href="#">{article.title}</a>
                </h3>
                <p className="line-clamp-3 text-sm leading-7 text-slate-600">
                  {article.excerpt}
                </p>
                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-emerald-600">
                  Baca artikel
                  <ArrowRight size={16} />
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white p-6 shadow-sm">
            <SectionHeader eyebrow="Populer" title="Banyak Dibaca" />
            <div className="space-y-4">
              {popularArticles.map((article, index) => (
                <a
                  key={article}
                  href="#"
                  className="grid grid-cols-[34px_1fr] gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                >
                  <span className="text-2xl font-extrabold text-emerald-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-bold leading-snug text-slate-900 hover:text-emerald-700">
                    {article}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-[#081120] p-6 text-white shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center bg-emerald-500 text-[#081120]">
              <Sparkles size={24} />
            </div>
            <h2 className="mb-3 text-2xl font-extrabold leading-tight">
              Butuh sistem yang langsung bisa dipakai?
            </h2>
            <p className="mb-6 text-sm leading-7 text-slate-300">
              Tim DIAUF membantu bisnis membaca data, merapikan operasional,
              dan menyiapkan dashboard owner.
            </p>
            <a
              href="https://wa.me/6281252510441"
              className="inline-flex items-center gap-2 bg-emerald-500 px-5 py-3 text-sm font-bold text-[#081120] hover:bg-emerald-400"
            >
              Konsultasi gratis
              <ArrowRight size={16} />
            </a>
          </div>
        </aside>
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">
              Panduan Praktis
            </p>
            <h2 className="text-3xl font-extrabold leading-tight text-slate-950">
              Bahan kerja singkat untuk owner dan tim operasional.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {guides.map((guide) => (
              <a
                key={guide}
                href="#"
                className="flex items-center justify-between border border-slate-200 px-5 py-4 font-bold text-slate-900 hover:border-emerald-500 hover:text-emerald-700"
              >
                <span className="inline-flex items-center gap-3">
                  <FileText size={18} className="text-emerald-600" />
                  {guide}
                </span>
                <ArrowRight size={16} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#081120] py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 text-sm text-slate-300 sm:px-6 md:flex-row lg:px-8">
          <p>© 2026 ARTIKEL DIAUF. Semua insight disusun untuk UMKM Indonesia.</p>
          <div className="flex items-center gap-2 text-emerald-300">
            <TrendingUp size={16} />
            Data lebih rapi, keputusan lebih pasti.
          </div>
        </div>
      </footer>
    </main>
  );
}
