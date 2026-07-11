import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useAlerts } from "../../hooks/useAlerts";
import { mapAlerta } from "../../lib/alerts";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/activos": "Activos",
  "/mapa": "Mapa",
  "/alertas": "Alertas",
  "/historial": "Historial",
  "/reportes": "Reportes",
  "/configuracion": "Configuración",
  "/usuarios": "Usuarios",
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = titles[location.pathname] || "SeCure-IT";
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: alertasRaw } = useAlerts();
  const alertasPendientes = useMemo(() => alertasRaw.map(mapAlerta).filter((a) => a.estado !== "Resuelta"), [alertasRaw]);
  const pendientesCount = alertasPendientes.length;
  const alertasPreview = alertasPendientes.slice(0, 5);

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    if (!dropdownOpen && !notifOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, [dropdownOpen, notifOpen]);

  const emailLabel = user?.email?.split("@")[0] ?? "Administrador";
  const initial = emailLabel[0].toUpperCase();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-base font-semibold text-gray-800">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Campana */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen((v) => !v)} className="relative text-gray-500 hover:text-gray-700">
            <Bell size={20} />
            {pendientesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                {pendientesCount > 9 ? "9+" : pendientesCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-[#3d3d42]">Notificaciones</p>
                <p className="text-[11px] text-[#9898a0]">{pendientesCount > 0 ? `${pendientesCount} alerta${pendientesCount > 1 ? "s" : ""} sin resolver` : "No hay alertas pendientes"}</p>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {alertasPreview.length === 0 && <p className="px-4 py-6 text-center text-xs text-[#9898a0]">Todo tranquilo por ahora.</p>}
                {alertasPreview.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setNotifOpen(false);
                      navigate("/alertas");
                    }}
                    className="w-full flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span
                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        a.severidad === "critica" ? "bg-red-500" : a.severidad === "alta" ? "bg-orange-500" : a.severidad === "media" ? "bg-amber-500" : "bg-green-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#3d3d42] truncate">
                        {a.codigo} - {a.nombreEquipo}
                      </p>
                      <p className="text-[11px] text-[#9898a0] truncate">{a.descripcion}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setNotifOpen(false);
                  navigate("/alertas");
                }}
                className="w-full px-4 py-2.5 text-xs font-medium text-[#519d99] hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                Ver todas las alertas
              </button>
            </div>
          )}
        </div>

        {/* Dropdown usuario */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen((v) => !v)} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-[#519d99] flex items-center justify-center text-white text-xs font-bold">{initial}</div>
            <span className="text-sm text-[#4a4a52]">{emailLabel}</span>
            <ChevronDown size={16} className={`text-[#519d99] transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
              {/* Info usuario */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-medium text-[#3d3d42] truncate">{emailLabel}</p>
                <p className="text-[11px] text-[#9898a0] truncate">{user?.email}</p>
              </div>

              {/* Opciones */}
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#686971] hover:bg-gray-50 transition-colors">
                  <User size={15} className="text-[#9898a0]" />
                  Mi perfil
                </button>
                <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={15} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
