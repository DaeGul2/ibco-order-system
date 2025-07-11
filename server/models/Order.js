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
    isApplied: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // ✅ 기본값 false
    },
  }, {
    tableName: 'orders',
    timestamps: true,
  });
};
