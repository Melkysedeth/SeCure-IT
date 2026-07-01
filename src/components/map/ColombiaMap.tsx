import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import { useAssets } from "../../hooks/useAssets";

interface CiudadData {
  nombre: string;
  lat: number;
  lng: number;
  cantidad: number;
}

function agruparPorCiudad(data: any[]): CiudadData[] {
  const grupos = new Map<string, { lat: number; lng: number; cantidad: number; sumaLat: number; sumaLng: number }>();

  for (const activo of data) {
    const nombre = activo.ubicacion_ciudad ?? activo.ciudad_asignada;
    const lat = activo.latitud;
    const lng = activo.longitud;
    if (!nombre || lat == null || lng == null) continue;

    const existente = grupos.get(nombre);
    if (existente) {
      existente.cantidad += 1;
      existente.sumaLat += lat;
      existente.sumaLng += lng;
    } else {
      grupos.set(nombre, { lat, lng, cantidad: 1, sumaLat: lat, sumaLng: lng });
    }
  }

  return Array.from(grupos.entries()).map(([nombre, g]) => ({
    nombre,
    lat: g.sumaLat / g.cantidad,
    lng: g.sumaLng / g.cantidad,
    cantidad: g.cantidad,
  }));
}

function getRadius(cantidad: number) {
  // Escala el radio del círculo según cantidad de equipos
  return Math.max(12, Math.min(28, cantidad * 0.6));
}

export default function ColombiaMap() {
  const { data, loading } = useAssets();
  const ciudadesData = useMemo(() => agruparPorCiudad(data), [data]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-[#3d3d42]">Ubicación de activos</h2>
        </div>
        <div className="h-[300px] w-full flex items-center justify-center text-sm text-[#9898a0]">Cargando mapa...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-[#3d3d42]">Ubicación de activos</h2>
      </div>
      <div className="h-[300px] w-full">
        <MapContainer center={[7.5, -74.5]} zoom={6} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {ciudadesData.map((ciudad) => (
            <CircleMarker
              key={ciudad.nombre}
              center={[ciudad.lat, ciudad.lng]}
              radius={getRadius(ciudad.cantidad)}
              pathOptions={{
                fillColor: "#519d99",
                fillOpacity: 0.6,
                color: "#3d7a76",
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                <span className="font-medium">
                  {ciudad.nombre}: {ciudad.cantidad} equipos
                </span>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
