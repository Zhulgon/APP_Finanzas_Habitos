# Release Checklist v1

## 1) Build y calidad

- [ ] `npx tsc --noEmit` en verde.
- [ ] `npm test -- --runInBand` en verde.
- [ ] `npx expo export --platform web` en verde.

## 2) Flujo onboarding

- [ ] Crear perfil inicial con nombre, objetivo, ingreso y moneda.
- [ ] Crear al menos 1 habito inicial.
- [ ] Verificar que entra a tabs principales sin errores.

## 3) Habitos

- [ ] Crear habito nuevo.
- [ ] Marcar habito como completado.
- [ ] Intentar marcar el mismo habito dos veces el mismo dia y validar mensaje.
- [ ] Revisar racha/progreso actualizado en Inicio.

## 4) Finanzas

- [ ] Registrar ingreso.
- [ ] Registrar gasto.
- [ ] Guardar presupuesto por categoria.
- [ ] Ver alertas de consumo y ultimos gastos.

## 5) Aprender

- [ ] Completar una capsula.
- [ ] Reintentar completar la misma capsula y validar que no duplica.

## 6) Gamificacion

- [ ] Validar XP, nivel y monedas tras actividades.
- [ ] Validar misiones activas y estado (Activa/Completa/Reclamada).
- [ ] Comprar item de avatar y equiparlo.
- [ ] Usar comodin de racha (si aplica dia perdido).
- [ ] Revisar timeline en pantalla `Progreso`.

## 7) Persistencia y backup

- [ ] Refrescar con F5 y confirmar que los datos se mantienen.
- [ ] Cerrar navegador y volver a abrir, validar persistencia.
- [ ] Guardar progreso en archivo.
- [ ] Restaurar progreso desde archivo.

## 8) UX basica

- [ ] Estados vacios visibles cuando no hay datos.
- [ ] Mensajes de error/success claros en toasts.
- [ ] Pantalla de error de arranque permite `Reintentar`.

