-- ============================================================================
-- Geofencing por sede (BSSID) + catálogo de sedes
--
-- Reemplaza el texto libre `activos.ciudad_asignada` / `activos.direccion`
-- por una sede real con coordenadas, y calcula el estado `fuera_sede` de
-- forma automática comparando la BSSID (MAC del punto de acceso WiFi) a la
-- que está conectado el equipo contra las BSSID conocidas de cada sede.
--
-- Por qué BSSID y no distancia GPS/IP: el agente Windows solo tiene IP
-- pública (geolocalización a nivel de ciudad, error de varios km — no sirve
-- para un radio de 150-200 m) y no tiene GPS. La BSSID identifica el punto
-- de acceso físico aunque todas las sedes transmitan el mismo SSID
-- ("CURE LATAM").
--
-- Los datos actuales en `activos`/`reportes` son sintéticos (de prueba) —
-- este script asume que se van a truncar y recargar, no migrar.
-- ============================================================================

-- 1) Catálogo de sedes -------------------------------------------------------
create table if not exists sedes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  ciudad text not null,
  direccion text,
  latitud double precision not null,
  longitud double precision not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table sedes enable row level security;

create policy "authenticated_full_access_sedes"
  on sedes for all
  to authenticated
  using (true)
  with check (true);

-- 2) Puntos de acceso conocidos por sede -------------------------------------
-- Una sede puede tener varios AP; cada BSSID solo puede pertenecer a una sede.
create table if not exists sede_bssids (
  id uuid primary key default gen_random_uuid(),
  sede_id uuid not null references sedes(id) on delete cascade,
  bssid text not null unique,
  descripcion text,
  created_at timestamptz not null default now()
);

alter table sede_bssids enable row level security;

create policy "authenticated_full_access_sede_bssids"
  on sede_bssids for all
  to authenticated
  using (true)
  with check (true);

-- 3) La vista actual (creada fuera de este repo, directamente en Supabase)
--    lee `activos.ciudad_asignada`/`activos.direccion` como columnas reales
--    de la tabla base. Hay que soltarla ANTES de tocar esas columnas, si no
--    Postgres rechaza el DROP COLUMN por dependencia de objeto.
drop view if exists activos_con_reporte;

-- 4) activos: sede_id reemplaza ciudad_asignada/direccion --------------------
-- sede_temporal_id + sede_temporal_hasta cubren préstamos/traslados
-- autorizados: mientras esté vigente, la geocerca se evalúa contra la sede
-- temporal en vez de la permanente, sin generar alertas falsas.
alter table activos
  add column if not exists sede_id uuid references sedes(id),
  add column if not exists sede_temporal_id uuid references sedes(id),
  add column if not exists sede_temporal_hasta timestamptz;

alter table activos
  drop column if exists ciudad_asignada,
  drop column if exists direccion;

-- 5) reportes: BSSID reportada por el agente ---------------------------------
alter table reportes
  add column if not exists bssid_conectado text;

-- 6) Vista activos_con_reporte (redefinida) ----------------------------------
-- Se mantienen los nombres de columna `ciudad_asignada` y `direccion` (ahora
-- alimentados desde `sedes`) para que el frontend existente no tenga que
-- cambiar sus lecturas.
create view activos_con_reporte as
select
  a.id,
  a.codigo,
  a.categoria,
  a.tipo,
  a.nombre_equipo,
  a.marca,
  a.modelo,
  a.procesador,
  a.memoria_ram,
  a.almacenamiento,
  a.serial,
  a.direccion_mac,
  a.sistema_op,
  a.version_so,
  a.dominio,
  a.tipo_documento,
  a.numero_documento,
  a.nombre_responsable,
  a.departamento,
  a.fecha_registro,
  a.activo,
  a.observaciones,
  a.sede_id,
  s.nombre as sede_nombre,
  s.ciudad as ciudad_asignada,
  s.direccion as direccion,
  s.latitud as sede_latitud,
  s.longitud as sede_longitud,
  r.usuario_activo,
  r.ip_local,
  r.ip_publica,
  r.red_wifi,
  r.bssid_conectado,
  r.ubicacion_ciudad,
  r.latitud,
  r.longitud,
  r.bateria,
  r.estado,
  r.version_agente,
  r.timestamp_reporte
from activos a
left join sedes s
  on s.id = coalesce(
       case
         when a.sede_temporal_hasta is not null and a.sede_temporal_hasta > now()
           then a.sede_temporal_id
         else null
       end,
       a.sede_id
     )
left join lateral (
  select *
  from reportes rp
  where rp.activo_id = a.id
  order by rp.timestamp_reporte desc
  limit 1
) r on true;

-- 7) Cálculo automático de estado por BSSID -----------------------------------
-- Corre BEFORE INSERT para que el trigger existente `generar_alerta_por_estado`
-- (que lee NEW.estado en AFTER INSERT) reciba el estado ya corregido.
--
-- Reglas:
--  - Si el reporte no trae bssid_conectado (ej. el reporte sembrado al
--    registrar el activo, o un dispositivo sin WiFi) no se toca el estado:
--    se respeta lo que el caller haya puesto explícitamente.
--  - BSSID conocida de la sede efectiva del activo -> en_linea.
--  - BSSID conocida de OTRA sede -> fuera_sede (evidencia física real).
--  - BSSID desconocida (datos móviles, red doméstica, caída del internet de
--    la sede) -> NO se marca fuera_sede a ciegas; se conserva el último
--    estado conocido del equipo, para no generar falsos positivos cuando el
--    equipo sigue físicamente en la sede pero cambió de red por una
--    interrupción del servicio.
create or replace function calcular_estado_geofencing()
returns trigger as $$
declare
  v_sede_efectiva uuid;
  v_sede_bssid uuid;
  v_ultimo_estado text;
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
  elsif v_sede_bssid is not null then
    new.estado := 'fuera_sede';
  else
    select rp.estado
      into v_ultimo_estado
      from reportes rp
      where rp.activo_id = new.activo_id
      order by rp.timestamp_reporte desc
      limit 1;

    new.estado := coalesce(v_ultimo_estado, 'en_linea');
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_calcular_estado_geofencing on reportes;

create trigger trg_calcular_estado_geofencing
  before insert on reportes
  for each row
  execute function calcular_estado_geofencing();
