import { z } from 'zod'

const numField = (required, nonneg, isInt = false) =>
  z
    .string()
    .min(1, required)
    .refine((v) => !isNaN(Number(v)) && v.trim() !== '', 'Debe ser un número')
    .transform(Number)
    .pipe(
      isInt
        ? z.number().int('Debe ser entero').nonnegative(nonneg)
        : z.number().nonnegative(nonneg)
    )

export const loginSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio').email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().min(1, 'El correo es obligatorio').email('Correo inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirm: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  })

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  sku: z.string().min(1, 'El SKU es obligatorio'),
  price: numField('El precio es obligatorio', 'El precio no puede ser negativo'),
  stock: numField('El stock es obligatorio', 'El stock no puede ser negativo', true),
  image_url: z.union([z.literal(''), z.string().url('URL de imagen inválida')]),
  category: z.union([z.string(), z.number()]).optional(),
  description: z.string().optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  icon: z.string(),
})

export function flattenZodErrors(zodError) {
  const errors = {}
  zodError.issues.forEach((issue) => {
    const key = String(issue.path[0])
    if (key && !errors[key]) errors[key] = issue.message
  })
  return errors
}
