# Release Notes v1.0.0

Fecha: `2026-03-12` (America/Bogota)

## Resumen

Se cierra `v1.0.0` como version funcional para uso personal diario:

- Habitos con creacion, edicion, archivado, rachas y progreso semanal.
- Finanzas personales con ingresos, gastos, presupuestos y filtro por rango de fechas.
- Educacion financiera con capsulas y control de completado no duplicado.
- Gamificacion avanzada: XP por dimensiones, nivel/rango, misiones, logros, monedas, tienda de avatar, comodin de racha y timeline.
- Persistencia local robusta y backup/restore con archivo.

## Arquitectura y metodo aplicados

- Clean Architecture ligera (`domain`, `application`, `infrastructure`, `presentation`).
- Repository Pattern para aislar almacenamiento.
- Use Case Pattern para reglas de negocio.
- Eventos de dominio + motor de gamificacion desacoplado.
- Estado centralizado con Zustand como single source of truth.

## Calidad de release

- `npx tsc --noEmit`: OK.
- `npm test -- --runInBand`: OK (`13 suites`, `23 tests`).
- `npx expo export --platform web`: OK.
- Smoke test e2e-logico: `tests/flows/appSmokeFlow.test.ts`.

## Entrega

- Branch de trabajo: `codex/v1.0`.
- Version en `package.json`: `1.0.0`.
