# Release Checklist V1 Final

Ejecucion final: `2026-03-13` (America/Bogota)

## 1) Producto y alcance

- [x] Objetivo V1 definido y documentado.
- [x] Alcance v1.x congelado por sprint/checklists.
- [x] KPI semanales de uso definidos.

## 2) Funcionalidad core

- [x] Onboarding completo y validado.
- [x] Habitos (crear/editar/archivar/marcar/racha).
- [x] Finanzas (ingresos/gastos/presupuesto/filtros).
- [x] Aprendizaje (capsulas sin duplicacion).
- [x] Gamificacion (XP, nivel, misiones, logros, monedas, avatar).
- [x] Plan semanal y comparativo semanal (v1.2).
- [x] Recomendaciones v2 y quick actions en Home.

## 3) Persistencia y backup

- [x] Persistencia local estable tras F5/cierre navegador.
- [x] Export/restore funcional.
- [x] Backup versionado `v2`.
- [x] Compatibilidad backward con backup `v1`.

## 4) UX/operacion

- [x] Estados vacios/carga/error visibles.
- [x] Mensajes de feedback claros (toasts).
- [x] Navegacion consistente entre tabs.
- [x] Actividad de sistema trazable en Perfil.

## 5) Arquitectura y calidad

- [x] Clean Architecture ligera (capas separadas).
- [x] Repository + Use Cases aplicados.
- [x] Servicios de negocio desacoplados (summary/comparison/recommendations).
- [x] Pruebas unitarias y de flujo base.
- [x] Comandos de calidad en verde.

## 6) Seguridad y privacidad (v1.x)

- [x] Validacion de entrada con esquemas.
- [x] Sin credenciales externas en codigo.
- [x] Politica de datos locales documentada.

## 7) Evidencia tecnica

- [x] `npm run verify` en verde (`23 suites`, `44 tests`).
- [x] `npm run verify:full` en verde (tests + export web).
- [x] `npm run test:coverage` ejecutado para baseline local.
- [x] Release notes y checklists actualizados.
