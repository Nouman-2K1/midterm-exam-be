import { DataTypes } from "sequelize";
import sequelize from "../../DB/config";
import { Model } from "sequelize";
import ExamAttemptModel from "../ExamAttemptModels/ExamAttemptModels";
import QuestionModel from "../QuestionModels/QuestionModels";

interface ResponseAttributes extends Model {
  response_id: number;
  attempt_id: number;
  question_id: number;
  selected_option: string;
  is_correct?: boolean;
  answered_at?: Date;
}

const ResponseModel = sequelize.define<ResponseAttributes>("Response", {
  response_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  attempt_id: {
    type: DataTypes.INTEGER,
    references: { model: ExamAttemptModel, key: "attempt_id" },
  },
  question_id: {
    type: DataTypes.INTEGER,
    references: { model: QuestionModel, key: "question_id" },
  },
  selected_option: {
    type: DataTypes.CHAR(1),
    allowNull: false,
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
  },
  answered_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default ResponseModel;
