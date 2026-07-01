SeCure-IT — Sistema de Gestión y Trazabilidad de Activos Tecnológicos

Archivo de contexto del proyecto — Cargar al inicio de cada sesión de trabajo.

🎯 Objetivo del Proyecto

Plataforma web centralizada para monitorear activos tecnológicos de la empresa (laptops Windows, tablets y celulares Android). Permite ver dónde está cada equipo, quién lo usa y su metadata básica. No es tiempo real — los equipos reportan cada 4-6 horas de forma silenciosa.

📋 Alcance definido (IN SCOPE)

✅ Dashboard web con listado de todos los activos
✅ Ubicación aproximada por ciudad (vía IP + GPS en Android)
✅ Metadata básica de cada equipo (usuario, IP, WiFi, batería, estado)
✅ Búsqueda y filtros (por código, serial, usuario, ciudad, estado)
✅ Mapa de Colombia con marcadores por ciudad
✅ Panel lateral de detalle por equipo
✅ Agente silencioso para Windows (.NET Worker Service)
✅ Agente silencioso para Android (WorkManager, background cada 4-6h)
✅ Autenticación email + contraseña (Supabase Auth)
✅ Indicadores: Total activos / En línea / Fuera de sede / Sin conexión

🚫 Fuera de alcance (OUT OF SCOPE — por ahora)

❌ Tiempo real / WebSockets
❌ Histórico completo de movimientos (solo se guarda el último reporte)
❌ Alertas automáticas (Fase 3)
❌ Soporte iOS / iPhone
❌ Google OAuth (solo email + contraseña)
❌ Integración con Odoo u otros ERP
❌ Reportes exportables (Fase 3)

🏗️ Arquitectura

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

🛠️ Stack Tecnológico

CapaTecnologíaFrontendVite + React + TypeScriptUITailwind CSS + shadcn/ui (radix-nova)MapasLeaflet + OpenStreetMap (gratis)Base de datosSupabase (PostgreSQL)AuthSupabase Auth (email + contraseña)Backend/APISupabase Edge FunctionsAgente WindowsC# .NET 8 Worker ServiceAgente AndroidKotlin + WorkManagerGeolocalizaciónip-api.com (por IP) + GPS AndroidDeployNetlify (conectado a GitHub)

Costo total: $0/mes

🎨 Diseño / UI

Color primario: #519d99
Color primario oscuro: #3d7a76
Texto general: #686971 / oscuro: #3d3d42 / claro: #9898a0
Tipografía: Inter → Segoe UI → Frutiger → Arial
Sidebar: fondo #519d99, texto blanco
Fondo: #f5f5f5 / Cards: blanco con border border-gray-100 shadow-sm rounded-xl

## 🗄️ Modelo de Base de Datos

### Tabla: `activos`

```sql
CREATE TABLE activos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo          VARCHAR(20) UNIQUE NOT NULL,   -- P155, P098...
  nombre          VARCHAR(100) NOT NULL,          -- HP EliteBook 840
  tipo            VARCHAR(20) NOT NULL,           -- laptop | tablet | celular | desktop
  sistema_op      VARCHAR(50),                    -- Windows 11 Pro / Android 13
  serial          VARCHAR(100) UNIQUE,
  propietario     VARCHAR(100),                   -- usuario asignado formalmente
  ciudad_asignada VARCHAR(100),                   -- ciudad base del equipo
  fecha_registro  TIMESTAMP DEFAULT NOW(),
  activo          BOOLEAN DEFAULT TRUE
);
```

### Tabla: `reportes` (solo el último por equipo)

```sql
CREATE TABLE reportes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activo_id         UUID REFERENCES activos(id) ON DELETE CASCADE,
  usuario_activo    VARCHAR(100),                 -- usuario Windows/Android activo
  ip_local          VARCHAR(45),
  ip_publica        VARCHAR(45),
  red_wifi          VARCHAR(100),                 -- SSID de la red
  ubicacion_ciudad  VARCHAR(100),                 -- ciudad detectada
  latitud           DECIMAL(10, 8),
  longitud          DECIMAL(11, 8),
  bateria           INTEGER,                      -- porcentaje 0-100
  estado            VARCHAR(20),                  -- en_linea | sin_conexion | fuera_sede
  version_agente    VARCHAR(20),
  timestamp_reporte TIMESTAMP DEFAULT NOW(),
  UNIQUE(activo_id)                               -- un solo reporte por equipo (upsert)
);
```

### Vista: `activos_con_reporte` (para el dashboard)

```sql
CREATE VIEW activos_con_reporte AS
  SELECT a.*, r.usuario_activo, r.ip_local, r.ip_publica,
         r.red_wifi, r.ubicacion_ciudad, r.latitud, r.longitud,
         r.bateria, r.estado, r.version_agente, r.timestamp_reporte
  FROM activos a
  LEFT JOIN reportes r ON r.activo_id = a.id;
```

---

## 📡 API — Endpoint del Agente

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

**Comportamiento:** Hace UPSERT en tabla `reportes`. La ciudad se detecta en el backend con ip-api.com usando la IP pública.

---

## 🖥️ Pantallas del Dashboard

1. **Dashboard principal** — KPIs + mapa Colombia + tabla activos recientes + actividad reciente
2. **Activos** — Listado completo con búsqueda, filtros y paginación
3. **Detalle de activo** — Panel con toda la info del equipo (panel lateral)
4. **Mapa** — Mapa completo de Colombia con todos los activos marcados por ciudad
5. **Alertas** (Fase 3)
6. **Historial** (Fase 3)
7. **Reportes** (Fase 3)
8. **Configuración** — Gestión de activos, tokens de agentes
9. **Usuarios** — Gestión de administradores

---

## 🎨 Diseño / UI

- Referencia visual: imagen de mockup compartida (dashboard con sidebar verde oscuro)
- Sidebar izquierdo con navegación
- Color primario: verde (#2d6a4f o similar)
- Cards con KPIs en la parte superior
- Tabla de activos en la parte inferior
- Panel lateral deslizable con detalle del equipo
- Indicadores de estado: 🟢 En línea / 🔴 Sin conexión / 🟡 Fuera de sede
- Mapa de Colombia con Leaflet (clusters por ciudad)

---

## 📅 Fases de Desarrollo

### Fase 1 — Core (actual)

- [ ] Diseño y creación de base de datos en Supabase
- [ ] Edge Function: endpoint del agente (`POST /api/agent/report`)
- [ ] Dashboard web: layout, sidebar, KPIs
- [ ] Dashboard web: tabla de activos + búsqueda + filtros
- [ ] Dashboard web: mapa con Leaflet
- [ ] Dashboard web: panel de detalle del equipo
- [ ] Agente Windows: C# .NET Worker Service
- [ ] Autenticación con Supabase Auth

### Fase 2 — Agente Android

- [ ] App Android (Kotlin) con WorkManager
- [ ] Background reporting silencioso cada 4-6h
- [ ] Obtención de GPS, WiFi, batería, usuario

### Fase 3 — Mejoras

- [ ] Alertas por inactividad (+7 días sin reporte)
- [ ] Historial de reportes por equipo
- [ ] Exportación de reportes (CSV/PDF)
- [ ] Notificaciones por correo

---

## 🔐 Seguridad

- Dashboard protegido con Supabase Auth (solo admins)
- Agentes autenticados con token estático en headers (`X-Agent-Token`)
- HTTPS en todas las comunicaciones
- Supabase RLS (Row Level Security) habilitado en tablas

---

## 📁 Estructura del Repositorio (planeada)

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

🔐 Supabase

URL: https://rtyksatnoipoxcybxrgq.supabase.co
Proyecto: SeCure-IT
Auth: Email + contraseña habilitado
Usuarios admin: crear en Supabase → Authentication → Users → Add user

📅 Estado de Fases

Fase 1 — Core Web

Setup proyecto (Vite + React + TS + Tailwind + shadcn)
Layout completo (Sidebar + Header + routing)
Dashboard (KPIs + mapa + actividad + alertas + tabla)
Página Activos (filtros + tabla + modal registrar)
Página Mapa (Leaflet + filtros + panel detalle)
Página Detalle del Activo (3 cols + tabs Info/Historial)
Autenticación Supabase Auth (login + logout)
Base de datos v2 creada en Supabase
PRÓXIMO: Conectar Supabase (reemplazar mockData por queries reales)
Edge Function: endpoint del agente
Página Configuración
Página Usuarios

Fase 2 — Agente Windows (C# .NET 8)

Worker Service que reporta cada 4-6h
Recopila: serial, usuario Windows, IP local/pública, WiFi, batería

Fase 3 — Agente Android (Kotlin)

WorkManager background
GPS + WiFi + batería

Fase 4 — Mejoras

Alertas por inactividad
Exportación CSV/PDF
Notificaciones por correo
