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
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
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
