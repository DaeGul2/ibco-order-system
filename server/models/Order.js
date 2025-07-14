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
    orderType: {
      type: DataTypes.ENUM('product', 'ingredient'),
      allowNull: false,
      defaultValue: 'product', // 기존 발주와 호환 위해
    }
  }, {
    tableName: 'orders',
    timestamps: true,
  });
};
