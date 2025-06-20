// server/db/index.js
const { Sequelize } = require('sequelize');
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

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB 연결 성공');
  } catch (error) {
    console.error('❌ DB 연결 실패:', error);
  }
};

module.exports = { sequelize, connectDB };
