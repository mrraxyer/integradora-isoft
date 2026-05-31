const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cart items with product details
 *       401:
 *         description: Unauthorized - JWT token required
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'price', 'stock', 'image_url'],
        },
      ],
    });
    res.json({ data: cartItems });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add item to cart or update quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Item added/updated in cart
 *       400:
 *         description: Invalid request or insufficient stock
 *       401:
 *         description: Unauthorized - JWT token required
 *       404:
 *         description: Product not found
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid productId or quantity' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const [cartItem, created] = await CartItem.findOrCreate({
      where: { userId: req.user.id, productId },
      defaults: { quantity },
    });

    if (!created) {
      const newQuantity = cartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ error: 'Insufficient stock for requested quantity' });
      }
      await cartItem.update({ quantity: newQuantity });
    }

    res.json({ data: cartItem });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/cart/{id}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
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
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cart item updated
 *       400:
 *         description: Invalid quantity or insufficient stock
 *       401:
 *         description: Unauthorized - JWT token required
 *       404:
 *         description: Cart item not found
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const cartItem = await CartItem.findByPk(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const product = await Product.findByPk(cartItem.productId);
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    await cartItem.update({ quantity });
    res.json({ data: cartItem });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/cart/{id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
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
 *         description: Cart item removed
 *       401:
 *         description: Unauthorized - JWT token required
 *       404:
 *         description: Cart item not found
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const cartItem = await CartItem.findByPk(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await cartItem.destroy();
    res.json({ message: 'Item removed from cart' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 *       401:
 *         description: Unauthorized - JWT token required
 */
router.delete('/clear/all', verifyToken, async (req, res) => {
  try {
    await CartItem.destroy({
      where: { userId: req.user.id },
    });
    res.json({ message: 'Cart cleared' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
