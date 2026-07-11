-- ============================================================================
-- Heartbeat de "sin conexión": detecta equipos que dejaron de reportar sin
-- esperar a que llegue un nuevo reporte (por definición, si el equipo está
-- apagado o sin red, nunca va a llegar nada que un trigger pueda escuchar).
--
-- Umbral: 24 horas sin un reporte real (el agente reporta cada 4-6h, así que
-- 24h ya representan varios reportes perdidos). Está hardcodeado en dos
-- lugares (la vista y la función de abajo) — si se cambia, ajustar ambos.
--
-- Diseño en dos partes:
--  1) La vista `activos_con_reporte` calcula el estado "en vivo": si el
--     último reporte real tiene más de 24h, se muestra "sin_conexion" en el
--     Dashboard/Activos/Mapa al instante, sin depender de que el cron ya
--     haya corrido. `timestamp_reporte` NO se toca — sigue mostrando la
--     fecha real del último contacto, no una fecha falsa.
--  2) Un job programado (pg_cron), cada hora, revisa qué equipos llevan más
--     de 24h en silencio y NO tienen ya una alerta abierta, y les crea la
--     alerta directamente en `alertas` (sin insertar un reporte falso en
--     `reportes`, para no ensuciar el historial real de reportes del
--     agente). Cuando el equipo vuelve a reportar, el trigger
--     `generar_alerta_por_estado` que ya existe resuelve esa alerta solo.
-- ============================================================================

-- 1) Vista: estado "en vivo" ---------------------------------------------------
create or replace view activos_con_reporte as
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
  (case
    when r.timestamp_reporte is null then null
    when r.timestamp_reporte < now() - interval '24 hours' then 'sin_conexion'
    else r.estado
  end)::character varying(20) as estado,
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

-- 2) Función que genera la alerta ---------------------------------------------
create or replace function detectar_equipos_sin_conexion()
returns void as $$
begin
  insert into alertas (activo_id, tipo, severidad, descripcion, ubicacion_ciudad, estado)
  select
    v.id,
    'sin_conexion',
    'critica',
    'El equipo dejó de reportar conexión.',
    v.ubicacion_ciudad,
    'activa'
  from activos_con_reporte v
  where v.activo = true
    and v.timestamp_reporte is not null
    and v.timestamp_reporte < now() - interval '24 hours'
    and not exists (
      select 1
      from alertas al
      where al.activo_id = v.id
        and al.estado in ('activa', 'pendiente_confirmacion')
    );
end;
$$ language plpgsql;

-- 3) Programar el job cada hora -------------------------------------------------
-- Si "create extension" falla por permisos, habilítala manualmente desde
-- Database → Extensions → buscar "pg_cron" → Enable, y vuelve a correr solo
-- el bloque de abajo (do $$ ... end $$).
create extension if not exists pg_cron;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'detectar-equipos-sin-conexion') then
    perform cron.unschedule('detectar-equipos-sin-conexion');
  end if;
end $$;

select cron.schedule(
  'detectar-equipos-sin-conexion',
  '0 * * * *',
  $$ select detectar_equipos_sin_conexion(); $$
);
