const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: List all orders
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       total_amount:
 *                         type: number
 *                       items:
 *                         type: array
 *                       createdAt:
 *                         type: string
 *                 meta:
 *                   type: object
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: rows,
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
 * /api/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order found
 *       404:
 *         description: Order not found
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: order });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - total_amount
 *               - items
 *             properties:
 *               user_id:
 *                 type: integer
 *               total_amount:
 *                 type: number
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Order created
 *       401:
 *         description: Unauthorized - JWT token required
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ data: order });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update an order
 *     tags: [Orders]
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
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               total_amount:
 *                 type: number
 *               items:
 *                 type: array
 *     responses:
 *       200:
 *         description: Order updated
 *       401:
 *         description: Unauthorized - JWT token required
 *       404:
 *         description: Order not found
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await order.update(req.body);
    res.json({ data: order });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Cancel an order
 *     tags: [Orders]
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
 *         description: Order cancelled
 *       401:
 *         description: Unauthorized - JWT token required
 *       404:
 *         description: Order not found
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await order.destroy();
    res.json({ message: 'Order cancelled' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
