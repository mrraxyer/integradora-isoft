const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/config/db');
const Product = require('../src/models/Product');

const testProduct = {
  name: 'Monitor 24 pulgadas',
  description: 'Monitor Full HD con panel IPS',
  price: 4999.99,
  stock: 15,
  sku: 'MON-24-001',
  category: 'Electronica',
};

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

afterEach(async () => {
  await Product.destroy({ where: {} });
});

// ---------------------------------------------------------------------------
// GET /api/products
// ---------------------------------------------------------------------------

describe('GET /api/products', () => {
  it('returns 200 with empty array when no products exist', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  it('returns products when they exist', async () => {
    await Product.create(testProduct);
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe(testProduct.name);
  });

  it('filters by category', async () => {
    await Product.create(testProduct);
    await Product.create({
      name: 'Camisa',
      price: 299,
      stock: 50,
      sku: 'ROPa-001',
      category: 'Ropa',
    });
    const res = await request(app).get('/api/products?category=Electronica');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].category).toBe('Electronica');
  });

  it('filters available products (stock > 0)', async () => {
    await Product.create(testProduct);
    await Product.create({ ...testProduct, sku: 'OUT-001', stock: 0 });
    const res = await request(app).get('/api/products?available=true');
    expect(res.status).toBe(200);
    expect(res.body.data.every((p) => p.stock > 0)).toBe(true);
  });

  it('filters out-of-stock products', async () => {
    await Product.create(testProduct);
    await Product.create({ ...testProduct, sku: 'OUT-001', stock: 0 });
    const res = await request(app).get('/api/products?available=false');
    expect(res.status).toBe(200);
    expect(res.body.data.every((p) => p.stock === 0)).toBe(true);
  });

  it('paginates results', async () => {
    for (let i = 1; i <= 5; i++) {
      await Product.create({ ...testProduct, sku: `SKU-${i}` });
    }
    const res = await request(app).get('/api/products?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBe(5);
    expect(res.body.meta.pages).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// GET /api/products/:id
// ---------------------------------------------------------------------------

describe('GET /api/products/:id', () => {
  it('returns 200 with the product when found', async () => {
    const created = await Product.create(testProduct);
    const res = await request(app).get(`/api/products/${created.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.sku).toBe(testProduct.sku);
  });

  it('returns 404 when product does not exist', async () => {
    const res = await request(app).get('/api/products/99999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Product not found');
  });
});

// ---------------------------------------------------------------------------
// GET /api/products/:id/availability
// ---------------------------------------------------------------------------

describe('GET /api/products/:id/availability', () => {
  it('returns isAvailable true when stock > 0', async () => {
    const created = await Product.create(testProduct);
    const res = await request(app).get(`/api/products/${created.id}/availability`);
    expect(res.status).toBe(200);
    expect(res.body.data.isAvailable).toBe(true);
    expect(res.body.data.stock).toBe(testProduct.stock);
  });

  it('returns isAvailable false when stock is 0', async () => {
    const created = await Product.create({ ...testProduct, stock: 0 });
    const res = await request(app).get(`/api/products/${created.id}/availability`);
    expect(res.status).toBe(200);
    expect(res.body.data.isAvailable).toBe(false);
  });

  it('returns 404 for non-existent product', async () => {
    const res = await request(app).get('/api/products/99999/availability');
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// POST /api/products
// ---------------------------------------------------------------------------

describe('POST /api/products', () => {
  it('creates a product and returns 201', async () => {
    const res = await request(app).post('/api/products').send(testProduct);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(testProduct.name);
    expect(res.body.data.sku).toBe(testProduct.sku);
    expect(res.body.data.id).toBeDefined();
  });

  it('returns 400 when name is missing', async () => {
    const { name, ...body } = testProduct;
    const res = await request(app).post('/api/products').send(body);
    expect(res.status).toBe(400);
  });

  it('returns 400 when name is too short', async () => {
    const res = await request(app).post('/api/products').send({ ...testProduct, name: 'X' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when price is negative', async () => {
    const res = await request(app).post('/api/products').send({ ...testProduct, price: -1 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when stock is negative', async () => {
    const res = await request(app).post('/api/products').send({ ...testProduct, stock: -5 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when SKU is missing', async () => {
    const { sku, ...body } = testProduct;
    const res = await request(app).post('/api/products').send(body);
    expect(res.status).toBe(400);
  });

  it('returns 409 when SKU is duplicate', async () => {
    await Product.create(testProduct);
    const res = await request(app).post('/api/products').send(testProduct);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/SKU/i);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/products/:id
// ---------------------------------------------------------------------------

describe('PUT /api/products/:id', () => {
  it('updates product and returns 200', async () => {
    const created = await Product.create(testProduct);
    const update = { ...testProduct, name: 'Monitor Actualizado', price: 5999.99 };
    const res = await request(app).put(`/api/products/${created.id}`).send(update);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Monitor Actualizado');
    expect(parseFloat(res.body.data.price)).toBe(5999.99);
  });

  it('returns 404 when product does not exist', async () => {
    const res = await request(app).put('/api/products/99999').send(testProduct);
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid update data', async () => {
    const created = await Product.create(testProduct);
    const res = await request(app)
      .put(`/api/products/${created.id}`)
      .send({ ...testProduct, price: -100 });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/products/:id
// ---------------------------------------------------------------------------

describe('DELETE /api/products/:id', () => {
  it('deletes product and returns 200', async () => {
    const created = await Product.create(testProduct);
    const res = await request(app).delete(`/api/products/${created.id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Product deleted successfully');
    const check = await Product.findByPk(created.id);
    expect(check).toBeNull();
  });

  it('returns 404 when product does not exist', async () => {
    const res = await request(app).delete('/api/products/99999');
    expect(res.status).toBe(404);
  });
});
