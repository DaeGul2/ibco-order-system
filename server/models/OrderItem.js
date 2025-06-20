// server/models/OrderItem.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantityKg: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notePerIngredient: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    tableName: 'order_items',
    timestamps: true,
  });
};
