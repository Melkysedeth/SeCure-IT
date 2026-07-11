# SeCure-IT — Sistema de Gestión y Trazabilidad de Activos Tecnológicos

Archivo de contexto del proyecto — Cargar al inicio de cada sesión de trabajo.

_Última actualización: 2026-07-11._

## 🎯 Objetivo del Proyecto

Plataforma web centralizada para monitorear activos tecnológicos de la empresa (laptops Windows, tablets y celulares Android). Permite ver dónde está cada equipo, quién lo usa y su metadata básica. No es tiempo real — los equipos reportan cada 4-6 horas de forma silenciosa.

## 📋 Alcance definido (IN SCOPE)

- ✅ Dashboard web con listado de todos los activos
- ✅ Ubicación aproximada por ciudad (vía IP + GPS en Android)
- ✅ Metadata básica de cada equipo (usuario, IP, WiFi, batería, estado)
- ✅ Búsqueda y filtros (por código, serial, usuario, ciudad, estado)
- ✅ Mapa de Colombia con marcadores por ciudad
- ✅ Panel/página de detalle por equipo
- ✅ Historial de reportes por equipo (con filtros por rango de fecha y exportación a Excel)
- ✅ Alertas automáticas por cambio de estado (`sin_conexion` / `fuera_sede`), con resolución automática cuando el equipo vuelve a reportar `en_linea`
- ✅ Autenticación email + contraseña (Supabase Auth)
- ✅ Indicadores: Total activos / En línea / Fuera de sede / Sin conexión
- 🔜 Agente silencioso para Windows (.NET Worker Service) — diseñado, no implementado aún
- 🔜 Agente silencioso para Android (WorkManager, background cada 4-6h) — diseñado, no implementado aún

## 🚫 Fuera de alcance (OUT OF SCOPE — por ahora)

- ❌ Tiempo real / WebSockets
- ❌ Soporte iOS / iPhone
- ❌ Google OAuth (solo email + contraseña)
- ❌ Integración con Odoo u otros ERP
- ❌ Página dedicada de "Reportes" (hoy la exportación a Excel vive dentro de Activos e Historial; ver Roadmap)

## 🏗️ Arquitectura

```
[Agente Windows - C# .NET Worker Service]
↓ HTTPS POST cada 4-6h
[Agente Android - Kotlin + WorkManager]
↓ HTTPS POST cada 4-6h
↓
[Supabase Edge Functions - API REST]
↓
[Supabase PostgreSQL - Base de datos]
↑
[Dashboard Web - Vite + React + TypeScript]
↑ Desplegado en Netlify
```

> Nota: los agentes (Windows y Android) y el Edge Function del endpoint `/api/agent/report` son diseño aún **no implementado**. El dashboard web hoy consume la base de datos directamente vía `@supabase/supabase-js` (no hay Edge Functions creadas todavía).

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Vite + React 19 + TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui + radix-ui + lucide-react |
| Mapas | Leaflet + react-leaflet + OpenStreetMap (gratis) |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + contraseña) |
| Backend/API | Supabase Edge Functions (pendiente de crear) |
| Exportación | xlsx (SheetJS) — exportación a Excel desde Activos e Historial |
| Agente Windows | C# .NET 8 Worker Service (pendiente) |
| Agente Android | Kotlin + WorkManager (pendiente) |
| Geolocalización | ip-api.com (por IP) + GPS Android |
| Deploy | Netlify (conectado a GitHub) |

Costo total: $0/mes

## 🎨 Diseño / UI

- Color primario: `#519d99` / oscuro: `#3d7a76`
- Texto general: `#686971` / oscuro: `#3d3d42` / claro: `#9898a0`
- Tipografía: Inter → Segoe UI → Frutiger → Arial
- Sidebar: fondo `#519d99`, texto blanco, con navegación principal (Dashboard, Activos, Mapa, Alertas, Historial, Reportes) y navegación inferior (Configuración, Usuarios)
- Fondo: `#f5f5f5` / Cards: blanco con `border border-gray-100 shadow-sm rounded-xl`
- Indicadores de estado: 🟢 En línea / 🔴 Sin conexión / 🟡 Fuera de sede
- Mapa de Colombia con Leaflet (marcadores agrupados por ciudad)

---

## 📡 API — Endpoint del Agente (diseño, pendiente de implementar)

### POST `/api/agent/report`

Recibe el reporte periódico de cada agente.

**Headers:**

```
Content-Type: application/json
X-Agent-Token: [token secreto configurado en el agente]
```

**Body (JSON):**

```json
{
  "serial": "SN123456789",
  "codigo": "P155",
  "nombre_equipo": "HP-JUAN-PEREZ",
  "tipo": "laptop",
  "sistema_op": "Windows 11 Pro",
  "usuario_activo": "juan.perez",
  "ip_local": "192.168.1.25",
  "ip_publica": "181.44.35.123",
  "red_wifi": "CURELATAM_WIFI",
  "bateria": 82,
  "latitud": null,
  "longitud": null,
  "version_agente": "1.0.0"
}
```

**Comportamiento:** Inserta un nuevo registro en la tabla `reportes` (se conserva el historial completo, ya no se sobrescribe el último reporte). La ciudad se detecta en el backend con ip-api.com usando la IP pública. Un trigger de base de datos (`generar_alerta_por_estado`) evalúa el `estado` del reporte y crea/resuelve alertas automáticamente.

---

## 🖥️ Pantallas del Dashboard

### Construidas y conectadas a datos reales (Supabase)

1. **Dashboard** (`/`) — KPIs, mapa de Colombia, tabla de activos recientes y actividad reciente
2. **Activos** (`/activos`) — Listado completo con búsqueda, filtros, paginación, alta de activos (modal de registro) y baja permanente (hard delete en cascada), exportación a Excel
3. **Detalle de activo** (`/activos/:codigo`) — Vista con toda la info del equipo
4. **Mapa** (`/mapa`) — Mapa completo de Colombia con todos los activos marcados por ciudad y filtros
5. **Alertas** (`/alertas`) — KPIs de alertas, filtros (estado, severidad, tipo, ciudad), panel de detalle con tabs (Detalles / Historial / Comentarios — estos dos últimos son placeholders de UI) y flujo de resolución manual/automática
6. **Historial** (`/historial`) — Línea de reportes por activo, filtros por rango de fecha, exportación a Excel

### Pendientes

7. **Reportes** (`/reportes`) — Ruta placeholder ("próximamente"). Hoy la exportación vive embebida en Activos e Historial; falta decidir si esta pantalla es un reporte consolidado/programado o se elimina del menú
8. **Configuración** (`/configuracion`) — Placeholder ("en construcción"). Debe incluir gestión de activos y tokens de agentes
9. **Usuarios** (`/usuarios`) — Placeholder ("en construcción"). Debe incluir gestión de administradores

---

## 🗄️ Base de Datos (Supabase / PostgreSQL)

> Descripción funcional del esquema actual. No se incluye SQL — solo el propósito de cada tabla/vista y cómo se relacionan.

**Política de retención DVR quincenal**

- El sistema operará con una retención de datos tipo DVR de 15 días para la tabla `reportes`.
- Se debe programar un job diario con `pg_cron` para purgar filas antiguas:
  - `delete from reportes where timestamp_reporte < now() - interval '15 days';`
- Esta política mantiene el historial útil para el administrador, limita el crecimiento de datos dentro del plan gratuito y congela el consumo de espacio de forma predecible.
- El historial disponible en la UI quedará explícitamente acotado a los últimos 15 días; cualquier reporte más antiguo se descarta automáticamente.
- Recomendación de índices:
  - `idx_reportes_timestamp_reporte` sobre `reportes(timestamp_reporte)` para que la purga diaria sea eficiente.
  - `idx_reportes_activo_id_timestamp_reporte_desc` sobre `reportes(activo_id, timestamp_reporte DESC)` para acelerar la selección del último reporte por activo en la vista `activos_con_reporte`.

**Tablas:**

- **`activos`** — Ficha maestra de cada equipo: código, categoría, tipo (laptop/tablet/celular/desktop), marca/modelo, specs (procesador, RAM, almacenamiento, serial, MAC), sistema operativo, responsable asignado (documento, nombre, departamento), ubicación asignada (dirección, ciudad), fecha de registro, bandera de activo y observaciones.
- **`reportes`** — Historial de reportes periódicos enviados por cada agente (o sembrados manualmente al registrar un activo): usuario activo, IP local/pública, red WiFi, ciudad detectada, latitud/longitud, batería, estado (`en_linea` / `sin_conexion` / `fuera_sede`), versión del agente y timestamp. La tabla deja de ser un historial indefinido y se transforma en una ventana deslizante de 15 días, con limpieza automática diaria para controlar el consumo de espacio.
- **`alertas`** — Alertas generadas por cambios de estado de un activo: tipo, severidad, descripción, estado (`activa` / `pendiente_confirmacion` / `resuelta`), ciudad, `created_at` y `resolved_at`.

**Vistas:**

- **`activos_con_reporte`** — `activos` unido con su reporte más reciente (estado, ubicación, batería, timestamp). Es la fuente de datos del Dashboard, Activos, Mapa y Detalle de Activo. Esta vista no requiere cambios por la retención de 15 días: sigue tomando el último `reportes` disponible y expone los mismos campos que consume el frontend.
- **`alertas_con_activo`** — `alertas` unida con los datos del activo relacionado (código, nombre del equipo, responsable, departamento) para evitar joins del lado del cliente.

**Automatización a nivel de base de datos:**

- **Trigger `generar_alerta_por_estado`** — Al insertarse un reporte con estado `sin_conexion` o `fuera_sede`, crea automáticamente una alerta activa para ese equipo. Cuando el equipo vuelve a reportar `en_linea`, el mismo trigger resuelve la alerta (`estado = 'resuelta'`). La resolución manual desde la UI no cierra la alerta de inmediato: la deja en `pendiente_confirmacion` hasta que el trigger confirme el reporte real del agente.
- **Trigger `trg_calcular_estado_geofencing`** — El trigger actual de geofencing puede seguir funcionando sin cambios. Solo actúa antes de insertar un nuevo reporte y no depende de conservar reportes más allá de la ventana de retención. Si en un caso extremo el activo no ha reportado en más de 15 días, el fallback de estado en el trigger puede limitarse a `en_linea` cuando no existe un reporte previo disponible, pero esto no rompe la lógica ni la vista.
- **Job de purga diaria** — Un `pg_cron` programado debe ejecutar la limpieza de `reportes` antiguos cada 24 horas. Con una retención de 15 días, `activos_con_reporte` seguirá mostrando el último reporte reciente y el frontend seguirá funcionando con la misma vista y lógica de estado.

**Baja de activos:** Es un hard delete manual desde el cliente (`darDeBajaActivo`), que borra en orden `alertas` → `reportes` → `activos` por `activo_id`, sin depender de `ON DELETE CASCADE` a nivel de base de datos.

---

## 📅 Fases de Desarrollo

### Fase 1 — Core Web ✅ (completada, salvo lo anotado)

- [x] Diseño y creación de base de datos en Supabase (incluye tablas `activos`, `reportes`, `alertas` y vistas `activos_con_reporte`, `alertas_con_activo`)
- [x] Dashboard web: layout, sidebar, KPIs
- [x] Dashboard web: tabla de activos + búsqueda + filtros + alta/baja de activos
- [x] Dashboard web: mapa con Leaflet
- [x] Dashboard web: página y panel de detalle del equipo
- [x] Autenticación con Supabase Auth (login + logout + rutas protegidas)
- [x] Página de Alertas (generación automática vía trigger + resolución manual/automática)
- [x] Página de Historial (con filtros y exportación a Excel)
- [ ] Edge Function: endpoint del agente (`POST /api/agent/report`) — **pendiente**
- [ ] Página Configuración — **pendiente**
- [ ] Página Usuarios — **pendiente**

### Fase 2 — Agente Windows (C# .NET 8) — **pendiente**

- [ ] Worker Service que reporta cada 4-6h
- [ ] Recopila: serial, usuario Windows, IP local/pública, WiFi, batería

### Fase 3 — Agente Android (Kotlin) — **pendiente**

- [ ] WorkManager background cada 4-6h
- [ ] GPS + WiFi + batería

### Fase 4 — Mejoras

- [x] Alertas automáticas por cambio de estado
- [x] Historial de reportes por equipo
- [x] Exportación a Excel (Activos e Historial)
- [ ] Job de retención DVR quincenal en `reportes` (pg_cron / purga 15 días)
- [ ] Notificaciones por correo

---

## 🧭 Roadmap / Por Planear (crítico, aún sin diseñar)

Estos puntos son desafíos de producto/arquitectura que todavía **no** tienen una solución definida y deben resolverse antes o durante el desarrollo de los agentes:

### 1. Lógica de Geofencing ("fuera de sede")

Falta definir cómo se determina y verifica que un activo está fuera de la ubicación permitida:

- ¿Cómo se define el perímetro/sede permitida por activo o por ciudad asignada (radio, dirección, polígono)?
- ¿La verificación se hace en el agente (comparando su IP/GPS contra la sede) o en el backend al recibir el reporte?
- ¿Qué pasa cuando un activo cambia de sede legítimamente (traslado, préstamo)? ¿Requiere una actualización manual de "ciudad/sede asignada" antes de viajar?
- Cómo interactúa esto con el trigger `generar_alerta_por_estado` (hoy solo reacciona al campo `estado` del reporte, no calcula geofencing por sí mismo).

### 2. Alerta de "Sin Conexión" (heartbeat / timeout)

Falta definir la estrategia para detectar cuando un equipo está apagado o el agente dejó de enviar datos:

- Hoy el KPI de "Sin conexión" se referencia como "> 7 días sin reporte" en el Dashboard, pero no hay un job/verificación periódica que recalcule este estado de forma proactiva — depende de que llegue un nuevo reporte para reflejarse.
- Definir un mecanismo de heartbeat/timeout (job programado, Edge Function con cron, o vista calculada) que marque un activo como `sin_conexion` cuando pasa cierto umbral sin reportar, sin esperar a un nuevo reporte del agente.
- Decidir el umbral real (¿7 días? ¿configurable por tipo de activo?) y si debe generar alerta automáticamente vía el mismo trigger o uno nuevo.

### 3. Integración con Android

Falta definir el comportamiento específico del agente Android, que **difiere del agente Windows**:

- Los dispositivos Android **no deben marcar "fuera de sede"** — no aplica el concepto de geofencing para ellos.
- En su lugar, deben registrar y mostrar **constantemente** su ubicación actual (GPS), a diferencia de Windows que reporta solo ubicación aproximada por IP.
- Falta definir si esto implica un campo/bandera distinta en `activos` o `reportes` para diferenciar el comportamiento esperado por tipo de dispositivo, y cómo se refleja esa diferencia en el Mapa y en el cálculo de alertas.

---

## 🔐 Seguridad

- Dashboard protegido con Supabase Auth (solo admins) — implementado
- Agentes autenticados con token estático en headers (`X-Agent-Token`) — diseño, pendiente de implementar junto con el Edge Function
- HTTPS en todas las comunicaciones
- Supabase RLS (Row Level Security) habilitado en tablas

---

## 📁 Estructura del Repositorio (planeada)

```
SECURE-IT/
│
├── 📁 web/ ← El dashboard (Vite + React)
│ ├── 📁 src/
│ │ ├── 📁 assets/ ← Logos, íconos
│ │ ├── 📁 components/
│ │ │ ├── 📁 layout/
│ │ │ │ ├── Sidebar.tsx ← Menú lateral
│ │ │ │ ├── Header.tsx ← Barra superior
│ │ │ │ └── Layout.tsx ← Wrapper general
│ │ │ ├── 📁 ui/ ← Botones, badges, cards (shadcn)
│ │ │ ├── 📁 dashboard/
│ │ │ │ ├── KPICards.tsx ← Los 4 contadores superiores
│ │ │ │ ├── AssetsTable.tsx ← Tabla de activos
│ │ │ │ └── RecentActivity.tsx
│ │ │ ├── 📁 map/
│ │ │ │ └── ColombiaMap.tsx ← Mapa con Leaflet
│ │ │ └── 📁 assets/
│ │ │ ├── AssetDetail.tsx ← Panel lateral del equipo
│ │ │ └── AssetRow.tsx ← Fila de la tabla
│ │ ├── 📁 pages/
│ │ │ ├── Dashboard.tsx ← Página principal
│ │ │ ├── Assets.tsx ← Listado completo
│ │ │ ├── Map.tsx ← Mapa pantalla completa
│ │ │ ├── Settings.tsx ← Configuración
│ │ │ └── Login.tsx ← Autenticación
│ │ ├── 📁 lib/
│ │ │ └── supabase.ts ← Cliente de Supabase
│ │ ├── 📁 hooks/
│ │ │ ├── useAssets.ts ← Datos de activos
│ │ │ └── useAuth.ts ← Autenticación
│ │ ├── 📁 types/
│ │ │ └── index.ts ← Interfaces TypeScript
│ │ ├── App.tsx
│ │ └── main.tsx
│ ├── index.html
│ ├── vite.config.ts
│ ├── tailwind.config.ts
│ └── package.json
│
├── 📁 agent-windows/ ← Agente C# (Fase 1)
│ └── 📁 SECURE-IT.Agent/
│ ├── Worker.cs ← Servicio background
│ ├── Models/DeviceInfo.cs ← Modelo del reporte
│ ├── Services/ReportService.cs ← Lógica de envío
│ └── appsettings.json ← Config (URL API, token)
│
├── 📁 agent-android/ ← Agente Android (Fase 2)
│ └── 📁 app/
│
├── 📁 supabase/
│ ├── 📁 migrations/
│ │ └── 001_initial.sql ← El SQL que ya tenemos
│ └── 📁 functions/
│ └── 📁 agent-report/
│ └── index.ts ← Edge Function de la API
│
└── README.md
```

> Esta estructura es el diseño planeado del repositorio completo (incluyendo agentes, aún no desarrollados). El código actual del dashboard vive en la raíz del repo (no bajo `web/`) — ver el árbol real de `src/` para la ubicación exacta de cada archivo hoy.

---

## 🔐 Supabase

- URL: `https://rtyksatnoipoxcybxrgq.supabase.co`
- Proyecto: SeCure-IT
- Auth: Email + contraseña habilitado
- Usuarios admin: crear en Supabase → Authentication → Users → Add user
