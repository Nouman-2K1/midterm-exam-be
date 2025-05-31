import { DataTypes } from "sequelize";
import sequelize from "../../DB/config";
import { Model } from "sequelize";
import DepartmentModel, {
  DepartmentAttributes,
} from "../DepartmentModels/DepartmentModels";
import TeacherModel, { TeacherAttributes } from "../TeacherModels/TeacherModel";
interface SubjectAttributes extends Model {
  subject_id: number;
  name: string;
  department_id: number;
  semester: number;
  academic_year: number;
  teacher_id: number;
  created_at?: Date;
  Teacher?: TeacherAttributes;
  Department?: DepartmentAttributes;
}

const SubjectModel = sequelize.define<SubjectAttributes>("Subject", {
  subject_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
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
  academic_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    references: { model: TeacherModel, key: "teacher_id" },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default SubjectModel;
