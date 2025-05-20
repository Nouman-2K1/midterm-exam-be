import { DataTypes, Model } from "sequelize";
import sequelize from "../../DB/config"; // Adjust the path to your sequelize instance
import SubjectModel from "../SubjectModels/SubjectModels";
import TeacherModel from "../TeacherModels/TeacherModel";

interface ExamAttributes extends Model {
  questions: any;
  exam_id: number;
  subject_id: number;
  name: string;
  total_marks: number;
  duration_minutes: number;
  scheduled_time: Date;
  academic_year: number;
  created_by_teacher_id: number;
  created_at?: Date;
}

const ExamModel = sequelize.define<ExamAttributes>("Exam", {
  exam_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  subject_id: {
    type: DataTypes.INTEGER,
    references: { model: SubjectModel, key: "subject_id" },
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  total_marks: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  scheduled_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  academic_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_by_teacher_id: {
    type: DataTypes.INTEGER,
    references: { model: TeacherModel, key: "teacher_id" },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default ExamModel;
