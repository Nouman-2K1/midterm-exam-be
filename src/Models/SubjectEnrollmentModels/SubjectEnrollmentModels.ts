import { DataTypes } from "sequelize";
import sequelize from "../../DB/config";
import { Model } from "sequelize";
import StudentModel from "../StudentModels/StudentModel";
import SubjectModel from "../SubjectModels/SubjectModels";

interface SubjectEnrollmentAttributes extends Model {
  enrollment_id: number;
  subject_id: number;
  student_id: number;
  enrolled_at?: Date;
}

const SubjectEnrollmentModel = sequelize.define<SubjectEnrollmentAttributes>(
  "SubjectEnrollment",
  {
    enrollment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    subject_id: {
      type: DataTypes.INTEGER,
      references: { model: SubjectModel, key: "subject_id" },
    },
    student_id: {
      type: DataTypes.INTEGER,
      references: { model: StudentModel, key: "student_id" },
    },
    enrolled_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }
);

export default SubjectEnrollmentModel;
