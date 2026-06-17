"use client";

import Link from "next/link";
import { Users, DollarSign, Calendar, Award, ArrowLeft, ExternalLink } from "lucide-react";

export default function DiaufHumanikaPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation - Navy Theme */}
      <nav className="bg-[#041833] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">DH</span>
              </div>
              <div>
                <div className="font-bold text-xl tracking-tight">DIAUF Humanika</div>
                <div className="text-[10px] text-slate-400 -mt-1">by DIAUF ID</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/sdm" 
              className="text-sm px-4 py-2 rounded-xl border border-white/30 hover:bg-white/10 transition flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Kembali ke Platform
            </Link>

            {/* Tombol ke Portal Karyawan (mobile demo) - buka di tab baru */}
            <Link 
              href="/humanika-karyawan" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 rounded-xl bg-white text-[#041833] hover:bg-emerald-100 transition flex items-center gap-2 font-medium"
            >
              <ExternalLink size={16} />
              Portal Karyawan
            </Link>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-medium">
                AD
              </div>
              <span>Admin Demo</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero / Header */}
      <div className="bg-[#041833] text-white pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-emerald-400 text-xs font-medium px-3 py-1 rounded-full mb-4">
              <Award size={14} /> ADVANCED HR & PAYROLL
            </div>
            <h1 className="text-5xl font-bold tracking-tighter mb-4">
              DIAUF Humanika
            </h1>
            <p className="text-xl text-slate-300 max-w-lg">
              Platform HRD & Penggajian yang lebih detail dan powerful. 
              Terintegrasi penuh dengan DIAUF ID untuk pengelolaan SDM yang lengkap.
            </p>
            <div className="mt-8 flex gap-3">
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition">
                Mulai Setup Penggajian
              </button>
              <button className="border border-white/40 hover:bg-white/5 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 transition">
                Lihat Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900">Fitur Utama DIAUF Humanika</h2>
          <p className="text-slate-600">Lebih mendalam dibandingkan modul SDM di platform utama.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Payroll */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <DollarSign size={24} />
            </div>
            <h3 className="font-semibold text-xl mb-2">Penggajian Lengkap</h3>
            <p className="text-slate-600 text-sm mb-4">
              Perhitungan gaji otomatis, pajak, tunjangan, potongan, dan slip gaji digital. 
              Multi-cabang & multi-komponen gaji.
            </p>
            <div className="text-emerald-600 text-sm font-medium">Coming soon →</div>
          </div>

          {/* Advanced HR */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="font-semibold text-xl mb-2">HRD Detail</h3>
            <p className="text-slate-600 text-sm mb-4">
              Rekrutmen, onboarding, penilaian kinerja, training, kontrak karyawan, 
              cuti & absensi canggih, serta career path.
            </p>
            <div className="text-emerald-600 text-sm font-medium">Coming soon →</div>
          </div>

          {/* Integration */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <Calendar size={24} />
            </div>
            <h3 className="font-semibold text-xl mb-2">Integrasi DIAUF ID</h3>
            <p className="text-slate-600 text-sm mb-4">
              Terhubung langsung dengan master data karyawan, pembelian (untuk benefit), 
              dan akuntansi untuk otomatisasi jurnal penggajian.
            </p>
            <div className="text-emerald-600 text-sm font-medium">Terintegrasi →</div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="border-t bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-slate-500">
          DIAUF Humanika adalah platform terpisah yang tetap terhubung dengan akun DIAUF ID Anda. 
          Data karyawan dari modul SDM dapat digunakan di sini.
        </div>
      </div>
    </div>
  );
}
