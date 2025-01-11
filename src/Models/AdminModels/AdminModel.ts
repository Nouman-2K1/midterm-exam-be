import { DataTypes } from "sequelize";
import sequelize from "../../DB/config";

import { Model } from "sequelize";

interface AdminAttributes extends Model {
  admin_id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  created_at?: Date;
}

const AdminModel = sequelize.define<AdminAttributes>("admin", {
  admin_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  password: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  role: { type: DataTypes.STRING(50), allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export default AdminModel;
