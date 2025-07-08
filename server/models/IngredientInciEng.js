// server/models/IngredientInciEng.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('IngredientInciEng', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ingredientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    inciEngName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'ingredient_inci_eng',
    timestamps: true,
  });
};
