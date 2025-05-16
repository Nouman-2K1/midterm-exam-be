import TeacherModel from "../Models/TeacherModels/TeacherModel";
import StudentModel from "../Models/StudentModels/StudentModel";
import DepartmentModel from "../Models/DepartmentModels/DepartmentModels";
import ExamAttemptModel from "../Models/ExamAttemptModels/ExamAttemptModels";
import ExamModel from "../Models/ExamModels/ExamModels";
import FlagModel from "../Models/FlagModels/FlagModels";
import NotificationModel from "../Models/NotificationModels/NotificationModels";
import QuestionModel from "../Models/QuestionModels/QuestionModels";
import ResponseModel from "../Models/ResponseModels/ResponseModels";
import ResultModel from "../Models/ResultModels/ResultsModels";
import SubjectEnrollmentModel from "../Models/SubjectEnrollmentModels/SubjectEnrollmentModels";
import SubjectModel from "../Models/SubjectModels/SubjectModels";
import AnnouncementModel from "../Models/AnnouncementModel/AnnouncementModel";

// Define all relationships here
const setupModelRelations = () => {
  // Exam Model Relationships
  ExamModel.belongsTo(SubjectModel, { foreignKey: "subject_id" });
  ExamModel.belongsTo(TeacherModel, { foreignKey: "created_by_teacher_id" });
  ExamModel.hasMany(QuestionModel, { foreignKey: "exam_id" });
  ExamModel.hasMany(ExamAttemptModel, { foreignKey: "exam_id" });

  // Flag Model Relationships
  FlagModel.belongsTo(ExamAttemptModel, { foreignKey: "attempt_id" });

  // Notification Model Relationships
  NotificationModel.belongsTo(StudentModel, {
    foreignKey: "recipient_id",
    targetKey: "student_id",
  });
  NotificationModel.belongsTo(TeacherModel, {
    foreignKey: "recipient_id",
    targetKey: "teacher_id",
  });

  // Question Model Relationships
  QuestionModel.belongsTo(ExamModel, { foreignKey: "exam_id" });

  // Response Model Relationships
  ResponseModel.belongsTo(ExamAttemptModel, { foreignKey: "attempt_id" });
  ResponseModel.belongsTo(QuestionModel, { foreignKey: "question_id" });

  // Result Model Relationships
  ResultModel.belongsTo(ExamAttemptModel, { foreignKey: "attempt_id" });
  ResultModel.belongsTo(StudentModel, { foreignKey: "student_id" });

  // Student Model Relationships
  StudentModel.belongsTo(DepartmentModel, { foreignKey: "department_id" });
  StudentModel.hasMany(SubjectEnrollmentModel, { foreignKey: "student_id" });
  StudentModel.hasMany(ExamAttemptModel, { foreignKey: "student_id" });
  StudentModel.hasMany(ResultModel, { foreignKey: "student_id" });

  // SubjectEnrollment Model Relationships
  SubjectEnrollmentModel.belongsTo(StudentModel, {
    foreignKey: "student_id",
    as: "student", // Add alias
  });

  StudentModel.hasMany(SubjectEnrollmentModel, {
    foreignKey: "student_id",
    as: "enrollments",
  });

  // Subject Model Relationships
  SubjectModel.hasMany(SubjectEnrollmentModel, {
    foreignKey: "subject_id",
    as: "enrollments", // Add alias
  });
  SubjectModel.belongsTo(TeacherModel, { foreignKey: "teacher_id" });
  SubjectModel.belongsTo(DepartmentModel, { foreignKey: "department_id" });
  SubjectModel.hasMany(ExamModel, { foreignKey: "subject_id" });

  // Teacher Model Relationships
  TeacherModel.belongsTo(DepartmentModel, { foreignKey: "department_id" });
  TeacherModel.hasMany(SubjectModel, { foreignKey: "teacher_id" });
  // Relationships
  AnnouncementModel.belongsTo(SubjectModel, { foreignKey: "subject_id" });
  AnnouncementModel.belongsTo(TeacherModel, { foreignKey: "teacher_id" });
  SubjectModel.hasMany(AnnouncementModel, { foreignKey: "subject_id" });
  TeacherModel.hasMany(AnnouncementModel, { foreignKey: "teacher_id" });
};

export default setupModelRelations;
