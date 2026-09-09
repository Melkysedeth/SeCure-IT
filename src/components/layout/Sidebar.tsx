import { NavLink } from "react-router-dom";
import { LayoutDashboard, Monitor, Map, Bell, History, FileText, Settings, Users, Shield } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/activos", icon: Monitor, label: "Activos" },
  { to: "/mapa", icon: Map, label: "Mapa" },
  { to: "/alertas", icon: Bell, label: "Alertas" },
  { to: "/historial", icon: History, label: "Historial" },
  { to: "/reportes", icon: FileText, label: "Reportes" },
];

const bottomItems = [
  { to: "/configuracion", icon: Settings, label: "Configuración" },
  { to: "/usuarios", icon: Users, label: "Usuarios" },
];

function NavGroup({ title, items }: { title?: string; items: typeof navItems }) {
  return (
    <div className="flex flex-col gap-1">
      {title && (
        <p className="px-4 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          {title}
        </p>
      )}
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `relative flex items-center gap-3 pl-4 pr-4 py-3 rounded-lg text-[15px] font-medium transition-colors ${isActive
              ? "bg-[#519d99]/10 text-[#519d99] font-semibold"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`
          }
        >
          {({ isActive }) =>
            <>
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.75 rounded-full bg-[#519d99]" />
              )}
              <Icon size={20} />
              {label}
            </>
          }
        </NavLink>
      ))}
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-white text-slate-700 flex flex-col border-r border-slate-200">
      {/* Logo */}
      <div className="h-20 flex items-center gap-3 px-5 border-b border-slate-100">
        <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-linear-to-br from-[#3d8b8f] to-[#4dbfa8] shadow-md">
          <Shield className="text-white" size={25} />
        </div>
        <div>
          <p className="font-bold text-[19px] leading-tight text-slate-800">SeCure-IT</p>
          <p className="text-[13px] text-slate-400">Activos Tecnológicos</p>
        </div>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 px-3 py-5">
        <NavGroup title="Operaciones" items={navItems} />
      </nav>

      {/* Nav inferior */}
      <div className="px-3 py-5 border-t border-slate-100">
        <NavGroup items={bottomItems} />
      </div>

      {/* Version */}
      <div className="px-5 py-4 text-[12px] text-slate-400 border-t border-slate-100">
        SeCure-IT v1.0.0 © 2026
      </div>
    </aside>
  );
}