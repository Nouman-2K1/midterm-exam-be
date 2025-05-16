// src/Models/AnnouncementModels/AnnouncementModel.ts
import { Model, DataTypes, CreationOptional } from "sequelize";
import sequelize from "../../DB/config";
import SubjectModel from "../SubjectModels/SubjectModels";
import TeacherModel from "../TeacherModels/TeacherModel";

export interface AnnouncementAttributes {
  announcement_id: CreationOptional<number>;
  subject_id: number;
  teacher_id: number;
  title: string;
  content: string;
  created_at: CreationOptional<Date>;
}

interface AnnouncementCreationAttributes
  extends Omit<AnnouncementAttributes, "announcement_id" | "created_at"> {}

const AnnouncementModel = sequelize.define<
  Model<AnnouncementAttributes, AnnouncementCreationAttributes>
>(
  "announcement",
  {
    announcement_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SubjectModel,
        key: "subject_id",
      },
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TeacherModel,
        key: "teacher_id",
      },
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    modelName: "AnnouncementModel",
    tableName: "announcements",
    timestamps: false,
  }
);

export default AnnouncementModel;
