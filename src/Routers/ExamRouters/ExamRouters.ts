import { Router } from "express";
import ExamController from "../../Controllers/ExamController/ExamController";
import AuthenticateStudent from "../../Middlewares/StudentMiddlewares/AuthenticateStudent";

const ExamRouter = Router();

// Complete endpoint definitions
ExamRouter.post(
  "/:examId/start/:studentId",
  AuthenticateStudent,
  ExamController.startExam
);

ExamRouter.get(
  "/attempts/active/:studentId",
  AuthenticateStudent,
  ExamController.getActiveAttempt
);
ExamRouter.get(
  "/:examId/attempt-status/:studentId",
  AuthenticateStudent,
  ExamController.getStudentAttempt
);
ExamRouter.get(
  "/:examId/attempts/:attemptId/questions/:studentId",
  AuthenticateStudent,
  ExamController.getQuestions
);

ExamRouter.post(
  "/:examId/attempts/:attemptId/responses/:studentId",
  AuthenticateStudent,
  ExamController.saveResponse
);

ExamRouter.post(
  "/:examId/attempts/:attemptId/flags/:studentId",
  AuthenticateStudent,
  ExamController.recordViolation
);

ExamRouter.post(
  "/:examId/attempts/:attemptId/submit/:studentId",
  AuthenticateStudent,
  ExamController.submitExam
);

ExamRouter.get(
  "/:examId/attempts/:attemptId/progress/:studentId",
  AuthenticateStudent,
  ExamController.getProgress
);

ExamRouter.post(
  "/:examId/attempts/:attemptId/force-submit/:studentId",
  AuthenticateStudent,
  ExamController.forceSubmit
);
ExamRouter.get(
  "/:examId/attempts/:attemptId/time/:studentId",
  AuthenticateStudent,
  ExamController.getRemainingTime
);

export default ExamRouter;
