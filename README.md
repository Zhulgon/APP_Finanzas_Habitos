# App Habitos + Finanzas (Personal)

Aplicacion personal para gestionar habitos, finanzas y progreso gamificado.

## Que incluye (v1.0 en curso)

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
  software-playbook.md
  release-checklist-v1.md
```
