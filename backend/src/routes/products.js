const express = require('express');
const { body } = require('express-validator');
const { Op } = require('sequelize');
const router = express.Router();
const Product = require('../models/Product');
const { formatProduct, formatProducts } = require('../utils/formatters');
const {
  handleValidationErrors,
  productZodSchema,
  validateWithZod,
} = require('../middleware/validate');
const { verifyToken, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Monitor 24 pulgadas
 *         description:
 *           type: string
 *           example: Monitor Full HD con panel IPS
 *         price:
 *           type: number
 *           format: float
 *           example: 4999.99
 *         stock:
 *           type: integer
 *           example: 25
 *         sku:
 *           type: string
 *           example: MON-24-001
 *         category:
 *           type: string
 *           example: Electronica
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ProductInput:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - stock
 *         - sku
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 150
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           minimum: 0
 *         stock:
 *           type: integer
 *           minimum: 0
 *         sku:
 *           type: string
 *           maxLength: 50
 *         category:
 *           type: string
 *     Availability:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         stock:
 *           type: integer
 *         isAvailable:
 *           type: boolean
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

const productRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Name must be between 2 and 150 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ max: 50 })
    .withMessage('SKU must be at most 50 characters'),
  body('category').optional().trim(),
  body('description').optional().trim(),
];

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: List all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name or description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by stock availability (true = in stock, false = out of stock)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const { search, category, available, page = 1, limit = 20 } = req.query;
    const where = {};
    const conditions = [];

    if (search) {
      conditions.push({
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ],
      });
    }

    if (available === 'true') {
      conditions.push({ stock: { [Op.gt]: 0 } });
    }
    if (available === 'false') {
      conditions.push({ stock: { [Op.eq]: 0 } });
    }

    if (conditions.length > 0) {
      where[Op.and] = conditions;
    }

    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (parsedPage - 1) * parsedLimit;

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        required: category ? true : false,
        where: category ? { name: category } : undefined,
      }],
      limit: parsedLimit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: formatProducts(rows),
      meta: {
        total: count,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(count / parsedLimit),
      },
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }],
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: formatProduct(product) });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/products/{id}/availability:
 *   get:
 *     summary: Check product availability
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Availability information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Availability'
 *       404:
 *         description: Product not found
 */
router.get('/:id/availability', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      attributes: ['id', 'name', 'stock'],
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({
      data: {
        id: product.id,
        name: product.name,
        stock: product.stock,
        isAvailable: product.stock > 0,
      },
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - JWT token required
 *       409:
 *         description: SKU already exists
 */
router.post(
  '/',
  verifyToken,
  requireAdmin,
  productRules,
  handleValidationErrors,
  validateWithZod(productZodSchema),
  async (req, res) => {
    try {
      const product = await Product.create(req.body);
      res.status(201).json({ data: formatProduct(product) });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'A product with this SKU already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Product updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - JWT token required
 *       404:
 *         description: Product not found
 *       409:
 *         description: SKU already in use
 */
router.put(
  '/:id',
  verifyToken,
  requireAdmin,
  productRules,
  handleValidationErrors,
  validateWithZod(productZodSchema),
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      await product.update(req.body);
      res.json({ data: formatProduct(product) });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'A product with this SKU already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - JWT token required
 *       404:
 *         description: Product not found
 */
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
