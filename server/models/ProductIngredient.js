// server/models/ProductIngredient.js (수정)
module.exports = (sequelize, DataTypes) => {
  const ProductIngredient = sequelize.define('ProductIngredient', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ingredientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
  }, {
    tableName: 'product_ingredients',
    timestamps: true,
  });

  // ✅ 관계 정의 추가
  ProductIngredient.associate = (models) => {
    ProductIngredient.belongsTo(models.Ingredient, { foreignKey: 'ingredientId' });
  };

  return ProductIngredient;
};
