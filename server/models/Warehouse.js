// models/Warehouse.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Warehouse', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'warehouses',
    timestamps: true,
  });
};
