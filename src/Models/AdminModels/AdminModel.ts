import { DataTypes } from "sequelize";
import sequelize from "../../DB/config";

import { Model } from "sequelize";

interface AdminAttributes extends Model {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

const AdminModel = sequelize.define<AdminAttributes>("admin", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default AdminModel;
