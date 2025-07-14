// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { sequelize } = require('./models');


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const ingredientRoutes = require('./routes/ingredientRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const ingredientOrderRoutes = require('./routes/ingredientOrderRoutes');

// DB 연결
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ DB 테이블 동기화 완료');
});

// 라우트 연결

app.use('/api/ingredients', ingredientRoutes);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', productRoutes);
app.use('/api/orders/ingredients', ingredientOrderRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/warehouses', warehouseRoutes);


app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
