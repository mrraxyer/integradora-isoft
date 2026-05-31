const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
} else {
  sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'ecommerce',
    username: process.env.DB_USER || 'ecommerce_user',
    password: process.env.DB_PASSWORD,
    logging: false,
  });
}

const connectDB = async () => {
  // Import models for associations
  const Product = require('../models/Product');
  const Category = require('../models/Category');
  const Order = require('../models/Order');
  const User = require('../models/User');
  const CartItem = require('../models/CartItem');

  // Define associations
  Product.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
  Category.hasMany(Product, { foreignKey: 'categoryId' });

  User.hasMany(CartItem, { foreignKey: 'userId' });
  CartItem.belongsTo(User, { foreignKey: 'userId' });
  Product.hasMany(CartItem, { foreignKey: 'productId' });
  CartItem.belongsTo(Product, { foreignKey: 'productId' });

  User.hasMany(Order, { foreignKey: 'user_id' });
  Order.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
};

module.exports = { sequelize, connectDB };
