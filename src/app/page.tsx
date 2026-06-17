export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-slate-900">
          DIAUF.ID
        </h1>

        <p className="mt-4 text-xl text-slate-600">
          Business Operating System
        </p>

        <p className="text-xl text-slate-600">
          untuk UMKM Indonesia
        </p>

        <div className="mt-10">
          <span className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
            Versi 0.1
          </span>
        </div>

        {/* TEST SUPABASE */}
        <div className="mt-8 rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-slate-500">
            Supabase URL:
          </p>

          <p className="mt-2 text-sm font-medium text-emerald-600 break-all">
            {process.env.NEXT_PUBLIC_SUPABASE_URL}
          </p>
        </div>

        {/* TEST PENGATURAN */}
        <div className="mt-8">
          <a
            href="/pengaturan"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
          >
            Test Halaman Pengaturan (klik untuk cek route)
          </a>
        </div>
      </div>
    </main>
  );
}