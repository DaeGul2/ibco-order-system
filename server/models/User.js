// server/models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.STRING(255), // 기본 255, 명시해두면 좋음
        allowNull: false,
        // unique: true, // ❌ 제거 (indexes로 관리)
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      // ✅ 인덱스는 “이름”을 고정해 1개만 유지되게 만든다
      indexes: [
        {
          name: 'uniq_users_userId', // 고정 이름
          unique: true,
          fields: ['userId'],
        },
      ],
    }
  );

  return User;
};
