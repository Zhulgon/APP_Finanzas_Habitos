# App Habitos + Finanzas (Personal)

Aplicacion mobile personal para:

- Gestionar habitos diarios/semanales.
- Registrar ingresos y gastos basicos.
- Definir presupuesto mensual por categoria y ver alertas de consumo.
- Definir meta de ahorro mensual y ver avance.
- Aprender educacion financiera corta.
- Ver progreso gamificado (XP, nivel, avatar mini).
- Recibir insights automaticos y logros desbloqueables.

## Stack tecnico

- Expo + React Native + TypeScript
- SQLite local con `expo-sqlite`
- Navegacion con React Navigation
- Estado global con Zustand

## Ejecutar proyecto

```bash
npm install
npm run start
```

## Persistencia en web (importante)

Para conservar progreso y perfil en navegador, usa siempre la misma URL:

- `http://localhost:8085`

En web, el almacenamiento local depende del origen (`host + puerto`).
Si cambias entre `localhost` y `127.0.0.1`, o entre puertos distintos, veras datos "vacios" aunque realmente quedaron guardados en otro origen.

## Backup manual de progreso/perfil

Desde la pantalla `Perfil`:

1. Pulsa `Generar backup` para crear un JSON.
2. Copia y guarda ese JSON en un archivo seguro.
3. Para restaurar, pega el JSON en el cuadro y pulsa `Restaurar JSON`.

## Ejecutar pruebas

```bash
npm test
```

## Estructura

```text
src/
  app/                # composicion de la app y navegacion
  application/        # store global y servicios de aplicacion
  domain/             # entidades, contratos de repositorio, casos de uso
  infrastructure/     # SQLite, migraciones, repositorios concretos
  presentation/       # pantallas y componentes de UI
  shared/             # utilidades, formatos, design tokens
docs/
  software-playbook.md
```

## Reglas de producto v1

- `+10 XP` por habito completado (1 vez por dia por habito).
- `+5 XP` por registrar ingreso.
- `+5 XP` por registrar gasto.
- `+15 XP` por leccion completada.
- Cada nivel sube cada `100 XP`.
