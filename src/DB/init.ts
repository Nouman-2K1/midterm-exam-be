import AdminModel from "../Models/AdminModels/AdminModel";
import DepartmentModel from "../Models/DepartmentModels/DepartmentModels";
import SubjectModel from "../Models/SubjectModels/SubjectModels";
import TeacherModel from "../Models/TeacherModels/TeacherModel";
import StudentModel from "../Models/StudentModels/StudentModel";
import SubjectEnrollmentModel from "../Models/SubjectEnrollmentModels/SubjectEnrollmentModels";
import ExamModel from "../Models/ExamModels/ExamModels";
import ExamAttemptModel from "../Models/ExamAttemptModels/ExamAttemptModels";
import QuestionModel from "../Models/QuestionModels/QuestionModels";
import ResponseModel from "../Models/ResponseModels/ResponseModels";
import FlagModel from "../Models/FlagModels/FlagModels";
import ResultModel from "../Models/ResultModels/ResultsModels";
import NotificationModel from "../Models/NotificationModels/NotificationModels";
import setupModelRelations from "./modelRelations";

const dbInit = async () => {
  await AdminModel.sync({
    alter: true,
    force: false,
  });
  await DepartmentModel.sync({
    alter: true,
    force: false,
  });
  await TeacherModel.sync({
    alter: true,
    force: false,
  });
  await SubjectModel.sync({
    alter: true,
    force: false,
  });

  await StudentModel.sync({
    alter: true,
    force: false,
  });
  await SubjectEnrollmentModel.sync({
    alter: true,
    force: false,
  });
  await ExamModel.sync({
    alter: true,
    force: false,
  });
  await ExamAttemptModel.sync({
    alter: true,
    force: false,
  });
  await QuestionModel.sync({
    alter: true,
    force: false,
  });
  await ResponseModel.sync({
    alter: true,
    force: false,
  });
  await FlagModel.sync({
    alter: true,
    force: false,
  });
  await ResultModel.sync({
    alter: true,
    force: false,
  });
  await NotificationModel.sync({
    alter: true,
    force: false,
  });

  setupModelRelations();
};

export default dbInit;
