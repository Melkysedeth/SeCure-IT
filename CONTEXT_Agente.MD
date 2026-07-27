# Agente Windows — Monitoreo de Activos

## Qué hace
Cada `IntervaloMinutos` (15 min para las pruebas iniciales) recolecta:
usuario de Windows con sesión activa, IP local, IP pública, SSID/BSSID de WiFi
(si el equipo está conectado por WiFi), y porcentaje de batería (si aplica).
Lo envía por HTTPS a la Edge Function `reportar-agente`. **No calcula el
`estado`** ("en línea"/"fuera de sede") — eso lo decide el trigger de la base
de datos según el BSSID que reciba.

## 1. Requisitos
- .NET 8 SDK: https://dotnet.microsoft.com/download
- Windows 10/11 o Windows Server (para correr como servicio)

## 2. Configurar antes de compilar
Edita `appsettings.json`:
```json
{
  "Agente": {
    "Codigo": "LAP-001",              // <- código real del activo en tu inventario
    "EdgeFunctionUrl": "https://TU_PROJECT_REF.supabase.co/functions/v1/reportar-agente",
    "ApiKey": "la-misma-clave-de-AGENT_API_KEY-en-supabase",
    "IntervaloMinutos": 15,
    "VersionAgente": "1.0.0-windows"
  }
}
```
**Cada equipo necesita su propio `Codigo`** — es como el agente sabe de qué activo está
reportando. Todo lo demás puede quedar igual en todos los equipos de prueba.

## 3. Probar en consola (antes de instalarlo como servicio)
```bash
cd agente-windows
dotnet run
```
Deberías ver en la consola `"Reporte enviado correctamente para el activo LAP-001."`
cada `IntervaloMinutos`. Revisa la tabla `reportes` en Supabase para confirmar que
llegó. Si ves `"El servidor rechazó el reporte..."`, revisa el mensaje — normalmente
es la `ApiKey` mal copiada o el `Codigo` no existe en la tabla `activos`.

## 4. Publicar el ejecutable
```bash
dotnet publish -c Release -r win-x64 --self-contained true -o ./publicado
```
Esto genera `./publicado/AgenteActivos.exe`, un ejecutable único que no necesita
tener .NET instalado en el equipo destino.

## 5. Instalar como servicio de Windows
Copia la carpeta `publicado` al equipo (ej. `C:\AgenteActivos\`) y, en PowerShell
**como administrador**:

```powershell
sc.exe create "AgenteMonitoreoActivos" binPath= "C:\AgenteActivos\AgenteActivos.exe" start= auto
sc.exe start "AgenteMonitoreoActivos"
```

Para revisar que esté corriendo:
```powershell
sc.exe query "AgenteMonitoreoActivos"
```

Los logs (incluyendo errores) se ven en el **Visor de eventos de Windows**
(`Registros de Windows > Aplicación`, buscar por el nombre del servicio).

## 6. Desinstalar (si algo sale mal en las pruebas)
```powershell
sc.exe stop "AgenteMonitoreoActivos"
sc.exe delete "AgenteMonitoreoActivos"
```

## Pendiente para cuando pases de prueba a producción
- Cambiar `IntervaloMinutos` de 15 a las 4-6 horas reales (documento original).
- Evaluar clave por dispositivo en vez de una compartida (ver nota de seguridad
  en el README de la Edge Function).
- Confirmar con el trigger `calcular_estado_geofencing()` qué pasa con equipos
  sin WiFi (cable) antes de instalar esto en desktops — con laptops WiFi no hay
  problema.