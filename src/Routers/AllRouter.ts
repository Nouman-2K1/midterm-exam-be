import { Router } from "express";
import AdminAuthRouter from "./AdminRouters/AdminAuthRouter";
import StudentAuthRouter from "./StudentRouters/StudentAuthRouter";
import TeacherAuthRouter from "./TeacherRouters/TeacherAuthRouter";
import DepartmentRouter from "./DepartmentRouters/DepartmentRouter";

const AllRouter = Router();

AllRouter.use("/auth/admin", AdminAuthRouter);
AllRouter.use("/auth/student", StudentAuthRouter);
AllRouter.use("/auth/teacher", TeacherAuthRouter);
AllRouter.use("/department", DepartmentRouter);

export default AllRouter;
