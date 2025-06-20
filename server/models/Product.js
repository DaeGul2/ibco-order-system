// server/models/Product.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'products',
    timestamps: true,
  });
};
