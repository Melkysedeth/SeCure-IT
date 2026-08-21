import { Link, useParams } from "react-router-dom";
import { useAssetDetail } from "../hooks/useAssetDetail";
import DetalleLaptop from "../components/assets/DetalleLaptop";
import DetalleMovil from "../components/assets/DetalleMovil";

export default function DetalleActivo() {
  const { codigo } = useParams();
  const { data: raw, origen, loading, error, refetch } = useAssetDetail(codigo);

  if (loading) {
    return <div className="p-10 text-center text-sm text-[#9898a0]">Cargando activo...</div>;
  }
  if (error) {
    return <div className="p-10 text-center text-sm text-red-500">Error: {error}</div>;
  }
  if (!raw || !origen) {
    return (
      <div className="p-10 text-center text-sm text-[#9898a0]">
        No se encontró ningún activo con el código <strong>{codigo}</strong>.{" "}
        <Link to="/activos" className="text-[#519d99] hover:underline">
          Volver a Activos
        </Link>
      </div>
    );
  }

  return origen === "movil" ? (
    <DetalleMovil raw={raw} codigo={codigo!} refetch={refetch} />
  ) : (
    <DetalleLaptop raw={raw} codigo={codigo!} refetch={refetch} />
  );
}