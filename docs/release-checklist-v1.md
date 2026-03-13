# Release Checklist v1

Ejecucion final: `2026-03-12` (America/Bogota)

## 1) Build y calidad

- [x] `npx tsc --noEmit` en verde.
- [x] `npm test -- --runInBand` en verde.
- [x] `npx expo export --platform web` en verde.

## 2) Flujo onboarding

- [x] Crear perfil inicial con nombre, objetivo, ingreso y moneda.
- [x] Crear al menos 1 habito inicial.
- [x] Verificar que entra a tabs principales sin errores.

## 3) Habitos

- [x] Crear habito nuevo.
- [x] Marcar habito como completado.
- [x] Intentar marcar el mismo habito dos veces el mismo dia y validar mensaje.
- [x] Revisar racha/progreso actualizado en Inicio.

## 4) Finanzas

- [x] Registrar ingreso.
- [x] Registrar gasto.
- [x] Guardar presupuesto por categoria.
- [x] Ver alertas de consumo y ultimos gastos.

## 5) Aprender

- [x] Completar una capsula.
- [x] Reintentar completar la misma capsula y validar que no duplica.

## 6) Gamificacion

- [x] Validar XP, nivel y monedas tras actividades.
- [x] Validar misiones activas y estado (Activa/Completa/Reclamada).
- [x] Comprar item de avatar y equiparlo.
- [x] Usar comodin de racha (si aplica dia perdido).
- [x] Revisar timeline en pantalla `Progreso`.

## 7) Persistencia y backup

- [x] Refrescar con F5 y confirmar que los datos se mantienen.
- [x] Cerrar navegador y volver a abrir, validar persistencia.
- [x] Guardar progreso en archivo.
- [x] Restaurar progreso desde archivo.

## 8) UX basica

- [x] Estados vacios visibles cuando no hay datos.
- [x] Mensajes de error/success claros en toasts.
- [x] Pantalla de error de arranque permite `Reintentar`.

## Evidencia rapida

- Comandos ejecutados en esta iteracion:
  - `npm run verify`
  - `npm test -- --runInBand`
  - `npx expo export --platform web`
- Suite nueva de smoke QA:
  - `tests/flows/appSmokeFlow.test.ts`
- Cobertura funcional existente reforzada:
  - `tests/use-cases/*.test.ts`
  - `tests/services/*.test.ts`
