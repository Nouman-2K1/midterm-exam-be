import { Router } from "express";
import StudentAuthValidator from "../../Validators/StudentValidators/StudentAuthValidator/StudentAuthValidator";
import StudentAuthController from "../../Controllers/StudentControllers/StudentAuthController";
import AuthenticateStudent from "../../Middlewares/StudentMiddlewares/AuthenticateStudent";
const StudentAuthRouter = Router();

StudentAuthRouter.post(
  "/register",
  StudentAuthValidator.registerStudent,
  StudentAuthController.registerStudent
);
StudentAuthRouter.post(
  "/login",
  StudentAuthValidator.loginStudent,
  StudentAuthController.loginStudent
);
StudentAuthRouter.post(
  "/logout",
  AuthenticateStudent,
  StudentAuthController.logoutStudent
);
StudentAuthRouter.get("/getAllStudent", StudentAuthController.getAllStudents);
StudentAuthRouter.delete(
  "/deleteStudent/:student_id",
  StudentAuthController.deleteStudent
);
StudentAuthRouter.get(
  "/student/:studentId/enrolled-classes",
  AuthenticateStudent,
  StudentAuthController.getEnrolledClasses
);
StudentAuthRouter.get(
  "/subject/:subjectId/announcements",
  AuthenticateStudent,
  StudentAuthController.getClassAnnouncements
);
export default StudentAuthRouter;
