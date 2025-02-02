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

export default TeacherAuthRouter;
