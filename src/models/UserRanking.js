import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const UserRanking = sequelize.define(
  "UserRanking",
  {
    openid: {
      type: DataTypes.STRING(28),
      primaryKey: true,
      allowNull: false,
      comment: "用户唯一标识",
    },
    nickname: {
      type: DataTypes.STRING(28),
      allowNull: false,
      comment: "用户昵称",
    },
    grade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "用户得分",
    },
  },
  {
    tableName: "user_ranking",
    timestamps: false,
  }
);

export default UserRanking;
