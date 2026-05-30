const Category = require('./models/Category');
const Product = require('./models/Product');

async function seed() {
  try {
    // Create categories
    const electronics = await Category.findOrCreate({
      where: { name: 'Electrónica' },
      defaults: { description: 'Productos electrónicos' },
    });

    const clothes = await Category.findOrCreate({
      where: { name: 'Ropa' },
      defaults: { description: 'Prendas de vestir' },
    });

    const books = await Category.findOrCreate({
      where: { name: 'Libros' },
      defaults: { description: 'Libros y literatura' },
    });

    // Create products
    const products = [
      {
        name: 'Laptop Dell XPS 13',
        description: 'Laptop ultradelgada de 13 pulgadas con procesador Intel i7',
        price: 1299.99,
        stock: 15,
        sku: 'DELL-XPS-13',
        categoryId: electronics[0].id,
        image_url: 'https://www.svgrepo.com/show/535468/laptop.svg',
      },
      {
        name: 'Monitor 4K 27"',
        description: 'Monitor UHD con resolución 3840x2160',
        price: 599.99,
        stock: 8,
        sku: 'MON-4K-27',
        categoryId: electronics[0].id,
        image_url: 'https://www.svgrepo.com/show/533130/monitor.svg',
      },
      {
        name: 'Teclado Mecánico RGB',
        description: 'Teclado mecánico con retroiluminación RGB',
        price: 149.99,
        stock: 25,
        sku: 'KEY-MECH-RGB',
        categoryId: electronics[0].id,
        image_url: 'https://www.svgrepo.com/show/535457/keyboard.svg',
      },
      {
        name: 'Camiseta Básica',
        description: 'Camiseta 100% algodón en varios colores',
        price: 29.99,
        stock: 50,
        sku: 'SHIRT-BASIC',
        categoryId: clothes[0].id,
        image_url: 'https://www.svgrepo.com/show/389410/shirt.svg',
      },
      {
        name: 'Jeans Azul',
        description: 'Jeans clásico azul oscuro',
        price: 79.99,
        stock: 30,
        sku: 'JEAN-BLUE',
        categoryId: clothes[0].id,
        image_url: 'https://www.svgrepo.com/show/482657/jeans-3.svg',
      },
      {
        name: 'JavaScript: The Good Parts',
        description: 'Guía esencial de JavaScript',
        price: 39.99,
        stock: 12,
        sku: 'BOOK-JS-GOOD',
        categoryId: books[0].id,
        image_url: 'https://www.svgrepo.com/show/533406/book.svg',
      },
    ];

    for (const productData of products) {
      await Product.findOrCreate({
        where: { sku: productData.sku },
        defaults: productData,
      });
    }

    console.log('✅ Seed data created successfully');
  } catch (err) {
    console.error('❌ Error seeding data:', err.message);
  }
}

module.exports = seed;
