const { validationResult } = require('express-validator');
const { z } = require('zod');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const productZodSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150),
  description: z.string().nullable().optional(),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0, 'Price must be greater than or equal to 0'),
  stock: z
    .number({ invalid_type_error: 'Stock must be a number' })
    .int('Stock must be an integer')
    .min(0, 'Stock must be greater than or equal to 0'),
  sku: z.string().min(1, 'SKU is required').max(50),
  category: z.string().nullable().optional(),
  image_url: z.string().url('Must be a valid URL').nullable().optional(),
});

const validateWithZod = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      errors: result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }
  req.body = result.data;
  next();
};

module.exports = { handleValidationErrors, productZodSchema, validateWithZod };
