import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface CiudadData {
  nombre: string;
  lat: number;
  lng: number;
  cantidad: number;
}

const ciudadesData: CiudadData[] = [
  { nombre: "Barranquilla", lat: 10.9685, lng: -74.7813, cantidad: 45 },
  { nombre: "Montería", lat: 8.7479, lng: -75.8814, cantidad: 12 },
  { nombre: "Valledupar", lat: 10.4631, lng: -73.2532, cantidad: 6 },
  { nombre: "Medellín", lat: 6.2442, lng: -75.5812, cantidad: 18 },
  { nombre: "Bogotá", lat: 4.711, lng: -74.0721, cantidad: 31 },
  { nombre: "Villavicencio", lat: 4.142, lng: -73.6266, cantidad: 8 },
];

function getRadius(cantidad: number) {
  // Escala el radio del círculo según cantidad de equipos
  return Math.max(12, Math.min(28, cantidad * 0.6));
}

export default function ColombiaMap() {
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
