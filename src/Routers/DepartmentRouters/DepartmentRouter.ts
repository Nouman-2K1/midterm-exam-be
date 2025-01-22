import { Router } from "express";
import DepartmentValidator from "../../Validators/DepartmentValidator/DepartmentValidator";
import DepartmentController from "../../Controllers/DepartmentController/DepartmentController";

const DepartmentRouter = Router();

DepartmentRouter.post(
  "/create",
  DepartmentValidator.createDepartment,
  DepartmentController.createDepartment
);

DepartmentRouter.get("/get", DepartmentController.getDepartments);
DepartmentRouter.delete(
  "/delete/:department_id",
  DepartmentValidator.deleteDepartment,
  DepartmentController.deleteDepartments
);

export default DepartmentRouter;
