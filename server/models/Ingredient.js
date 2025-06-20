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
  }, {
    tableName: 'ingredients',
    timestamps: true,
  });
};
