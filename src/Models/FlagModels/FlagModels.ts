import { DataTypes } from "sequelize";
import sequelize from "../../DB/config";
import { Model } from "sequelize";
import ExamAttemptModel from "../ExamAttemptModels/ExamAttemptModels";

interface FlagAttributes extends Model {
  flag_id: number;
  attempt_id: number;
  flag_type: string;
  flagged_at?: Date;
  reason: string;
  reviewed_by_teacher: boolean;
  reviewed_by_admin: boolean;
}

const FlagModel = sequelize.define<FlagAttributes>("Flag", {
  flag_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  attempt_id: {
    type: DataTypes.INTEGER,
    references: { model: ExamAttemptModel, key: "attempt_id" },
  },
  flag_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  flagged_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  reviewed_by_teacher: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  reviewed_by_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

export default FlagModel;
