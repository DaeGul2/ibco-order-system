// models/WarehousePriority.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('WarehousePriority', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    priorityOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'warehouse_priorities',
    timestamps: true,
  });
};
