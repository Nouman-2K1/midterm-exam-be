import { Router } from "express";
import AdminAuthRouter from "./AdminRouters/AdminAuthRouter";
import StudentAuthRouter from "./StudentRouters/StudentAuthRouter";
import TeacherAuthRouter from "./TeacherRouters/TeacherAuthRouter";
import DepartmentRouter from "./DepartmentRouters/DepartmentRouter";
import AnnouncementRouter from "./AnnouncementRouter/AnnouncementRouter";
import ExamRouter from "./ExamRouters/ExamRouters";

const AllRouter = Router();

AllRouter.use("/auth/admin", AdminAuthRouter);
AllRouter.use("/auth/student", StudentAuthRouter);
AllRouter.use("/auth/teacher", TeacherAuthRouter);
AllRouter.use("/department", DepartmentRouter);
AllRouter.use("/announcement", AnnouncementRouter);
AllRouter.use("/student/exams", ExamRouter);
export default AllRouter;
