// server/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: '토큰이 없습니다.' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 이후 컨트롤러에서 req.user 사용 가능
    next();
  } catch (err) {
    return res.status(403).json({ message: '토큰이 유효하지 않습니다.' });
  }
};

module.exports = authenticate;
