"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  LayoutDashboard,
  FolderOpen,
  FileText,
  Receipt,
  Stamp,
  Clock,
  Kanban,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/processos", icon: FolderOpen, label: "Processos" },
  { href: "/movimentacoes", icon: FileText, label: "Movimentações" },
  { href: "/honorarios", icon: Receipt, label: "Honorários" },
  { href: "/procuracoes", icon: Stamp, label: "Procurações" },
  { href: "/prazos", icon: Clock, label: "Controle de Prazos" },
  { href: "/kanban", icon: Kanban, label: "Kanban" },
  { href: "/calendario", icon: CalendarDays, label: "Calendário" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Scale size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-sm leading-tight">JurisOffice</h1>
          <p className="text-blue-300 text-xs">Gestão Jurídica</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider px-2 mb-3">
          Menu Principal
        </p>
        <ul className="space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                    active
                      ? "bg-primary-700 text-white"
                      : "text-blue-200 hover:bg-sidebar-hover hover:text-white"
                  )}
                >
                  <Icon size={18} className={clsx(active ? "text-white" : "text-blue-400 group-hover:text-white")} />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight size={14} className="text-blue-200" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            JP
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">Dr. João Paulo</p>
            <p className="text-blue-400 text-xs truncate">OAB/SP 123456</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
