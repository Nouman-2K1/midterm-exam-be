import { Router } from "express";
import TeacherAuthValidator from "../../Validators/TeacherValidators/TeacherAuthValidator/TeacherAuthValidator";
import TeacherAuthController from "../../Controllers/TeacherControllers/TeacherAuthController";
import AuthenticateTeacher from "../../Middlewares/TeacherMiddlewares/AuthenticateTeacher";
const TeacherAuthRouter = Router();

TeacherAuthRouter.post(
  "/register",
  TeacherAuthValidator.registerTeacher,
  TeacherAuthController.registerTeacher
);
TeacherAuthRouter.post(
  "/login",
  TeacherAuthValidator.loginTeacher,
  TeacherAuthController.loginTeacher
);
TeacherAuthRouter.post(
  "/logout",
  AuthenticateTeacher,
  TeacherAuthController.logoutTeacher
);
TeacherAuthRouter.get("/getAllTeacher", TeacherAuthController.getAllTeachers);
TeacherAuthRouter.delete(
  "/deleteTeacher/:teacher_id",
  TeacherAuthController.deleteTeacher
);
TeacherAuthRouter.post(
  "/createclasses",
  AuthenticateTeacher,
  TeacherAuthController.createSubject
);
TeacherAuthRouter.get(
  "/getclasses",
  AuthenticateTeacher,
  TeacherAuthController.getAllSubjects
);
TeacherAuthRouter.delete(
  "/deleteclasses/:id",
  AuthenticateTeacher,
  TeacherAuthController.deleteSubject
);

// Add these enrollment routes
TeacherAuthRouter.get(
  "/subject/:subjectId/enrollments",
  AuthenticateTeacher,
  TeacherAuthController.getEnrollments
);

TeacherAuthRouter.get(
  "/subject/:subjectId/students/available",
  AuthenticateTeacher,
  TeacherAuthController.getAvailableStudents
);

TeacherAuthRouter.post(
  "/enrollment/create",
  AuthenticateTeacher,
  TeacherAuthController.createEnrollment
);

TeacherAuthRouter.delete(
  "/enrollment/delete/:enrollmentId",
  AuthenticateTeacher,
  TeacherAuthController.deleteEnrollment
);

export default TeacherAuthRouter;
