// server/models/Ingredient.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Ingredient', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    ewg: {
      type: DataTypes.INTEGER, // 등급 1~10
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    usage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cost: {
      type: DataTypes.INTEGER, // 1kg 당 원가 (원)
      allowNull: true,
    },
  }, {
    tableName: 'ingredients',
    timestamps: true,
  });
};
