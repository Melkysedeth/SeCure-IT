import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import { useAssets } from "../../hooks/useAssets";

interface CiudadData {
  key: string;
  nombre: string;
  lat: number;
  lng: number;
  cantidad: number;
}

// Agrupa por sede (no por texto de ciudad): cada sede tiene coordenadas fijas
// en la tabla `sedes`, así que todos sus activos se apilan en un único punto
// exacto en vez de promediar latitudes/longitudes de reportes individuales
// (eso producía puntos "fantasma" cuando dos activos compartían ciudad pero
// tenían coordenadas distintas o ruidosas).
function agruparPorCiudad(data: any[]): CiudadData[] {
  const grupos = new Map<string, CiudadData>();

  for (const activo of data) {
    const key = activo.sede_id ?? activo.ubicacion_ciudad ?? activo.ciudad_asignada;
    const nombre = activo.sede_nombre ?? activo.ubicacion_ciudad ?? activo.ciudad_asignada;
    const lat = activo.sede_latitud ?? activo.latitud;
    const lng = activo.sede_longitud ?? activo.longitud;
    if (!key || lat == null || lng == null) continue;

    const existente = grupos.get(key);
    if (existente) {
      existente.cantidad += 1;
    } else {
      grupos.set(key, { key, nombre, lat, lng, cantidad: 1 });
    }
  }

  return Array.from(grupos.values());
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
              key={ciudad.key}
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
