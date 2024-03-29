import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const User = sequelize.define("User", {
  openid: {
    type: DataTypes.STRING(28),
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  session_key: {
    type: DataTypes.STRING(128),
    allowNull: true,
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  nickname: {
    type: DataTypes.STRING(28),
    allowNull: true,
  },
});

export default User;
