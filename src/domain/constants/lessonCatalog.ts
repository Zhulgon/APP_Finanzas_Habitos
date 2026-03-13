import type { Lesson } from '../entities/Lesson';

export const LESSON_CATALOG: Lesson[] = [
  {
    id: 'lesson_activopasivo',
    title: 'Activos vs pasivos en la vida real',
    summary: 'Diferencia entre lo que mete dinero y lo que lo saca.',
    content:
      'Un activo pone dinero en tu bolsillo y un pasivo lo saca. Separa ingreso principal, ingresos extra e inversiones, y compara contra gastos fijos, variables y deudas.',
    estimatedMinutes: 2,
    dayOrder: 1,
    pillar: 'mindset',
    inspiredBy: 'educacion financiera clasica',
  },
  {
    id: 'lesson_pay_yourself_first',
    title: 'Pagate primero a ti',
    summary: 'Ahorra e invierte antes de gastar, aunque sea pequeno.',
    content:
      'Configura una transferencia automatica a ahorro justo al recibir ingreso. La constancia gana sobre la intensidad. Empieza con 5% y escala.',
    estimatedMinutes: 2,
    dayOrder: 2,
    pillar: 'mindset',
    inspiredBy: 'habitos de riqueza',
  },
  {
    id: 'lesson_cashflow_personal',
    title: 'Flujo de caja personal',
    summary: 'Tu progreso depende de ingreso menos gasto consciente.',
    content:
      'Tu flujo de caja es la diferencia entre lo que entra y lo que sale. Mide semanalmente para detectar fugas y decidir mejor.',
    estimatedMinutes: 2,
    dayOrder: 3,
    pillar: 'cashflow',
    inspiredBy: 'marcos de flujo de caja',
  },
  {
    id: 'lesson_503020',
    title: 'Regla 50/30/20 adaptada',
    summary: 'Distribuye ingreso por necesidades, estilo y crecimiento.',
    content:
      'Usa la regla 50/30/20 como base y ajustala segun tu realidad. Lo importante es asegurar porcentaje fijo para ahorro e inversion.',
    estimatedMinutes: 2,
    dayOrder: 4,
    pillar: 'budget',
    inspiredBy: 'presupuesto practico',
  },
  {
    id: 'lesson_budget_zero',
    title: 'Presupuesto base cero',
    summary: 'Asigna una funcion a cada peso antes del mes.',
    content:
      'Planea cada categoria y evita que el dinero quede sin destino. Lo que no tiene plan suele terminar en gasto impulsivo.',
    estimatedMinutes: 2,
    dayOrder: 5,
    pillar: 'budget',
    inspiredBy: 'metodologias de presupuesto',
  },
  {
    id: 'lesson_emergencia',
    title: 'Fondo de emergencia por etapas',
    summary: 'Meta inicial 1 mes, meta robusta 3 a 6 meses.',
    content:
      'Primero construye una reserva corta y liquida. Luego crece el fondo hasta cubrir meses de gastos basicos para evitar deuda por imprevistos.',
    estimatedMinutes: 2,
    dayOrder: 6,
    pillar: 'safety',
    inspiredBy: 'gestion de riesgo personal',
  },
  {
    id: 'lesson_good_bad_debt',
    title: 'Deuda buena y deuda mala',
    summary: 'No toda deuda es igual: evalua costo y retorno.',
    content:
      'La deuda puede acelerar activos productivos o hundir flujo de caja. Analiza tasa efectiva, plazo y capacidad real de pago.',
    estimatedMinutes: 2,
    dayOrder: 7,
    pillar: 'debt',
    inspiredBy: 'principios de deuda consciente',
  },
  {
    id: 'lesson_compuesto',
    title: 'Interes compuesto aplicado',
    summary: 'Pequenas cantidades frecuentes crecen con el tiempo.',
    content:
      'Aporta cada mes y reinvierte. El tiempo multiplica resultados cuando sostienes disciplina. Evita cortar el proceso antes de madurar.',
    estimatedMinutes: 2,
    dayOrder: 8,
    pillar: 'investing',
    inspiredBy: 'inversion de largo plazo',
  },
  {
    id: 'lesson_diversificacion',
    title: 'Diversificacion basica',
    summary: 'No concentres todo en un solo activo o riesgo.',
    content:
      'Divide riesgo entre categorias y horizontes. Diversificar no elimina riesgo, pero reduce el impacto de un solo error.',
    estimatedMinutes: 2,
    dayOrder: 9,
    pillar: 'investing',
    inspiredBy: 'gestion de portafolio inicial',
  },
  {
    id: 'lesson_inflacion',
    title: 'Inflacion y poder adquisitivo',
    summary: 'Tu dinero quieto pierde valor con el tiempo.',
    content:
      'Ahorro sin estrategia protege poco ante inflacion. Combina liquidez de corto plazo con activos que aspiren a superar la inflacion.',
    estimatedMinutes: 2,
    dayOrder: 10,
    pillar: 'investing',
    inspiredBy: 'macroeconomia para principiantes',
  },
];
