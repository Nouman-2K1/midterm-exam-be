import { Router } from "express";
import AdminAuthValidator from "../../Validators/AdminValidators/AdminAuthValidator/AdminAuthValidator";
import AdminAuthController from "../../Controllers/AdminControllers/AdminAuthController";
import AuthenticateAdmin from "../../Middlewares/AdminMiddlewares/AuthenticateAdmin";
const AdminAuthRouter = Router();

AdminAuthRouter.post(
  "/register",
  AdminAuthValidator.registerAdmin,
  AdminAuthController.registerAdmin
);
AdminAuthRouter.post(
  "/login",
  AdminAuthValidator.loginAdmin,
  AdminAuthController.loginAdmin
);
AdminAuthRouter.post(
  "/logout",
  AuthenticateAdmin,
  AdminAuthController.logoutAdmin
);
AdminAuthRouter.get(
  "/exams",
  AuthenticateAdmin,
  AdminAuthController.getAdminExams
);
AdminAuthRouter.get(
  "/exams/:examId/students",
  AuthenticateAdmin,
  AdminAuthController.getAdminExamStudents
);
AdminAuthRouter.get(
  "/attempts/:attemptId/details",
  AuthenticateAdmin,
  AdminAuthController.getAdminStudentAttemptDetails
);
AdminAuthRouter.get(
  "/subjects",
  AuthenticateAdmin,
  AdminAuthController.getAdminSubjects
);
AdminAuthRouter.get(
  "/subjects/:subjectId/students",
  AuthenticateAdmin,
  AdminAuthController.getAdminSubjectStudents
);
AdminAuthRouter.get(
  "/exams/exams",
  AuthenticateAdmin,
  AdminAuthController.getAdminExamsExams
);
AdminAuthRouter.get(
  "/exams/:examId/questions",
  AuthenticateAdmin,
  AdminAuthController.getAdminExamQuestions
);
AdminAuthRouter.get(
  "/dashboard",
  AuthenticateAdmin,
  AdminAuthController.getAdminDashboardData
);

export default AdminAuthRouter;
