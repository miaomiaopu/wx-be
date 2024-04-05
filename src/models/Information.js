import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const Information = sequelize.define(
  "Information",
  {
    info_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "消息唯一标识",
    },
    openid: {
      type: DataTypes.STRING(28),
      allowNull: false,
      comment: "用户唯一标识-外键",
    },
    message: {
      type: DataTypes.STRING(256),
      allowNull: false,
      comment: "消息内容",
    },
    is_handle: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: "消息是否处理",
    },
    create_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      comment: "发送时间",
    },
  },
  {
    tableName: "infomations",
    timestamps: false, // 禁用自动添加 createdAt 和 updatedAt 字段
  }
);

export default Information;
