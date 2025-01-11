import { DataTypes } from "sequelize";
import sequelize from "../../DB/config";
import { Model } from "sequelize";
import DepartmentModel from "../DepartmentModels/DepartmentModels";

interface TeacherAttributes extends Model {
  teacher_id: number;
  name: string;
  email: string;
  password: string;
  department_id: number;
  created_at?: Date;
  role: string;
}

const TeacherModel = sequelize.define<TeacherAttributes>("Teacher", {
  teacher_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  department_id: {
    type: DataTypes.INTEGER,
    references: { model: DepartmentModel, key: "department_id" },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  role: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

export default TeacherModel;
