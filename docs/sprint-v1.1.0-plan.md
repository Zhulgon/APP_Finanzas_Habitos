# Sprint Plan v1.1.0

Fecha de inicio sugerida: `2026-03-13`  
Duracion: `1 semana`  
Metodo: `Scrum-lite + Kanban (WIP max 2)`

## 1) Objetivo del sprint

Hacer la app mas util en uso real diario con foco en:

- Recordatorio y consistencia.
- Analitica personal simple.
- Mejoras de experiencia en navegacion y claridad.

## 2) Alcance (MoSCoW)

### Must

- Recordatorios locales de habitos mas confiables (activar, desactivar, validar hora).
- Resumen semanal automatico (habitos, balance, ahorro, XP).
- Exportacion de reporte semanal en CSV desde la app.
- Pulido UX: home mas clara, copys accionables, estados vacios utiles.

### Should

- Filtros rapidos avanzados en finanzas (hoy, semana, mes, rango custom).
- Metas por categoria (ej. limite comida, transporte) con semaforo.

### Could

- Recomendaciones simples basadas en tus datos (reglas, no IA compleja).

### Wont (v1.1)

- Sync cloud multi-dispositivo.
- Login/autenticacion.
- Integracion bancaria automatica.

## 3) Historias de usuario

1. Como usuario quiero recibir recordatorio diario para no romper mi racha.
2. Como usuario quiero ver un resumen semanal para saber si avance en habitos y dinero.
3. Como usuario quiero descargar un reporte para revisar mi progreso fuera de la app.
4. Como usuario quiero una pantalla de inicio mas intuitiva para actuar rapido.

## 4) Backlog tecnico (1 por 1)

1. [x] `Notificaciones`: robustecer `scheduleDailyHabitReminder` y manejo de permisos/errores.
2. [x] `Resumen semanal`: crear servicio `weeklySummary.ts` (habitos, finanzas, gamificacion).
3. [x] `CSV`: boton en `Progreso` para exportar resumen semanal.
4. [x] `UX Home`: rediseno de bloques de prioridad diaria y llamados a la accion.
5. [x] `Finanzas`: presets de filtros y resumen por rango.
6. [x] `Pruebas`: unitarias para servicio semanal y export CSV.
7. [ ] `QA`: checklist manual de recordatorios + persistencia + export.

## 5) Arquitectura y patrones para v1.1

- `Use Case Pattern`: nuevas reglas en casos de uso (no en UI).
- `Repository Pattern`: mantener acceso a datos encapsulado por contratos.
- `Domain Service`: `weeklyReportService` para agregacion de metricas.
- `Event-Driven`: reutilizar eventos de dominio para metricas semanales.
- `SOLID pragmatica`:
  - SRP: cada servicio con una sola responsabilidad.
  - DIP: store depende de interfaces/servicios, no de detalles de storage.

## 6) Definition of Done por historia

- Criterios funcionales cumplidos.
- Persistencia valida tras F5/cierre navegador.
- Manejo de errores con mensaje claro.
- Pruebas en verde (`typecheck`, `test`, `export web`).
- Documentacion actualizada (`README` + notas de version).

## 7) Checklist de cierre v1.1

- [ ] `npm run verify` en verde.
- [ ] `npx expo export --platform web` en verde.
- [ ] QA manual de recordatorios.
- [ ] QA de resumen/export semanal.
- [ ] Release notes `v1.1.0`.
