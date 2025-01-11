import { DataTypes } from "sequelize";
import sequelize from "../../DB/config";
import { Model } from "sequelize";

interface DepartmentAttributes extends Model {
  department_id: number;
  name: string;
  created_at?: Date;
}

const DepartmentModel = sequelize.define<DepartmentAttributes>("Department", {
  department_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default DepartmentModel;
