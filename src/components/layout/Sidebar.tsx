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
    <aside className="w-70 min-h-screen bg-[#519d99] text-white flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-white/20">
        <Shield className="text-white" size={30} />
        <div>
          <p className="font-bold text-[18px] leading-tight text-white">SeCure-IT</p>
          <p className="text-[11px] text-white/60">Activos Tecnológicos</p>
        </div>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-[15px] transition-colors ${isActive ? "bg-white/20 text-white font-semibold" : "text-white/75 hover:bg-white/15 hover:text-white"}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Nav inferior */}
      <div className="px-2 py-4 border-t border-white/20 flex flex-col gap-1">
        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-[15px] transition-colors ${isActive ? "bg-white/20 text-white font-semibold" : "text-white/75 hover:bg-white/15 hover:text-white"}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Version */}
      <div className="px-4 py-3 text-[11px] text-white/40">SeCure-IT v1.0.0 © 2026</div>
    </aside>
  );
}
