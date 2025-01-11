import { DataTypes, Model } from "sequelize";
import sequelize from "../../DB/config";
import ExamModel from "../ExamModels/ExamModels";

interface QuestionAttributes extends Model {
  question_id: number;
  exam_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  created_at?: Date;
}

const QuestionModel = sequelize.define<QuestionAttributes>("Question", {
  question_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  exam_id: {
    type: DataTypes.INTEGER,
    references: { model: ExamModel, key: "exam_id" },
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  option_a: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  option_b: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  option_c: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  option_d: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  correct_option: {
    type: DataTypes.CHAR(1),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default QuestionModel;
