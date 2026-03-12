# Software Playbook (Proyecto Personal)

## 1) Ciclo completo de software aplicado a esta app

### Fase A: Discovery (problema y usuario)

- Problema: "quiero mejorar habitos y dinero sin apps complejas".
- Usuario: tu mismo (single-user product).
- Resultado: 1 promesa clara: "consistencia diaria + claridad financiera".

Entregable:
- Documento de alcance v1 (5 capacidades maximas).

### Fase B: Definicion de alcance

Regla de alcance:
- Si una funcion no apoya habitos, registro financiero o progreso, se pospone.

Entregable:
- Backlog corto con prioridad MoSCoW:
  - Must: habitos, finanzas simples, dashboard, capsulas, XP.
  - Should: avatar editable.
  - Could: notificaciones.
  - Wont (v1): banco automatico, social, IA compleja.

### Fase C: Diseno tecnico

Decisiones de arquitectura:
- Clean Architecture ligera.
- Dominio separado de UI e infraestructura.
- Repositorios para aislar acceso a datos.
- Casos de uso para reglas de negocio.

Entregable:
- Estructura de carpetas y contratos de repositorio.

### Fase D: Implementacion

Orden de implementacion recomendado:
1. Base tecnica (navigation + DB + state).
2. Habitos.
3. Finanzas.
4. Educacion.
5. Gamificacion.
6. Perfil/avatar.

### Fase E: Calidad

Tipos de pruebas:
- Unitarias: casos de uso (`createHabit`, `registerExpense`, etc.).
- Integracion: repositorio SQLite.
- E2E manual: flujo onboarding -> habitos -> finanzas -> progreso.

Definition of Done por historia:
- Funciona en Android/iOS.
- Estado persiste tras cerrar app.
- Maneja errores de entrada.
- Tiene criterio de aceptacion validado.

### Fase F: Release y operacion

- Versionado semantico simple (`1.0.0`, `1.1.0`).
- Changelog por iteracion.
- Recolectar metricas de uso personal semanal:
  - Habitos completados/semana.
  - Dias con registro de gastos.
  - Balance mensual.

### Fase G: Mejora continua

- Review semanal:
  - Que dolio al usuario (tu).
  - Que funcion fue ignorada.
  - Que regla de negocio se entendio mal.
- Ajustar backlog siguiente semana.

## 2) Patrones y principios usados

## 2.1 Clean Architecture (adaptada)

- `domain`: reglas centrales y contratos.
- `application`: orquestacion de estado y servicios.
- `infrastructure`: SQLite y repositorios concretos.
- `presentation`: pantallas y componentes.

Beneficio:
- Puedes cambiar SQLite por API remota sin romper la UI.

## 2.2 Repository Pattern

Contrato:
- `HabitRepository`, `FinanceRepository`, `LessonRepository`, `ProfileRepository`.

Implementacion actual:
- Clases `SQLite*Repository`.

Beneficio:
- El dominio no conoce SQL.

## 2.3 Use Case Pattern

Ejemplos:
- `createHabitUseCase`
- `completeHabitUseCase`
- `registerExpenseUseCase`
- `completeLessonUseCase`

Beneficio:
- Reglas de negocio explicitas, testeables y reutilizables.

## 2.4 Estado unificado (single source of truth)

- `useAppStore` centraliza datos y acciones.
- Pantallas consumen el store, no llaman SQL directo.

Beneficio:
- Menos acoplamiento y menos errores por estado duplicado.

## 2.5 Principios SOLID aplicados pragmaticamente

- SRP: cada clase repositorio tiene una responsabilidad.
- OCP: agregar nuevo repositorio no exige reescribir casos de uso.
- DIP: casos de uso dependen de interfaces, no de SQLite.

## 3) Metodologia recomendada para proyecto personal

Combina `Scrum-lite + Kanban`:

- Sprint semanal (lunes-domingo).
- Maximo 3 historias activas.
- Board con columnas: `Todo / Doing / Verify / Done`.
- Retro de 15 minutos al final de semana.

Ceremonias minimas:
- Planning semanal (20 min).
- Daily personal (5 min): que hice / que hare / bloqueo.
- Review + retro (15 min).

Metricas de flujo:
- Lead time por historia.
- WIP maximo de 2.
- Porcentaje de historias completadas por sprint.

## 4) Arquitectura de datos (v1)

Tablas:
- `habits`, `habit_logs`
- `incomes`, `expenses`
- `lessons`, `lesson_progress`
- `user_profile`

Reglas criticas:
- Un habito se marca una vez por dia.
- Perfil unico `id = 1`.
- Leccion solo se completa una vez.

## 5) Guia para crecer de v1 a v2

1. Anadir pruebas unitarias por caso de uso.
2. Anadir sincronizacion cloud (Supabase/Firebase) sin romper dominio.
3. Separar `application` en modulos (`habits`, `finance`, `learning`).
4. Agregar observabilidad (errores y eventos).
5. Definir ADRs para cambios de arquitectura.

## 6) Checklist de arquitectura por feature nueva

Antes de codificar:
1. Que regla de negocio agrega?
2. En que caso de uso vive?
3. Que interfaz de repositorio toca?
4. Necesita migracion de DB?
5. Como se valida con prueba automatizada?
