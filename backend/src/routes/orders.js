const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { verifyToken, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: List orders (admin sees all, users see only their own)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
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
router.get('/', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};
    if (status && req.user.role === 'admin') {
      where.status = status;
    }
    if (req.user.role !== 'admin') {
      where.user_id = req.user.id;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email'],
      }],
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
 *         description: Order found
 *       403:
 *         description: Forbidden - can only view own orders
 *       404:
 *         description: Order not found
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email'],
      }],
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden. Can only view your own orders.' });
    }
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
    const orderData = {
      ...req.body,
      user_id: req.user.id,
    };
    const order = await Order.create(orderData);
    res.status(201).json({
      data: {
        ...order.toJSON(),
        total_amount: parseFloat(order.total_amount),
      },
    });
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
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
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
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
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
