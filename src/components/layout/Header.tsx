import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Bell, ChevronDown, LogOut, User, Search, Settings } from "lucide-react";
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

  // Búsqueda sincronizada vía ?q= en la URL, para que cualquier página
  // (ej. AssetsFilterBar en /activos) pueda leerla sin un input duplicado.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";

  function handleSearchChange(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set("q", value);
    } else {
      next.delete("q");
    }
    setSearchParams(next, { replace: true });
  }

  const { data: alertasRaw } = useAlerts();
  const alertasPendientes = useMemo(
    () => alertasRaw.map((raw) => mapAlerta(raw)).filter((a) => a.estado !== "Resuelta"),
    [alertasRaw]
  );
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
    <header className="h-20 bg-white border-b border-slate-200 flex items-center gap-6 px-6 sticky top-0 z-40">
      {/* Título de la sección actual */}
      <h1 className="text-lg font-semibold text-slate-700 whitespace-nowrap hidden md:block">{title}</h1>

      {/* Barra de búsqueda */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar activos, usuarios..."
            className="w-full bg-slate-100 border border-transparent rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-[#519d99] focus:ring-2 focus:ring-[#519d99]/15 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        {/* Campana */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${notifOpen ? "bg-[#519d99]/10 text-[#519d99]" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
          >
            <Bell size={19} />
            {pendientesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-semibold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                {pendientesCount > 9 ? "9+" : pendientesCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 z-50 overflow-hidden">
              <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/60">
                <p className="text-sm font-semibold text-slate-800">Notificaciones</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {pendientesCount > 0 ? `${pendientesCount} alerta${pendientesCount > 1 ? "s" : ""} sin resolver` : "No hay alertas pendientes"}
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {alertasPreview.length === 0 && <p className="px-4 py-8 text-center text-xs text-slate-400">Todo tranquilo por ahora.</p>}
                {alertasPreview.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setNotifOpen(false);
                      navigate("/alertas");
                    }}
                    className="w-full flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${a.severidad === "critica" ? "bg-red-500" : a.severidad === "alta" ? "bg-orange-500" : a.severidad === "media" ? "bg-amber-500" : "bg-green-500"
                        }`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">
                        {a.codigo} - {a.nombreEquipo}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{a.descripcion}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setNotifOpen(false);
                  navigate("/alertas");
                }}
                className="w-full px-4 py-3 text-xs font-semibold text-[#519d99] hover:bg-[#519d99]/5 transition-colors border-t border-slate-100"
              >
                Ver todas las alertas
              </button>
            </div>
          )}
        </div>

        {/* Configuración */}
        <button
          onClick={() => navigate("/configuracion")}
          className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Settings size={19} />
        </button>

        {/* Separador */}
        <div className="w-px h-8 bg-slate-200 mx-1.5" />

        {/* Dropdown usuario */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className={`flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full transition-colors cursor-pointer ${dropdownOpen ? "bg-slate-100" : "hover:bg-slate-100"
              }`}
          >
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#519d99] to-[#3d7d79] flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white">
              {initial}
            </div>
            <ChevronDown size={15} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 z-50 overflow-hidden">
              {/* Info usuario */}
              <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/60">
                <p className="text-xs font-semibold text-slate-800 truncate">{emailLabel}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
              </div>

              {/* Opciones */}
              <div className="py-1.5">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <User size={16} className="text-slate-400" />
                  Mi perfil
                </button>
                <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={16} />
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