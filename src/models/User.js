import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const User = sequelize.define(
  "User",
  {
    openid: {
      type: DataTypes.STRING(28),
      primaryKey: true,
      allowNull: false,
      comment: "用户唯一标识",
    },
    session_key: {
      type: DataTypes.STRING(128),
      allowNull: true,
      comment: "用户会话凭据",
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "用户手机号码",
    },
    nickname: {
      type: DataTypes.STRING(28),
      allowNull: false,
      defaultValue: "小小只",
      comment: "用户昵称",
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue:
        "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
      comment: "用户头像",
    },
  },
  {
    tableName: "users",
    timestamps: false, // 禁用自动添加 createdAt 和 updatedAt 字段
  }
);

export default User;
