import { DataTypes } from "sequelize";
import sequelize from "../../DB/config";
import { Model } from "sequelize";
import ExamAttemptModel from "../ExamAttemptModels/ExamAttemptModels";
import StudentModel from "../StudentModels/StudentModel";

interface ResultAttributes extends Model {
  result_id: number;
  attempt_id: number;
  student_id: number;
  total_marks: number;
  status: string;
  created_at?: Date;
}

const ResultModel = sequelize.define<ResultAttributes>("Result", {
  result_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  attempt_id: {
    type: DataTypes.INTEGER,
    references: { model: ExamAttemptModel, key: "attempt_id" },
  },
  student_id: {
    type: DataTypes.INTEGER,
    references: { model: StudentModel, key: "student_id" },
  },
  total_marks: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default ResultModel;
