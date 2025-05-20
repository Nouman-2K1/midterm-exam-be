// Controllers/ExamController.ts
import { Request, Response } from "express";
import ExamService from "../../Services/ExamService/ExamService";

export default class ExamController {
  static async startExam(req: Request, res: Response) {
    try {
      const examId = Number(req.params.examId);
      const studentId = Number(req.params.studentId);
      if (isNaN(examId) || isNaN(studentId)) {
        res.status(400).json({ error: "Invalid parameters" });
      }
      const attempt = await ExamService.startExamAttempt(examId, studentId);
      res.json(attempt);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async getActiveAttempt(req: Request, res: Response) {
    try {
      const studentId = Number(req.params.studentId);
      const attempt = await ExamService.getActiveAttempt(studentId);
      res.json(attempt);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
  static async getStudentAttempt(req: Request, res: Response) {
    try {
      const examId = Number(req.params.examId);
      const studentId = Number(req.params.studentId);

      const attempt = await ExamService.getStudentAttempt(examId, studentId);

      // 200 + JSON(null) if no attempt; JSON(object) if found
      res.json(attempt);
    } catch (err: any) {
      console.error("Error in getStudentAttempt:", err);
      res.status(400).json({ error: err.message });
    }
  }
  static async getQuestions(req: Request, res: Response) {
    try {
      const attemptId = Number(req.params.attemptId);
      const studentId = Number(req.params.studentId);
      const qs = await ExamService.getExamQuestions(attemptId, studentId);
      res.json(qs);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async saveResponse(req: Request, res: Response) {
    try {
      const attemptId = Number(req.params.attemptId);
      const studentId = Number(req.params.studentId);
      const { question_id, selected_option } = req.body;
      const resp = await ExamService.saveResponse(attemptId, {
        question_id: Number(question_id),
        selected_option: String(selected_option),
        student_id: studentId,
      });
      res.json(resp);
    } catch (err: any) {
      res
        .status(err.name === "EmptyResultError" ? 404 : 400)
        .json({ error: err.message });
    }
  }

  static async recordViolation(req: Request, res: Response) {
    try {
      const attemptId = Number(req.params.attemptId);
      const studentId = Number(req.params.studentId);
      const { reason } = req.body;
      const result = await ExamService.recordViolation(
        attemptId,
        studentId,
        reason || ""
      );
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async submitExam(req: Request, res: Response) {
    try {
      const attemptId = Number(req.params.attemptId);
      const studentId = Number(req.params.studentId);
      const result = await ExamService.submitAttempt(attemptId, studentId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async getProgress(req: Request, res: Response) {
    try {
      const attemptId = Number(req.params.attemptId);
      const studentId = Number(req.params.studentId);
      const progress = await ExamService.getExamProgress(attemptId, studentId);
      res.json(progress);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async getRemainingTime(req: Request, res: Response) {
    try {
      const attemptId = Number(req.params.attemptId);
      const studentId = Number(req.params.studentId);
      const remaining_time = await ExamService.getRemainingTime(
        attemptId,
        studentId
      );
      res.json({ remaining_time });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async forceSubmit(req: Request, res: Response) {
    try {
      const attemptId = Number(req.params.attemptId);
      const studentId = Number(req.params.studentId);
      const result = await ExamService.submitAttempt(
        attemptId,
        studentId,
        undefined,
        "disqualified"
      );
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
