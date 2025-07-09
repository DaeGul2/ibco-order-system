// models/WarehouseIngredient.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('WarehouseIngredient', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ingredientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stockKg: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'warehouse_ingredients',
    timestamps: true,
  });
};
