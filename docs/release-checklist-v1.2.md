# Release Checklist v1.2

Ejecucion final: `2026-03-13` (America/Bogota)

## 1) Calidad tecnica

- [x] `npm run verify` en verde.
- [x] `npx expo export --platform web` en verde.

## 2) Planeador semanal

- [x] Definir meta semanal de habitos.
- [x] Definir meta de ahorro semanal.
- [x] Ver avance de metas durante la semana.

## 3) Comparativo semanal

- [x] Ver comparativo semana actual vs anterior en `Progreso`.
- [x] Validar cambios en habitos (%), balance y XP.

## 4) Registro rapido

- [x] Registrar habito desde acceso rapido en Home.
- [x] Registrar gasto desde acceso rapido en Home.
- [x] Registrar ingreso desde acceso rapido en Home.

## 5) Recomendaciones v2

- [x] Ver recomendaciones priorizadas por impacto.
- [x] Validar semaforo de prioridad (`alta`, `media`, `baja`).

## 6) Backup versionado

- [x] Exportar backup v2.
- [x] Importar backup v2.
- [x] Importar backup v1 sin perder datos.

## 7) UX y estabilidad

- [x] Estados vacios y de error claros.
- [x] Flujo de onboarding intacto.
- [x] Persistencia valida con F5/cierre navegador.

## Evidencia rapida

- `npm run verify` ejecutado en verde (`22 suites`, `42 tests`).
- `npx expo export --platform web` ejecutado en verde.
- Validaciones de backup versionado cubiertas en `tests/services/backupVersioning.test.ts`.
