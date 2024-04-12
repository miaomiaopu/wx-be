import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const Tag = sequelize.define(
  "Tag",
  {
    tag_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "标签唯一标识",
    },
    tag_name: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "标签内容",
    },
  },
  {
    tableName: "tags",
    timestamps: false,
  }
);

export default Tag;
