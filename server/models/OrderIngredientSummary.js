// server/models/OrderIngredientSummary.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('OrderIngredientSummary', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ingredientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalAmountKg: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    unitCost: {
      type: DataTypes.INTEGER, // 1kg당 가격 (스냅샷용)
      allowNull: false,
    },
    totalCost: {
      type: DataTypes.INTEGER, // totalAmountKg × unitCost
      allowNull: false,
    },
  }, {
    tableName: 'order_ingredient_summaries',
    timestamps: true,
  });
};
