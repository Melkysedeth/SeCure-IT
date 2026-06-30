export type TipoActivo = "laptop" | "tablet" | "celular" | "desktop";

export type EstadoActivo = "en_linea" | "sin_conexion" | "fuera_sede";

export type TipoDocumento = "CC" | "NIT" | "PPT" | "CE";

export interface Activo {
  id: string;
  codigo: string;
  categoria: string;
  tipo: TipoActivo;
  nombre_equipo: string | null;

  marca: string;
  modelo: string;
  procesador: string | null;
  memoria_ram: string | null;
  almacenamiento: string | null;
  serial: string | null;
  direccion_mac: string | null;

  sistema_op: string | null;
  version_so: string | null;
  dominio: string | null;

  tipo_documento: TipoDocumento | null;
  numero_documento: string | null;
  nombre_responsable: string | null;
  departamento: string | null;

  direccion: string | null;
  ciudad_asignada: string | null;

  fecha_registro: string;
  activo: boolean;
  observaciones: string | null;
}

export interface Reporte {
  id: string;
  activo_id: string;
  usuario_activo: string;
  ip_local: string;
  ip_publica: string;
  red_wifi: string;
  ubicacion_ciudad: string;
  latitud: number | null;
  longitud: number | null;
  bateria: number;
  estado: EstadoActivo;
  version_agente: string;
  timestamp_reporte: string;
}

export interface ActivoConReporte extends Activo, Omit<Reporte, "id" | "activo_id"> {}

// Formulario de registro (lo que llena el usuario en el modal)
export interface NuevoActivoForm {
  codigo: string;
  nombre_equipo: string;
  tipo: TipoActivo | "";
  serial: string;
  marca: string;
  modelo: string;
  sistema_op: string;
  version_so: string;
  dominio: string;
  nombre_responsable: string;
  tipo_documento: TipoDocumento | "";
  numero_documento: string;
  departamento: string;
  direccion: string;
  observaciones: string;
  procesador: string;
  memoria_ram: string;
  almacenamiento: string;
  direccion_mac: string;
  estado_inicial: EstadoActivo;
}
