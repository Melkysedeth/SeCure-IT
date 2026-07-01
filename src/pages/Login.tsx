import { useState } from "react";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#519d99] p-3 rounded-xl mb-3">
            <Shield className="text-white" size={28} />
          </div>
          <h1 className="text-xl font-bold text-[#3d3d42]">SeCure-IT</h1>
          <p className="text-sm text-[#9898a0]">Activos Tecnológicos</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-[#3d3d42] mb-1">Iniciar sesión</h2>
          <p className="text-xs text-[#9898a0] mb-5">Ingresa tus credenciales para acceder al panel.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#3d3d42]">Correo electrónico</label>
              <input
                type="email"
                placeholder="admin@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-[#3d3d42] placeholder:text-[#b0b0b8] focus:outline-none focus:ring-2 focus:ring-[#519d99]/30 focus:border-[#519d99]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#3d3d42]">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg text-[#3d3d42] placeholder:text-[#b0b0b8] focus:outline-none focus:ring-2 focus:ring-[#519d99]/30 focus:border-[#519d99]"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9898a0] hover:text-[#519d99]">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#519d99] hover:bg-[#3d7a76] disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#9898a0] mt-4">SeCure-IT v1.0.0 © 2025</p>
      </div>
    </div>
  );
}
