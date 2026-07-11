-- ============================================================================
-- Ajuste: "fuera de sede" se alerta SIEMPRE que la red no sea la de la sede
-- asignada, sin importar si es una red doméstica, datos móviles o el WiFi de
-- otra sede.
--
-- La versión anterior (001_sedes_geofencing.sql) evitaba alertar cuando la
-- BSSID no se reconocía en ningún lado, para no generar falsos positivos
-- durante una caída del internet de la oficina. Pero el objetivo real del
-- negocio es más estricto: está prohibido sacar los equipos de la sede, así
-- que CUALQUIER red no reconocida como la de su sede debe generar la alerta.
-- La revisión de si fue una excepción legítima (ej. caída de internet) la
-- hace la persona que administra el software al ver la alerta, no el sistema.
-- ============================================================================

create or replace function calcular_estado_geofencing()
returns trigger as $$
declare
  v_sede_efectiva uuid;
  v_sede_bssid uuid;
begin
  if new.bssid_conectado is null then
    return new;
  end if;

  select coalesce(
           case
             when a.sede_temporal_hasta is not null and a.sede_temporal_hasta > now()
               then a.sede_temporal_id
             else null
           end,
           a.sede_id
         )
    into v_sede_efectiva
    from activos a
    where a.id = new.activo_id;

  select sb.sede_id
    into v_sede_bssid
    from sede_bssids sb
    where sb.bssid = new.bssid_conectado;

  if v_sede_bssid is not null and v_sede_bssid = v_sede_efectiva then
    new.estado := 'en_linea';
  else
    new.estado := 'fuera_sede';
  end if;

  return new;
end;
$$ language plpgsql;
