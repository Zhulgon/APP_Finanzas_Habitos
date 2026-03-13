# Release Checklist v1.1

Ejecucion tecnica automatizada: `2026-03-12` (America/Bogota)

## 1) Calidad tecnica

- [x] `npm run verify` en verde.
- [x] `npx expo export --platform web` en verde.

## 2) Recordatorios robustos

- [ ] Activar recordatorio con hora valida (ej: 20:00) y ver mensaje de exito.
- [ ] Validar estado visible en `Perfil` (activo/inactivo/no disponible).
- [ ] Desactivar recordatorio y verificar estado actualizado.
- [ ] Intentar hora invalida y validar mensaje de error.

## 3) Resumen semanal automatico

- [ ] Ver bloque en `Inicio` con periodo y metricas.
- [ ] Ver bloque detallado en `Progreso`.
- [ ] Confirmar que cambia tras registrar habitos/finanzas/aprendizaje.

## 4) Exportacion CSV semanal

- [ ] Exportar desde `Progreso`.
- [ ] Abrir archivo y validar columnas `campo,valor`.
- [ ] Confirmar presencia de `periodo`, `balance`, `xp_ganada`, `recomendacion`.

## 5) UX de finanzas

- [ ] Probar filtros: `Hoy`, `Esta semana`, `Ultimos 7 dias`, `Ultimos 30 dias`, `Mes actual`.
- [ ] Cambiar fechas manualmente y validar estado `custom`.
- [ ] Ver resumen de rango consistente con lista de movimientos.
