# Release Notes v1.1.0

Fecha: `2026-03-12` (America/Bogota)

## Resumen

`v1.1.0` consolida la app como herramienta personal diaria, con foco en consistencia y lectura semanal de resultados.

## Novedades principales

- Recordatorios de habitos mas robustos:
  - validacion de hora
  - manejo de permisos y errores
  - estado visible de recordatorio en Perfil (activo/inactivo/no disponible)
- Resumen semanal automatico en `Inicio` y `Progreso`:
  - dias activos
  - cumplimiento de habitos
  - ingresos, gastos, balance y tasa de ahorro semanal
  - misiones, XP y monedas
  - recomendacion accionable
- Exportacion de resumen semanal:
  - CSV desde pantalla `Progreso`
  - texto compartible por copia a portapapeles
- Mejora de experiencia:
  - bloque `Plan de hoy` en Home con proxima accion recomendada
  - filtros financieros rapidos: `Hoy`, `Esta semana`, `Ultimos 7 dias`, `Ultimos 30 dias`, `Mes actual`

## Calidad y validacion

- `npm run verify`: OK
- `npx expo export --platform web`: OK
- Pruebas actuales: `16 suites`, `29 tests`

## Arquitectura aplicada

- Clean Architecture ligera (domain/application/infrastructure/presentation)
- Repository Pattern para datos
- Services de aplicacion para:
  - resumen semanal
  - export CSV
  - texto compartible

## Entrega

- Rama de trabajo: `codex/v1.1.0`
- Version en `package.json`: `1.1.0`
