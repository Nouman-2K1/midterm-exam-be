import { DataTypes } from "sequelize";
import sequelize from "../../DB/config";
import { Model } from "sequelize";
import DepartmentModel from "../DepartmentModels/DepartmentModels";

interface StudentAttributes extends Model {
  student_id: number;
  roll_number: string;
  name: string;
  email: string;
  password: string;
  department_id: number;
  semester: number;
  admission_year: number;
  current_year: number;
  active_status: boolean;
  created_at?: Date;
  role?: string;
}

const StudentModel = sequelize.define<StudentAttributes>("Student", {
  student_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  roll_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
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
  semester: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 8 },
  },
  admission_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  current_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  active_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default StudentModel;
