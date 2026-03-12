import { z } from 'zod';

const currencySchema = z
  .string()
  .trim()
  .min(3, 'La moneda debe tener entre 3 y 5 letras.')
  .max(5, 'La moneda debe tener entre 3 y 5 letras.')
  .regex(/^[a-zA-Z]+$/, 'La moneda solo debe tener letras.')
  .transform((value) => value.toUpperCase());

const nonNegativeMoney = z.coerce
  .number({ message: 'Escribe un numero valido.' })
  .min(0, 'El valor no puede ser negativo.');

const positiveMoney = z.coerce
  .number({ message: 'Escribe un numero valido.' })
  .gt(0, 'El monto debe ser mayor a cero.');

export const onboardingSchema = z.object({
  name: z.string().trim().min(2, 'Tu nombre debe tener al menos 2 caracteres.'),
  objective: z.string().trim().max(120, 'El objetivo debe tener maximo 120 caracteres.'),
  monthlyIncome: nonNegativeMoney,
  monthlySavingsGoal: nonNegativeMoney,
  currency: currencySchema,
  initialHabits: z.array(z.string().trim()).max(3),
});

export const createHabitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'El habito debe tener al menos 3 caracteres.')
    .max(45, 'El habito no debe pasar 45 caracteres.'),
  frequency: z.enum(['daily', 'weekly']),
  category: z.enum(['health', 'productivity', 'finance']),
});

export const incomeSchema = z.object({
  amount: positiveMoney,
});

export const expenseSchema = z.object({
  amount: positiveMoney,
  category: z.enum(['fixed', 'variable', 'services']),
  subCategory: z
    .string()
    .trim()
    .min(2, 'La subcategoria debe tener al menos 2 caracteres.')
    .max(45, 'La subcategoria no debe pasar 45 caracteres.'),
});

export const budgetSchema = z.object({
  category: z.enum(['fixed', 'variable', 'services']),
  amount: nonNegativeMoney,
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Tu nombre debe tener al menos 2 caracteres.'),
  objective: z.string().trim().max(120, 'El objetivo debe tener maximo 120 caracteres.'),
  monthlyIncome: nonNegativeMoney,
  monthlySavingsGoal: nonNegativeMoney,
  currency: currencySchema,
  avatarColor: z.string().trim().min(4),
  avatarItem: z.string().trim().min(2),
});

export const reminderTimeSchema = z.object({
  hour: z.coerce
    .number({ message: 'La hora debe ser numerica.' })
    .int('La hora debe ser un numero entero.')
    .min(0, 'La hora debe estar entre 0 y 23.')
    .max(23, 'La hora debe estar entre 0 y 23.'),
  minute: z.coerce
    .number({ message: 'El minuto debe ser numerico.' })
    .int('El minuto debe ser un numero entero.')
    .min(0, 'El minuto debe estar entre 0 y 59.')
    .max(59, 'El minuto debe estar entre 0 y 59.'),
});

export const getValidationMessage = (error: z.ZodError): string => {
  return error.issues[0]?.message ?? 'Revisa los datos ingresados.';
};
