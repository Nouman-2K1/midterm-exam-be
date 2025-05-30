import { DataTypes } from "sequelize";
import sequelize from "../../DB/config";
import { Model } from "sequelize";
import ExamModel from "../ExamModels/ExamModels";
import StudentModel from "../StudentModels/StudentModel";

interface ExamAttemptAttributes extends Model {
  Exam: any;
  Responses: any;
  attempt_id: number;
  exam_id: number;
  student_id: number;
  started_at?: Date;
  submitted_at?: Date;
  total_score?: number;
  flags_count: number;
  status: string;
}

const ExamAttemptModel = sequelize.define<ExamAttemptAttributes>(
  "ExamAttempt",
  {
    attempt_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    exam_id: {
      type: DataTypes.INTEGER,
      references: { model: ExamModel, key: "exam_id" },
    },
    student_id: {
      type: DataTypes.INTEGER,
      references: { model: StudentModel, key: "student_id" },
    },
    started_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    submitted_at: {
      type: DataTypes.DATE,
    },
    total_score: {
      type: DataTypes.INTEGER,
    },
    flags_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "ongoing",
      validate: {
        isIn: [["ongoing", "completed", "disqualified", "missed"]],
      },
    },
  }
);

export default ExamAttemptModel;
