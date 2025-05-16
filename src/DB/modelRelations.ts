// setupModelRelations.ts
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

const setupModelRelations = () => {
  // ======================
  // 1. Subject Enrollment Relationships (Critical Fix)
  // ======================
  SubjectEnrollmentModel.belongsTo(SubjectModel, {
    foreignKey: "subject_id",
    as: "subject",
  });

  SubjectEnrollmentModel.belongsTo(StudentModel, {
    foreignKey: "student_id",
    as: "student",
  });

  StudentModel.hasMany(SubjectEnrollmentModel, {
    foreignKey: "student_id",
    as: "enrollments",
  });

  SubjectModel.hasMany(SubjectEnrollmentModel, {
    foreignKey: "subject_id",
    as: "enrollments",
  });

  // ======================
  // 2. Student Relationships
  // ======================
  StudentModel.belongsTo(DepartmentModel, {
    foreignKey: "department_id",
  });

  StudentModel.hasMany(ExamAttemptModel, {
    foreignKey: "student_id",
  });

  StudentModel.hasMany(ResultModel, {
    foreignKey: "student_id",
  });

  // ======================
  // 3. Subject Relationships
  // ======================
  SubjectModel.belongsTo(TeacherModel, {
    foreignKey: "teacher_id",
  });

  SubjectModel.belongsTo(DepartmentModel, {
    foreignKey: "department_id",
  });

  SubjectModel.hasMany(ExamModel, {
    foreignKey: "subject_id",
  });

  SubjectModel.hasMany(AnnouncementModel, {
    foreignKey: "subject_id",
  });

  // ======================
  // 4. Teacher Relationships
  // ======================
  TeacherModel.belongsTo(DepartmentModel, {
    foreignKey: "department_id",
  });

  TeacherModel.hasMany(SubjectModel, {
    foreignKey: "teacher_id",
  });

  TeacherModel.hasMany(AnnouncementModel, {
    foreignKey: "teacher_id",
    as: "announcements",
  });

  // ======================
  // 5. Exam Relationships
  // ======================
  ExamModel.belongsTo(SubjectModel, {
    foreignKey: "subject_id",
  });

  ExamModel.belongsTo(TeacherModel, {
    foreignKey: "created_by_teacher_id",
  });

  ExamModel.hasMany(QuestionModel, {
    foreignKey: "exam_id",
    onDelete: "CASCADE",
    hooks: true,
  });

  ExamModel.hasMany(ExamAttemptModel, {
    foreignKey: "exam_id",
    onDelete: "CASCADE",
    hooks: true,
  });

  // ======================
  // 6. Exam Attempt Relationships
  // ======================
  ExamAttemptModel.belongsTo(StudentModel, {
    foreignKey: "student_id",
  });

  ExamAttemptModel.belongsTo(ExamModel, {
    foreignKey: "exam_id",
  });

  ExamAttemptModel.hasMany(ResponseModel, {
    foreignKey: "attempt_id",
  });

  // ======================
  // 7. Question Relationships
  // ======================
  QuestionModel.belongsTo(ExamModel, {
    foreignKey: "exam_id",
  });

  QuestionModel.hasMany(ResponseModel, {
    foreignKey: "question_id",
  });

  // ======================
  // 8. Response Relationships
  // ======================
  ResponseModel.belongsTo(ExamAttemptModel, {
    foreignKey: "attempt_id",
  });

  // ======================
  // 9. Announcement Relationships
  // ======================
  AnnouncementModel.belongsTo(SubjectModel, {
    foreignKey: "subject_id",
  });

  AnnouncementModel.belongsTo(TeacherModel, {
    foreignKey: "teacher_id",
    as: "teacher", // Add this alias to match your service query
  });

  // ======================
  // 10. Notification Relationships
  // ======================
  NotificationModel.belongsTo(StudentModel, {
    foreignKey: "recipient_id",
    targetKey: "student_id",
  });

  NotificationModel.belongsTo(TeacherModel, {
    foreignKey: "recipient_id",
    targetKey: "teacher_id",
  });

  // ======================
  // 11. Result Relationships
  // ======================
  ResultModel.belongsTo(ExamAttemptModel, {
    foreignKey: "attempt_id",
  });

  // ======================
  // 12. Flag Relationships
  // ======================
  FlagModel.belongsTo(ExamAttemptModel, {
    foreignKey: "attempt_id",
  });
};

export default setupModelRelations;
