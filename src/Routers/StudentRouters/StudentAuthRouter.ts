import { Router } from "express";
import StudentAuthValidator from "../../Validators/StudentValidators/StudentAuthValidator/StudentAuthValidator";
import StudentAuthController from "../../Controllers/StudentControllers/StudentAuthController";
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

export default StudentAuthRouter;
