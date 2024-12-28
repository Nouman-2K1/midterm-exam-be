import { Router } from "express";
import TeacherAuthValidator from "../../Validators/TeacherValidators/TeacherAuthValidator/TeacherAuthValidator";
import TeacherAuthController from "../../Controllers/TeacherControllers/TeacherAuthController";
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

export default TeacherAuthRouter;
