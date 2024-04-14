import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const CardLikeConnection = sequelize.define(
  "CardLikeConnection",
  {
    card_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "卡片唯一标识-外键",
    },
    openid: {
      type: DataTypes.STRING(28),
      allowNull: false,
      comment: "用户唯一标识-外键",
    },
  },
  {
    tableName: "card_like_conn",
    timestamps: false,
  }
);

export default CardLikeConnection;
