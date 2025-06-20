// server/models/Order.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    writer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'orders',
    timestamps: true,
  });
};
