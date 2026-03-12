import type { Lesson } from '../entities/Lesson';

export const LESSON_CATALOG: Lesson[] = [
  {
    id: 'lesson_activopasivo',
    title: 'Activo vs Pasivo',
    summary: 'Tu ingreso es activo. Tus gastos mensuales son pasivos.',
    content:
      'Un activo pone dinero en tu bolsillo. Un pasivo lo saca. Identifica tu sueldo, ingresos extra e inversiones como activos, y separa gastos fijos/variables/servicios como pasivos.',
    estimatedMinutes: 2,
  },
  {
    id: 'lesson_503020',
    title: 'Regla 50/30/20',
    summary: '50% necesidades, 30% estilo de vida, 20% ahorro/inversion.',
    content:
      'Distribuye el ingreso para priorizar estabilidad. Ajusta la regla segun tu realidad, pero manten siempre una porcion para ahorro automatico.',
    estimatedMinutes: 2,
  },
  {
    id: 'lesson_emergencia',
    title: 'Fondo de Emergencia',
    summary: 'Meta inicial: 3 meses de gastos basicos.',
    content:
      'Construye un fondo de emergencia para evitar endeudarte ante imprevistos. Empieza con una meta pequena y aumenta de forma constante.',
    estimatedMinutes: 2,
  },
  {
    id: 'lesson_compuesto',
    title: 'Interes Compuesto',
    summary: 'Pequenas cantidades constantes crecen con el tiempo.',
    content:
      'La constancia importa mas que el monto inicial. Aporta cada mes, reinvierte ganancias y evita retirar antes de tu objetivo.',
    estimatedMinutes: 2,
  },
];
