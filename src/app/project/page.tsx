"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../component/Sidebar";

import {
  FolderKanban,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Target,
  Users,
} from "lucide-react";

type Project = {
  id: string;
  kode: string;
  nama: string;
  deskripsi?: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: string; // Planning, In Progress, On Hold, Completed, Cancelled
  progress: number; // 0-100
  budget: number;
  actualCost: number;
  manager: string;
};

type Task = {
  id: string;
  projectId: string;
  projectNama: string;
  judul: string;
  deskripsi?: string;
  assignedTo: string;
  dueDate: string;
  status: string; // To Do, In Progress, Done, Blocked
  progress: number;
  priority: string; // Low, Medium, High
};

export default function ProjectPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "ringkasan" | "proyek" | "tugas" | "laporan"
  >("ringkasan");

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "proyek", label: "Daftar Proyek" },
    { id: "tugas", label: "Tugas & Milestone" },
    { id: "laporan", label: "Laporan & Progress" },
  ] as const;

  // Demo data
  const [projectList, setProjectList] = useState<Project[]>([
    {
      id: "p1",
      kode: "PRJ-2026-001",
      nama: "Pengembangan Sistem ERP Baru",
      deskripsi: "Implementasi modul lengkap untuk klien manufaktur",
      tanggalMulai: "2026-05-01",
      tanggalSelesai: "2026-09-30",
      status: "In Progress",
      progress: 45,
      budget: 450000000,
      actualCost: 210000000,
      manager: "Budi Santoso",
    },
    {
      id: "p2",
      kode: "PRJ-2026-002",
      nama: "Upgrade Infrastruktur Jaringan",
      deskripsi: "Modernisasi jaringan kantor pusat dan cabang",
      tanggalMulai: "2026-06-01",
      tanggalSelesai: "2026-08-15",
      status: "In Progress",
      progress: 70,
      budget: 125000000,
      actualCost: 95000000,
      manager: "Siti Rahayu",
    },
    {
      id: "p3",
      kode: "PRJ-2026-003",
      nama: "Pelatihan SDM & Workshop",
      deskripsi: "Program pelatihan untuk 150 karyawan",
      tanggalMulai: "2026-04-15",
      tanggalSelesai: "2026-06-30",
      status: "Completed",
      progress: 100,
      budget: 75000000,
      actualCost: 72000000,
      manager: "Ahmad Wijaya",
    },
  ]);

  const [taskList, setTaskList] = useState<Task[]>([
    {
      id: "t1",
      projectId: "p1",
      projectNama: "Pengembangan Sistem ERP Baru",
      judul: "Analisis Kebutuhan Modul CRM",
      deskripsi: "Wawancara stakeholder dan dokumentasi requirement",
      assignedTo: "Tim Analis",
      dueDate: "2026-06-20",
      status: "In Progress",
      progress: 65,
      priority: "High",
    },
    {
      id: "t2",
      projectId: "p1",
      projectNama: "Pengembangan Sistem ERP Baru",
      judul: "Desain Database Persediaan",
      assignedTo: "Dev Team A",
      dueDate: "2026-06-25",
      status: "To Do",
      progress: 0,
      priority: "Medium",
    },
    {
      id: "t3",
      projectId: "p2",
      projectNama: "Upgrade Infrastruktur Jaringan",
      judul: "Instalasi Switch Core",
      assignedTo: "Tim Network",
      dueDate: "2026-06-18",
      status: "Done",
      progress: 100,
      priority: "High",
    },
    {
      id: "t4",
      projectId: "p3",
      projectNama: "Pelatihan SDM & Workshop",
      judul: "Persiapan Materi Training",
      assignedTo: "HR & Trainer",
      dueDate: "2026-06-10",
      status: "Done",
      progress: 100,
      priority: "Medium",
    },
  ]);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Forms
  const [projectForm, setProjectForm] = useState({
    kode: "",
    nama: "",
    deskripsi: "",
    tanggalMulai: new Date().toISOString().split("T")[0],
    tanggalSelesai: "",
    status: "Planning",
    progress: 0,
    budget: 0,
    manager: "",
  });

  const [taskForm, setTaskForm] = useState({
    projectId: "",
    projectNama: "",
    judul: "",
    deskripsi: "",
    assignedTo: "",
    dueDate: "",
    status: "To Do",
    progress: 0,
    priority: "Medium",
  });

  // Load profile (demo)
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        setProfile({ name: "Admin Demo", role: "Project Manager" });
      } catch (err) {
        setProfile({ name: "Admin Demo", role: "Project Manager" });
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  // Filtered lists
  const filteredProjects = projectList.filter((p) => {
    const matchSearch = (p.nama + p.kode + (p.manager || "")).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredTasks = taskList.filter((t) => {
    const matchSearch = (t.judul + t.projectNama + t.assignedTo).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const totalProjects = projectList.length;
  const activeProjects = projectList.filter((p) => p.status === "In Progress").length;
  const completedProjects = projectList.filter((p) => p.status === "Completed").length;
  const avgProgress = projectList.length > 0 ? Math.round(projectList.reduce((sum, p) => sum + p.progress, 0) / projectList.length) : 0;
  const totalBudget = projectList.reduce((sum, p) => sum + p.budget, 0);
  const totalActual = projectList.reduce((sum, p) => sum + p.actualCost, 0);

  // Handlers
  const openAddProjectModal = () => {
    setProjectForm({
      kode: `PRJ-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      nama: "",
      deskripsi: "",
      tanggalMulai: new Date().toISOString().split("T")[0],
      tanggalSelesai: "",
      status: "Planning",
      progress: 0,
      budget: 50000000,
      manager: "Project Manager",
    });
    setEditingProjectId(null);
    setShowProjectModal(true);
  };

  const openEditProjectModal = (project: Project) => {
    setProjectForm({
      kode: project.kode,
      nama: project.nama,
      deskripsi: project.deskripsi || "",
      tanggalMulai: project.tanggalMulai,
      tanggalSelesai: project.tanggalSelesai,
      status: project.status,
      progress: project.progress,
      budget: project.budget,
      manager: project.manager,
    });
    setEditingProjectId(project.id);
    setShowProjectModal(true);
  };

  const saveProject = () => {
    if (!projectForm.nama || !projectForm.tanggalSelesai) return;

    if (editingProjectId) {
      setProjectList((prev) =>
        prev.map((p) =>
          p.id === editingProjectId
            ? {
                ...p,
                ...projectForm,
              }
            : p
        )
      );
    } else {
      const newProject: Project = {
        id: "p" + Date.now(),
        ...projectForm,
        actualCost: 0,
      };
      setProjectList((prev) => [newProject, ...prev]);
    }
    setShowProjectModal(false);
    setEditingProjectId(null);
  };

  const deleteProject = (id: string) => {
    if (!confirm("Hapus proyek ini? Semua tugas terkait juga akan terhapus.")) return;
    setProjectList((prev) => prev.filter((p) => p.id !== id));
    setTaskList((prev) => prev.filter((t) => t.projectId !== id));
  };

  const openAddTaskModal = () => {
    const firstProject = projectList[0];
    setTaskForm({
      projectId: firstProject?.id || "",
      projectNama: firstProject?.nama || "",
      judul: "",
      deskripsi: "",
      assignedTo: "Team Member",
      dueDate: "",
      status: "To Do",
      progress: 0,
      priority: "Medium",
    });
    setEditingTaskId(null);
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task: Task) => {
    setTaskForm({
      projectId: task.projectId,
      projectNama: task.projectNama,
      judul: task.judul,
      deskripsi: task.deskripsi || "",
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      status: task.status,
      progress: task.progress,
      priority: task.priority,
    });
    setEditingTaskId(task.id);
    setShowTaskModal(true);
  };

  const saveTask = () => {
    if (!taskForm.judul || !taskForm.dueDate || !taskForm.projectId) return;

    const project = projectList.find((p) => p.id === taskForm.projectId);
    if (!project) return;

    if (editingTaskId) {
      setTaskList((prev) =>
        prev.map((t) =>
          t.id === editingTaskId
            ? {
                ...t,
                ...taskForm,
                projectNama: project.nama,
              }
            : t
        )
      );
    } else {
      const newTask: Task = {
        id: "t" + Date.now(),
        ...taskForm,
        projectNama: project.nama,
      };
      setTaskList((prev) => [newTask, ...prev]);
    }
    setShowTaskModal(false);
    setEditingTaskId(null);
  };

  const deleteTask = (id: string) => {
    if (!confirm("Hapus tugas ini?")) return;
    setTaskList((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTaskStatus = (id: string, newStatus: string) => {
    setTaskList((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newProgress = newStatus === "Done" ? 100 : t.progress;
          return { ...t, status: newStatus, progress: newProgress };
        }
        return t;
      })
    );
  };

  // Helper for project select in task form
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = projectList.find((p) => p.id === e.target.value);
    if (selected) {
      setTaskForm((prev) => ({
        ...prev,
        projectId: selected.id,
        projectNama: selected.nama,
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-900">Memuat Modul Project...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentRole={profile?.role} />

      <div className={`${collapsed ? "ml-20" : "ml-72"} transition-all duration-300 p-6`}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
                <FolderKanban size={26} className="text-emerald-600" /> Modul Project
              </h1>
              <p className="mt-1 text-sm text-slate-800">
                Kelola proyek, tugas, milestone, dan progress. Terintegrasi dengan SDM, Persediaan, dan Kas & Bank.
              </p>
            </div>
            <button
              onClick={() => {
                if (activeTab === "proyek") openAddProjectModal();
                else if (activeTab === "tugas") openAddTaskModal();
                else setActiveTab("proyek");
              }}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition shadow-sm"
            >
              <Plus size={16} /> Tambah Data
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 border-b border-slate-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-2xl transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-700 bg-white"
                  : "border-transparent text-slate-800 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input
              type="text"
              placeholder="Cari proyek atau tugas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          {(activeTab === "proyek" || activeTab === "tugas") && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="all">Semua Status</option>
              {activeTab === "proyek" && (
                <>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </>
              )}
              {activeTab === "tugas" && (
                <>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                  <option value="Blocked">Blocked</option>
                </>
              )}
            </select>
          )}
        </div>

        {/* RINGKASAN */}
        {activeTab === "ringkasan" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Total Proyek</div>
                <div className="text-3xl font-semibold text-slate-900 mt-1">{totalProjects}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Proyek Aktif</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{activeProjects}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Proyek Selesai</div>
                <div className="text-3xl font-semibold text-blue-700 mt-1">{completedProjects}</div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="text-xs text-slate-700">Rata-rata Progress</div>
                <div className="text-3xl font-semibold text-emerald-700 mt-1">{avgProgress}%</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                  <Target size={20} /> Progress Proyek
                </h3>
                <div className="space-y-4">
                  {projectList.slice(0, 4).map((p) => (
                    <div key={p.id} className="border border-slate-200 rounded-2xl p-4">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium text-slate-900 truncate">{p.nama}</div>
                        <div className="text-sm font-semibold text-emerald-700">{p.progress}%</div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${p.progress}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-800 mt-1">
                        <span>{p.manager}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900">
                  <Users size={20} /> Tugas Terbuka
                </h3>
                <div className="space-y-3">
                  {taskList.filter((t) => t.status !== "Done").length > 0 ? (
                    taskList
                      .filter((t) => t.status !== "Done")
                      .slice(0, 5)
                      .map((task) => (
                        <div key={task.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-xl">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-slate-900 truncate">{task.judul}</div>
                            <div className="text-xs text-slate-800">{task.projectNama} • {task.assignedTo}</div>
                          </div>
                          <div className="text-right text-xs">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${task.priority === "High" ? "bg-red-100 text-red-800" : task.priority === "Medium" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-900"}`}>
                              {task.priority}
                            </span>
                            <div className="text-slate-800 mt-0.5">{task.dueDate}</div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-slate-800">Semua tugas sudah selesai.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DAFTAR PROYEK */}
        {activeTab === "proyek" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddProjectModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Buat Proyek Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Kode</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Nama Proyek</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Manager</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Periode</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Progress</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Budget vs Actual</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-slate-800">Belum ada proyek.</td>
                      </tr>
                    ) : (
                      filteredProjects.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-mono text-sm text-slate-900">{p.kode}</td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-900">{p.nama}</div>
                            <div className="text-xs text-slate-800 line-clamp-1">{p.deskripsi}</div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-800">{p.manager}</td>
                          <td className="px-5 py-4 text-center text-sm text-slate-800">
                            {p.tanggalMulai} <br /> s/d {p.tanggalSelesai}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="w-24 mx-auto bg-slate-200 rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${p.progress}%` }}></div>
                            </div>
                            <div className="text-xs mt-1 font-medium text-emerald-700">{p.progress}%</div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${p.status === "Completed" ? "bg-emerald-100 text-emerald-800" : p.status === "In Progress" ? "bg-blue-100 text-blue-800" : p.status === "On Hold" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-900"}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right text-sm">
                            <div className="text-emerald-700 font-semibold">Rp {(p.budget / 1000000).toFixed(0)}jt</div>
                            <div className="text-xs text-slate-800">Actual: Rp {(p.actualCost / 1000000).toFixed(0)}jt</div>
                          </td>
                          <td className="px-5 py-4 text-right space-x-1">
                            <button onClick={() => openEditProjectModal(p)} className="p-2 text-blue-700 hover:bg-blue-50 rounded-xl" title="Edit">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => deleteProject(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl" title="Hapus">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TUGAS */}
        {activeTab === "tugas" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={openAddTaskModal} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-2xl transition">
                <Plus size={16} /> Tambah Tugas Baru
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Judul Tugas</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Proyek</th>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Assigned To</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Due Date</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Progress</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Priority</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-slate-800">Belum ada tugas.</td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-900">{task.judul}</div>
                            <div className="text-xs text-slate-800 line-clamp-1">{task.deskripsi}</div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-800">{task.projectNama}</td>
                          <td className="px-5 py-4 text-sm text-slate-800">{task.assignedTo}</td>
                          <td className="px-5 py-4 text-center text-sm text-slate-800">{task.dueDate}</td>
                          <td className="px-5 py-4 text-center">
                            <div className="w-20 mx-auto bg-slate-200 rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${task.progress}%` }}></div>
                            </div>
                            <div className="text-xs mt-1 font-medium text-emerald-700">{task.progress}%</div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${task.priority === "High" ? "bg-red-100 text-red-800" : task.priority === "Medium" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-900"}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${task.status === "Done" ? "bg-emerald-100 text-emerald-800" : task.status === "In Progress" ? "bg-blue-100 text-blue-800" : task.status === "Blocked" ? "bg-red-100 text-red-800" : "bg-slate-200 text-slate-900"}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right space-x-1">
                            <button onClick={() => updateTaskStatus(task.id, task.status === "Done" ? "To Do" : "Done")} className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl" title="Toggle Status">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => openEditTaskModal(task)} className="p-2 text-blue-700 hover:bg-blue-50 rounded-xl" title="Edit">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => deleteTask(task.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl" title="Hapus">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* LAPORAN */}
        {activeTab === "laporan" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 text-slate-900">Ringkasan Anggaran Proyek</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-semibold text-slate-900">Proyek</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Budget</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Actual Cost</th>
                      <th className="px-5 py-3.5 text-right font-semibold text-slate-900">Variance</th>
                      <th className="px-5 py-3.5 text-center font-semibold text-slate-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projectList.map((p) => {
                      const variance = p.budget - p.actualCost;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-medium text-slate-900">{p.nama}</td>
                          <td className="px-5 py-4 text-right font-semibold text-slate-900">Rp {p.budget.toLocaleString("id-ID")}</td>
                          <td className="px-5 py-4 text-right text-slate-800">Rp {p.actualCost.toLocaleString("id-ID")}</td>
                          <td className={`px-5 py-4 text-right font-semibold ${variance >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                            Rp {variance.toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${p.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 text-slate-900">Progress Keseluruhan</h3>
              <div className="text-center">
                <div className="text-6xl font-bold text-emerald-700">{avgProgress}%</div>
                <div className="text-slate-800 mt-2">Rata-rata progress seluruh proyek aktif</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">{editingProjectId ? "Edit Proyek" : "Buat Proyek Baru"}</h3>
              <button onClick={() => setShowProjectModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Nama Proyek</label>
                <input value={projectForm.nama} onChange={(e) => setProjectForm({ ...projectForm, nama: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Deskripsi</label>
                <textarea value={projectForm.deskripsi} onChange={(e) => setProjectForm({ ...projectForm, deskripsi: e.target.value })} rows={2} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal Mulai</label>
                  <input type="date" value={projectForm.tanggalMulai} onChange={(e) => setProjectForm({ ...projectForm, tanggalMulai: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Tanggal Selesai</label>
                  <input type="date" value={projectForm.tanggalSelesai} onChange={(e) => setProjectForm({ ...projectForm, tanggalSelesai: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Budget (Rp)</label>
                  <input type="number" value={projectForm.budget} onChange={(e) => setProjectForm({ ...projectForm, budget: parseInt(e.target.value) || 0 })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Manager</label>
                  <input value={projectForm.manager} onChange={(e) => setProjectForm({ ...projectForm, manager: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Status</label>
                <select value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  <option>Planning</option>
                  <option>In Progress</option>
                  <option>On Hold</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowProjectModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveProject} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan Proyek</button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl text-slate-900">{editingTaskId ? "Edit Tugas" : "Tambah Tugas Baru"}</h3>
              <button onClick={() => setShowTaskModal(false)}><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Proyek</label>
                <select value={taskForm.projectId} onChange={handleProjectChange} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                  {projectList.map((p) => (
                    <option key={p.id} value={p.id}>{p.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Judul Tugas</label>
                <input value={taskForm.judul} onChange={(e) => setTaskForm({ ...taskForm, judul: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Deskripsi</label>
                <textarea value={taskForm.deskripsi} onChange={(e) => setTaskForm({ ...taskForm, deskripsi: e.target.value })} rows={2} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Assigned To</label>
                  <input value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Due Date</label>
                  <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Priority</label>
                  <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Status</label>
                  <select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })} className="w-full border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900">
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Done</option>
                    <option>Blocked</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowTaskModal(false)} className="flex-1 py-3 border border-slate-300 text-slate-800 rounded-2xl font-medium hover:bg-slate-50">Batal</button>
              <button onClick={saveTask} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold">Simpan Tugas</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
