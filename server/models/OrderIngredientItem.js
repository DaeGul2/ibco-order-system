module.exports = (sequelize, DataTypes) => {
  return sequelize.define('OrderIngredientItem', {
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
    quantityKg: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    unitCost: {
      type: DataTypes.INTEGER, // 발주 시점의 1kg당 가격
      allowNull: false,
    },
    totalCost: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false, // 발주 대상 창고
    },
  }, {
    tableName: 'order_ingredient_items',
    timestamps: true,
  });
};
