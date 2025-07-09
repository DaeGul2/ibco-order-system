// server/models/OrderProductIngredient.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('OrderProductIngredient', {
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
    ingredientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amountPerKg: {
      type: DataTypes.DECIMAL(10, 4), // 제품 1kg당 비율 (%)
      allowNull: false,
    },
    unitCost: {
      type: DataTypes.INTEGER, // 원료 단가
      allowNull: false,
    },
    totalAmountKg: {
      type: DataTypes.DECIMAL(10, 4), // 실제 사용량
      allowNull: false,
    },
    totalCost: {
      type: DataTypes.INTEGER, // 단가 × 수량
      allowNull: false,
    },
  }, {
    tableName: 'order_product_ingredients',
    timestamps: true,
  });
};
