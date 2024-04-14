import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const ThemeSubscriberConnection = sequelize.define(
  "ThemeSubscriberConnection",
  {
    theme_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "主题唯一标识-外键",
    },
    openid: {
      type: DataTypes.STRING(28),
      allowNull: false,
      primaryKey: true,
      comment: "用户唯一标识-外键",
    },
  },
  {
    tableName: "theme_subscriber_conn",
    timestamps: false,
    comment: "主题和订阅者关联表",
  }
);

export default ThemeSubscriberConnection;
