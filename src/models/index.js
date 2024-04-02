import User from "./User.js";
import Data from "./Data.js";

User.hasOne(Data, { onDelete: "CASCADE" });
Data.belongsTo(User, { foreignKey: "openid" });

export { User, Data };
