// server/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
  try {
    const { userId, password, userName } = req.body;
    const existing = await User.findOne({ where: { userId } });
    if (existing) return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ userId, password: hashed, userName });

    const token = generateToken(user);
    res.status(201).json({ user: { userId, userName }, token });
  } catch (err) {
    res.status(500).json({ message: '회원가입 실패', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await User.findOne({ where: { userId } });
    if (!user) return res.status(401).json({ message: '존재하지 않는 계정입니다.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

    const token = generateToken(user);
    res.status(200).json({ user: { userId, userName: user.userName }, token });
  } catch (err) {
    res.status(500).json({ message: '로그인 실패', error: err.message });
  }
};

// 토큰 검증 후 프론트가 로그인 상태 유지 판단 가능
exports.getProfile = async (req, res) => {
  const user = req.user; // 미들웨어에서 decoded된 사용자 정보
  res.status(200).json({ user });
};
