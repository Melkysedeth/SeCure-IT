import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Activos from "./pages/Activos";
import Mapa from "./pages/Mapa";
import Configuracion from "./pages/Configuracion";
import Usuarios from "./pages/Usuarios";
import DetalleActivo from "./pages/DetalleActivo";
import Alertas from "./pages/Alertas";
import Historial from "./pages/Historial";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#519d99] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="activos" element={<Activos />} />
          <Route path="activos/:codigo" element={<DetalleActivo />} />
          <Route path="mapa" element={<Mapa />} />
          <Route path="alertas" element={<Alertas />} />
          <Route path="historial" element={<Historial />} />
          <Route path="reportes" element={<div className="p-4 text-gray-500">Reportes — próximamente</div>} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="usuarios" element={<Usuarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
