const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config').development;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
  }
);

// 모델 정의
const Ingredient = require('./Ingredient')(sequelize, DataTypes);
const Product = require('./Product')(sequelize, DataTypes);
const ProductIngredient = require('./ProductIngredient')(sequelize, DataTypes);
const Order = require('./Order')(sequelize, DataTypes);
const OrderItem = require('./OrderItem')(sequelize, DataTypes);
const OrderIngredientSummary = require('./OrderIngredientSummary')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);

// 관계 설정
ProductIngredient.belongsTo(Product, { foreignKey: 'productId' });
ProductIngredient.belongsTo(Ingredient, { foreignKey: 'ingredientId' });
Product.hasMany(ProductIngredient, { foreignKey: 'productId' });
Ingredient.hasMany(ProductIngredient, { foreignKey: 'ingredientId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });

Order.hasMany(OrderIngredientSummary, { foreignKey: 'orderId' });
OrderIngredientSummary.belongsTo(Order, { foreignKey: 'orderId' });
OrderIngredientSummary.belongsTo(Ingredient, { foreignKey: 'ingredientId' });
Ingredient.hasMany(OrderIngredientSummary, { foreignKey: 'ingredientId' });

module.exports = {
  sequelize,
  Sequelize,
  Ingredient,
  Product,
  ProductIngredient,
  Order,
  OrderItem,
  OrderIngredientSummary,
  User,
};
