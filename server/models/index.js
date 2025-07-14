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
const IngredientInciKor = require('./IngredientInciKor')(sequelize, DataTypes);
const IngredientInciEng = require('./IngredientInciEng')(sequelize, DataTypes);
const OrderProductIngredient = require('./OrderProductIngredient')(sequelize, DataTypes);
const Warehouse = require('./Warehouse')(sequelize, DataTypes);
const WarehouseIngredient = require('./WarehouseIngredient')(sequelize, DataTypes);
const WarehousePriority = require('./WarehousePriority')(sequelize, DataTypes);
const OrderIngredientItem = require('./OrderIngredientItem')(sequelize, DataTypes);

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


Ingredient.hasMany(IngredientInciKor, { foreignKey: 'ingredientId' });
IngredientInciKor.belongsTo(Ingredient, { foreignKey: 'ingredientId' });

Ingredient.hasMany(IngredientInciEng, { foreignKey: 'ingredientId' });
IngredientInciEng.belongsTo(Ingredient, { foreignKey: 'ingredientId' });


OrderProductIngredient.belongsTo(Order, { foreignKey: 'orderId' });
OrderProductIngredient.belongsTo(Product, { foreignKey: 'productId' });
OrderProductIngredient.belongsTo(Ingredient, { foreignKey: 'ingredientId' });

Order.hasMany(OrderProductIngredient, { foreignKey: 'orderId' });
Product.hasMany(OrderProductIngredient, { foreignKey: 'productId' });
Ingredient.hasMany(OrderProductIngredient, { foreignKey: 'ingredientId' });


Warehouse.hasMany(WarehouseIngredient, { foreignKey: 'warehouseId' });
WarehouseIngredient.belongsTo(Warehouse, { foreignKey: 'warehouseId' });

Ingredient.hasMany(WarehouseIngredient, { foreignKey: 'ingredientId' });
WarehouseIngredient.belongsTo(Ingredient, { foreignKey: 'ingredientId' });

Warehouse.hasOne(WarehousePriority, { foreignKey: 'warehouseId' });
WarehousePriority.belongsTo(Warehouse, { foreignKey: 'warehouseId' });

Order.hasMany(OrderIngredientItem, { foreignKey: 'orderId' });
OrderIngredientItem.belongsTo(Order, { foreignKey: 'orderId' });

Ingredient.hasMany(OrderIngredientItem, { foreignKey: 'ingredientId' });
OrderIngredientItem.belongsTo(Ingredient, { foreignKey: 'ingredientId' });

Warehouse.hasMany(OrderIngredientItem, { foreignKey: 'warehouseId' });
OrderIngredientItem.belongsTo(Warehouse, { foreignKey: 'warehouseId' });


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
  IngredientInciKor,
  IngredientInciEng,
  OrderProductIngredient,
  Warehouse,
  WarehouseIngredient,
  WarehousePriority,
  OrderIngredientItem
};
