# Privacidad y Datos Locales

## Alcance de datos (v1.x)

La app funciona en modo personal y local:

- No requiere cuenta.
- No envia datos a servidores externos.
- No sincroniza con nube en v1.x.

## Que datos se guardan

- Perfil personal (nombre, objetivo, moneda, metas).
- Habitos y sus registros.
- Ingresos, gastos y presupuestos.
- Progreso educativo y gamificado.
- Plan semanal y comparativos.
- Eventos de observabilidad local (para diagnostico).

## Donde se guardan

- Web: `localStorage` del navegador.
- Nativo: SQLite local del dispositivo.

## Backup y restore

- Puedes exportar tu progreso a archivo JSON.
- Puedes restaurar desde archivo JSON.
- Formato actual: backup `v2` (compatible con `v1`).

## Seguridad basica aplicada

- Validaciones de entrada con esquemas (`zod`).
- Manejo de errores controlado en UI y store.
- Sin secretos embebidos de terceros.

## Limites conocidos

- Si limpias el almacenamiento del navegador sin backup, se pierden datos.
- En v1.x no hay cifrado de backup.
- En v1.x no hay sincronizacion entre dispositivos.
