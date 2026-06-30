import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Activos from "./pages/Activos";
import Mapa from "./pages/Mapa";
import Configuracion from "./pages/Configuracion";
import Usuarios from "./pages/Usuarios";
import DetalleActivo from "./pages/DetalleActivo";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="activos" element={<Activos />} />
          <Route path="mapa" element={<Mapa />} />
          <Route path="alertas" element={<div className="p-4 text-gray-500">Alertas — próximamente</div>} />
          <Route path="historial" element={<div className="p-4 text-gray-500">Historial — próximamente</div>} />
          <Route path="reportes" element={<div className="p-4 text-gray-500">Reportes — próximamente</div>} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="activos/:codigo" element={<DetalleActivo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
