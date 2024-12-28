import { Router } from "express";
import AdminAuthValidator from "../../Validators/AdminValidators/AdminAuthValidator/AdminAuthValidator";
import AdminAuthController from "../../Controllers/AdminControllers/AdminAuthController";
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

export default AdminAuthRouter;
