const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CartItem = sequelize.define(
  'CartItem',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
  },
  {
    tableName: 'cart_items',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'productId'],
      },
    ],
  }
);

module.exports = CartItem;
