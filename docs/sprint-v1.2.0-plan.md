# Sprint Plan v1.2.0

Fecha sugerida de inicio: `2026-03-16`  
Duracion sugerida: `2 semanas`  
Metodo: `Scrum-lite + Kanban (WIP max 2)`

## 1) Objetivo del sprint

Convertir la app en un sistema de seguimiento semanal mas inteligente, accionable y estable para uso real diario.

Resultado esperado de negocio personal:

- Menos friccion para registrar actividad.
- Mejor lectura de tendencia (no solo estado actual).
- Decisiones semanales mas claras sobre habitos y dinero.

## 2) KPI de exito (medibles)

- Tiempo promedio de registro (habito o gasto): `<= 20s`.
- Dias activos por semana: `+1` respecto a baseline de v1.1.
- Semanas con balance positivo: `>= 3 de 4`.
- Uso de resumen semanal (copiar o exportar): `>= 1 por semana`.

## 3) Alcance (MoSCoW)

### Must

- Planeador semanal:
  - objetivo semanal de habitos
  - objetivo de ahorro semanal
  - estado de avance diario
- Comparativo semana vs semana:
  - habitos (%)
  - balance
  - XP y monedas
- Registro rapido unificado:
  - acceso rapido para crear habito/gasto/ingreso desde Home
- Motor de recomendaciones v2 (reglas):
  - recomendaciones priorizadas por impacto
  - semaforo de accion (`alta`, `media`, `baja`)
- Robustez de datos:
  - backup versionado `v2` compatible con `v1`
  - validaciones de integridad en import

### Should

- Misiones semanales dependientes del planeador semanal.
- Alertas de desviacion de ahorro semanal.

### Could

- Minigrafica sparkline en Dashboard.

### Wont (v1.2)

- Sync cloud multi-dispositivo.
- Multiusuario.
- Integracion bancaria automatica.

## 4) Historias de usuario

1. Como usuario quiero fijar metas semanales para saber que debo cumplir esta semana.
2. Como usuario quiero comparar esta semana vs la anterior para entender si voy mejorando.
3. Como usuario quiero registrar rapido sin entrar a muchas pantallas.
4. Como usuario quiero recomendaciones concretas para actuar hoy.
5. Como usuario quiero importar/exportar con seguridad para no perder progreso.

## 5) Backlog tecnico (ejecucion 1 por 1)

1. [x] Crear entidad `WeeklyPlan` y contrato de repositorio.
2. [x] Implementar repositorio Web/SQLite para `weekly_plan`.
3. [x] Crear casos de uso:
   - `setWeeklyHabitTarget`
   - `setWeeklySavingsTarget`
   - `getWeeklyPlanProgress`
4. [x] Crear servicio `weeklyComparison.ts` (semana actual vs anterior).
5. [ ] Crear servicio `recommendationEngineV2.ts` con estrategia por prioridad.
6. [x] Integrar en store central (`useAppStore`) modulo `weeklyPlan`.
   - [ ] `weeklyComparison`
   - [ ] `recommendationsV2`
7. [ ] Crear bloque UI `Plan semanal` en Dashboard.
8. [x] Crear bloque UI `Comparativo semanal` en Progreso.
9. Crear `QuickActionsPanel` (registro rapido) en Home.
10. Migrar backup a schema version `2` con compatibilidad backward.
11. [x] Tests unitarios base:
    - [x] casos de uso de plan semanal
    - [ ] comparativo semanal
    - [ ] motor de recomendaciones v2
12. QA manual + checklist v1.2.

## 6) Arquitectura y patrones (v1.2)

- Clean Architecture (sin romper capas actuales).
- Repository Pattern:
  - nuevos contratos para plan semanal y comparativos.
- Use Case Pattern:
  - toda regla de negocio va en casos de uso, no en UI.
- Strategy Pattern:
  - `recommendationEngineV2` con estrategias por tipo de riesgo (`consistencia`, `finanzas`, `aprendizaje`).
- Specification Pattern:
  - reutilizable para activar recomendaciones por condicion.
- Backward Compatibility Pattern:
  - migradores por version para backup (`v1 -> v2`).

## 7) Metodologia de trabajo

## 7.1 Flujo de sprint

1. Planning (30 min):
   - seleccionar maximo 5 historias.
2. Ejecucion diaria:
   - WIP max 2
   - una historia en `doing` por vez.
3. Verify:
   - pruebas + validacion manual breve.
4. Review/retro (20 min):
   - que ayudo, que estorbo, que se corta para v1.3.

## 7.2 Definition of Ready (DoR)

- Historia con criterio de aceptacion claro.
- Impacto de datos identificado (si hay migracion).
- Estrategia de prueba definida.

## 7.3 Definition of Done (DoD)

- Implementacion funcional.
- `npm run verify` en verde.
- `npx expo export --platform web` en verde.
- Mensajes de error/success claros.
- Documentacion actualizada (README + release notes/checklist).

## 8) Riesgos y mitigaciones

- Riesgo: sobrecargar Home con demasiados widgets.
  - Mitigacion: priorizar 3 bloques maximos visibles.
- Riesgo: migracion de backup rompa data anterior.
  - Mitigacion: parser versionado + pruebas de compatibilidad.
- Riesgo: recomendaciones genericas de poco valor.
  - Mitigacion: reglas enfocadas en acciones concretas del dia.

## 9) Entregables de release

- `docs/release-checklist-v1.2.md`
- `docs/release-notes-v1.2.0.md`
- Tag `v1.2.0`
