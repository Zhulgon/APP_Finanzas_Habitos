# Release Notes v1.2.0

Fecha: `2026-03-13` (America/Bogota)

## Resumen

`v1.2.0` convierte la app en una herramienta semanal mas accionable:

- plan semanal configurable (habitos + ahorro),
- comparativo semanal actual vs anterior,
- recomendaciones priorizadas por impacto,
- registro rapido desde Inicio,
- backup versionado `v2` compatible con `v1`.

## Novedades principales

- Planeador semanal:
  - metas semanales de habitos y ahorro
  - progreso y estado (`sin plan`, `en riesgo`, `en curso`, `logrado`)
- Comparativo semanal:
  - delta de habitos, balance, XP y monedas
  - tendencia (`mejorando`, `estable`, `en retroceso`) + recomendacion
- Recommendation Engine v2:
  - reglas por consistencia, finanzas, aprendizaje y plan semanal
  - prioridad visible (`alta`, `media`, `baja`)
- Quick Actions en Home:
  - marcar habito rapido
  - registrar ingreso rapido
  - registrar gasto rapido
- Backup v2:
  - export en `version: 2`
  - import de `v2` y `v1` con normalizacion backward-compatible

## Calidad y validacion

- `npm run verify`: OK (`22 suites`, `42 tests`)
- `npx expo export --platform web`: OK

## Arquitectura y patrones usados

- Clean Architecture ligera.
- Repository Pattern para `WeeklyPlan` y acceso a datos por rango.
- Use Case Pattern para reglas de plan semanal.
- Strategy/Rule-based service para recomendaciones (`recommendationEngineV2`).
- Compatibilidad backward para backup (`v1 -> v2`).

## Entrega

- Rama de trabajo: `codex/v1.2.0`
- Version en `package.json`: `1.2.0`
