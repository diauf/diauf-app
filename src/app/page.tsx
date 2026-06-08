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
      </div>
    </main>
  );
}