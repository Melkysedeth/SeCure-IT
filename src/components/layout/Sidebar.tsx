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

export default function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-white text-slate-700 flex flex-col border-r border-slate-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-100">
        <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-linear-to-br from-[#519d99] to-[#3d7d79] shadow-md">
          <Shield className="text-white" size={22} />
        </div>
        <div>
          <p className="font-bold text-[19px] leading-tight text-slate-800">SeCure-IT</p>
          <p className="text-[13px] text-slate-400">Activos Tecnológicos</p>
        </div>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-[16px] font-medium transition-colors ${isActive
                ? "bg-[#519d99] text-white font-semibold shadow-md shadow-[#519d99]/30"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Nav inferior */}
      <div className="px-3 py-5 border-t border-slate-100 flex flex-col gap-1.5">
        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-[16px] font-medium transition-colors ${isActive
                ? "bg-[#519d99] text-white font-semibold shadow-md shadow-[#519d99]/30"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Version */}
      <div className="px-5 py-4 text-[12px] text-slate-400 border-t border-slate-100">
        SeCure-IT v1.0.0 © 2026
      </div>
    </aside>
  );
}