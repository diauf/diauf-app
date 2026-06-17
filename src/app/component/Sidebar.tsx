"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  LayoutDashboard,
  UsersRound,
  ShoppingCart,
  FileText,
  Wallet,
  Factory,
  Boxes,
  Users,
  Building2,
  Truck,
  FileBarChart,
  Receipt,
  Tag,
  Settings,
  FolderKanban,
  PackageCheck,
  PanelLeftClose,
  PanelLeftOpen,
  MonitorSmartphone,
  Calendar,
  Wrench,
  TrendingUp,
  Handshake,
  LogOut,
  Eye,
  Database,
  Briefcase,
} from "lucide-react";

// Module-scoped variable so the last scroll position of the sidebar survives
// across client-side navigations (different page components remounting their own Sidebar).
// Combined with sessionStorage for full reloads and useLayoutEffect for pre-paint restore.
let lastSidebarScrollPos = 0;

export default function Sidebar({
  collapsed,
  setCollapsed,
  currentRole,
}: {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  currentRole?: string;
}) {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  // Internal collapsed state.
  // Start with the prop value to guarantee the first render matches the server HTML (prevents hydration mismatch).
  const [isCollapsed, setIsCollapsed] = useState<boolean>(collapsed);

  // On client mount only, read persisted preference from localStorage and apply if different.
  // This keeps the "remember collapsed" feature without breaking SSR hydration.
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      const persisted = saved === "true";
      if (persisted !== collapsed) {
        setIsCollapsed(persisted);
      }
    }
  }, []); // run once after mount on client only

  // Persist collapsed preference whenever it changes
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", isCollapsed.toString());
  }, [isCollapsed]);

  // Keep parent informed (most pages don't use the value, but it keeps the API working)
  useEffect(() => {
    setCollapsed(isCollapsed);
  }, [isCollapsed, setCollapsed]);

  const effectiveCollapsed = isCollapsed;

  // Persist and restore sidebar scroll position across page navigations.
  // We use:
  // - Module-level `lastSidebarScrollPos` (survives remounts in the same JS module during SPA nav)
  // - sessionStorage (survives full page reloads)
  // - useLayoutEffect so the scrollTop is applied synchronously before the browser paints the new sidebar.
  // This should prevent the "jumps back to top" when clicking lower modules like Aset.

  useLayoutEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    // Prefer the in-memory value (set by previous Sidebar instance), fall back to storage.
    const saved =
      lastSidebarScrollPos ||
      parseInt(sessionStorage.getItem("sidebar-scroll-pos") || "0", 10);

    if (saved > 0) {
      // Set synchronously before paint → user should not see the list at the top.
      navEl.scrollTop = saved;
      lastSidebarScrollPos = saved;
      console.log('[Sidebar] useLayoutEffect restored scroll:', saved, 'pathname:', pathname);
    } else {
      console.log('[Sidebar] useLayoutEffect no saved scroll (will rely on active item logic), pathname:', pathname);
    }
  }, []);

  // After navigation (or on mount), make sure the currently active menu item is at least partially visible.
  // Using "nearest" means it only adjusts the scroll the minimal amount if the item is out of view.
  // This works together with the exact scroll position restore above.
  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    // Small delay to let the DOM settle (especially after the layout effect and possible parent re-renders from collapsed sync)
    const id = setTimeout(() => {
      if (!navEl) return;

      // Try to find the active link (the one for the current pathname)
      const active = navEl.querySelector(`a[href="${pathname}"]`) as HTMLElement | null;
      if (active) {
        // Only scrolls if needed
        active.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" });
        console.log('[Sidebar] Scrolled active menu item into view for:', pathname);
      } else {
        console.log('[Sidebar] No active link element found for pathname:', pathname);
      }
    }, 60);

    return () => clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    const handleScroll = () => {
      const pos = Math.round(navEl.scrollTop);
      lastSidebarScrollPos = pos;
      sessionStorage.setItem("sidebar-scroll-pos", pos.toString());
    };

    navEl.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      navEl.removeEventListener("scroll", handleScroll);
      // Make sure we capture the latest position when this Sidebar instance unmounts (navigation)
      const finalPos = Math.round(navEl.scrollTop);
      lastSidebarScrollPos = finalPos;
      sessionStorage.setItem("sidebar-scroll-pos", finalPos.toString());
    };
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Data Master", icon: Database, path: "/data-master" },
    { name: "CRM", icon: UsersRound, path: "/crm" },
    { name: "Pembelian", icon: ShoppingCart, path: "/pembelian" },
    { name: "Penjualan", icon: Tag, path: "/penjualan" },
    { name: "POS", icon: MonitorSmartphone },
    { name: "Rental", icon: Calendar, path: "/rental" },
    { name: "Kas & Bank", icon: Wallet, path: "/kas-bank" },
    { name: "Persediaan", icon: Boxes, path: "/persediaan" },
    { name: "Produksi", icon: Factory, path: "/produksi" },
    { name: "SDM", icon: Users, path: "/sdm" },
    { name: "Project", icon: FolderKanban, path: "/project" },
    { name: "Workshop", icon: Wrench, path: "/workshop" },
    { name: "Pengiriman", icon: PackageCheck, path: "/pengiriman" },
    { name: "Armada", icon: Truck, path: "/armada" },
    { name: "Pajak", icon: Receipt, path: "/pajak" },
    { name: "Konsultan", icon: Briefcase, path: "/konsultan" },
    { name: "Pendampingan", icon: Handshake, path: "/pendampingan" },
    { name: "Proyeksi", icon: TrendingUp, path: "/proyeksi" },
    { name: "Aset", icon: Building2, path: "/aset" },
    { name: "Monitoring Klien", icon: Eye, path: "/monitoring-klien" },
    { name: "Laporan", icon: FileBarChart, path: "/laporan" },
  ];

  return (
    <aside
      className={`
        fixed
        left-0
        top-0
        z-50
        h-screen
        bg-[#041833]
        border-r
        border-slate-800
        flex
        flex-col
        transition-all
        duration-300
        ${effectiveCollapsed ? "w-20" : "w-72"}
      `}
    >
      {/* Header */}
<div
  className={`
    relative
    h-20
    border-b
    border-slate-800
    flex
    items-center
    px-5
    ${effectiveCollapsed ? "justify-center" : "justify-between"}
  `}
>
        {!effectiveCollapsed && (
  <div>
    <h1 className="text-2xl font-bold text-white">
      DIAUF<span className="text-emerald-400">.ID</span>
    </h1>

    <p className="text-xs text-slate-400">
      Business Operating System
    </p>
  </div>
)}

        <button
  onClick={() => setIsCollapsed(!isCollapsed)}
  className="
    absolute
    right-4
    text-slate-400
    hover:text-white
    transition
  "
>
          {effectiveCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      {/* Menu */}
      <nav ref={navRef} className="flex-1 overflow-y-auto p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          if (item.path) {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-xl
                  transition
                  group
                  mb-1
                  ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}
                `}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-emerald-400" : "group-hover:text-emerald-400"}
                />
                {!effectiveCollapsed && (
                  <span className="text-sm font-medium">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          }

          return (
            <button
              key={item.name}
              className="
                w-full
                flex
                items-center
                gap-3
                px-4
                py-3
                rounded-xl
                text-slate-300
                hover:bg-slate-800
                hover:text-white
                transition
                group
                mb-1
              "
            >
              <Icon
                size={20}
                className="group-hover:text-emerald-400"
              />

              {!effectiveCollapsed && (
                <span className="text-sm font-medium">
                  {item.name}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
<div className="border-t border-slate-800 p-3">
  <Link
    href="/pengaturan"
    className={`
      w-full
      flex
      items-center
      gap-3
      px-4
      py-3
      rounded-xl
      transition
      ${pathname === "/pengaturan" 
        ? "bg-slate-800 text-white" 
        : "text-slate-300 hover:bg-slate-800 hover:text-white"}
    `}
  >
    <Settings size={20} className={pathname === "/pengaturan" ? "text-emerald-400" : ""} />

    {!effectiveCollapsed && (
      <span className="text-sm font-medium">
        Pengaturan
      </span>
    )}
  </Link>
</div>
    </aside>
  );
}