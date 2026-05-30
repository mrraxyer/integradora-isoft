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

  // Define associations
  Product.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
  Category.hasMany(Product, { foreignKey: 'categoryId' });

  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
};

module.exports = { sequelize, connectDB };
