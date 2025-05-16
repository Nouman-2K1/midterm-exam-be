// src/Routes/AnnouncementRouter.ts
import { Router } from "express";
import AnnouncementController from "../../Controllers/AnnouncementController/AnnouncementController";
import AuthenticateTeacher from "../../Middlewares/TeacherMiddlewares/AuthenticateTeacher";

const AnnouncementRouter = Router();

AnnouncementRouter.post(
  "/",
  AuthenticateTeacher,
  AnnouncementController.createAnnouncement
);
AnnouncementRouter.get("/:subjectId", AnnouncementController.getAnnouncements);
AnnouncementRouter.delete(
  "/:id",
  AuthenticateTeacher,
  AnnouncementController.deleteAnnouncement
);

export default AnnouncementRouter;
