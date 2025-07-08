// server/models/IngredientInciKor.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('IngredientInciKor', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ingredientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    inciKorName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'ingredient_inci_kor',
    timestamps: true,
  });
};
