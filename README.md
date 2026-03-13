# App Habitos + Finanzas (Personal)

Aplicacion personal para gestionar habitos, finanzas y progreso gamificado.

## Que incluye (v1.2 estable)

- Habitos diarios/semanales con racha y progreso.
- Registro de ingresos, gastos y presupuestos por categoria.
- Meta de ahorro mensual con seguimiento.
- Capsulas de educacion financiera.
- Gamificacion avanzada:
  - XP por dimensiones (disciplina, finanzas, aprendizaje)
  - niveles y rangos
  - misiones diarias/semanales
  - logros desbloqueables
  - monedas, tienda de avatar y comodin de racha
  - timeline de recompensas en pantalla `Progreso`
- Mejoras v1.1 ya activas:
  - resumen semanal automatico (habitos, balance, XP, monedas)
  - estado de recordatorios mas robusto (permiso/activacion/error)
  - exportacion de resumen semanal en CSV desde `Progreso`
  - plan diario en Inicio + filtros rapidos de Finanzas (hoy/semana/mes)
- Mejoras v1.2 activas:
  - plan semanal con metas de habitos y ahorro
  - comparativo semanal (actual vs anterior) con deltas y tendencia
  - recomendaciones v2 priorizadas por impacto
  - registro rapido en Home (habito, ingreso, gasto)
  - backup `v2` compatible con backup `v1`

## Stack tecnico

- Expo + React Native + TypeScript
- React Navigation
- Zustand (estado global)
- Persistencia local web (localStorage)
- Tests con Jest + ts-jest

## Ejecutar proyecto

```bash
npm install
npm run web
```

Abrir siempre en:

- `http://localhost:8085`

## Persistencia y backup

- El progreso se guarda automaticamente en el navegador.
- Desde `Perfil` puedes:
  - `Guardar progreso` (descarga archivo JSON)
  - `Restaurar progreso` (cargar archivo JSON)

## Calidad

```bash
npx tsc --noEmit
npm test -- --runInBand
npx expo export --platform web
```

Chequeo rapido local:

```bash
npm run verify
```

Chequeo completo de release:

```bash
npm run verify:full
```

Smoke QA de flujo completo:

```bash
npm test -- --runInBand tests/flows/appSmokeFlow.test.ts
```

## Reglas de juego (base)

- XP base por evento:
  - Habito completado: `+9 XP`
  - Gasto registrado: `+4 XP`
  - Ingreso registrado: `+4 XP`
  - Leccion completada: `+12 XP`
- Dificultad adaptativa de misiones (afecta recompensas).
- Nivel global cada `160 XP`.

## Estructura

```text
src/
  app/
  application/
  domain/
  infrastructure/
  presentation/
  shared/
docs/
  privacy-local-data.md
  release-checklist-v1-final.md
  software-playbook.md
  release-checklist-v1.md
  release-checklist-v1.1.md
  release-checklist-v1.2.md
  release-notes-v1.1.0.md
  release-notes-v1.2.0.md
  sprint-v1.1.0-plan.md
  sprint-v1.2.0-plan.md
```

## Roadmap inmediato

- Base v1.2 cerrada.
- Siguiente iteracion sugerida: `v1.3.0`.
