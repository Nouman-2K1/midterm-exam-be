// Services/ExamService.ts
import { Op, Transaction } from "sequelize";
import sequelize from "../../DB/config";
import ExamAttemptModel from "../../Models/ExamAttemptModels/ExamAttemptModels";
import ExamModel from "../../Models/ExamModels/ExamModels";
import QuestionModel from "../../Models/QuestionModels/QuestionModels";
import ResponseModel from "../../Models/ResponseModels/ResponseModels";
import FlagModel from "../../Models/FlagModels/FlagModels";
import ResultModel from "../../Models/ResultModels/ResultsModels";

class ExamService {
  // 1. Start a new attempt (or throw if one already ongoing)
  static async startExamAttempt(examId: number, studentId: number) {
    return sequelize.transaction(async (t) => {
      // Changed to check for ANY existing attempt
      const existing = await ExamAttemptModel.findOne({
        where: {
          exam_id: examId,
          student_id: studentId,
          status: { [Op.in]: ["ongoing", "completed", "disqualified"] },
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (existing) {
        throw new Error("Exam already attempted");
      }

      // Keep existing question count check
      const count = await QuestionModel.count({
        where: { exam_id: examId },
        transaction: t,
      });
      if (count === 0) {
        throw new Error("Exam has no questions");
      }

      // Keep existing attempt creation
      const attempt = await ExamAttemptModel.create(
        {
          exam_id: examId,
          student_id: studentId,
          status: "ongoing",
          flags_count: 0,
        },
        { transaction: t }
      );
      return attempt;
    });
  }
  // 2. Fetch active attempt (if any)
  static async getActiveAttempt(studentId: number) {
    return ExamAttemptModel.findOne({
      where: { student_id: studentId, status: "ongoing" },
      include: [{ model: ExamModel, include: [QuestionModel] }],
    });
  }

  static async getStudentAttempt(examId: number, studentId: number) {
    return ExamAttemptModel.findOne({
      where: {
        exam_id: examId,
        student_id: studentId,
        status: {
          [Op.in]: ["ongoing", "completed", "disqualified"],
        },
      },
      include: [{ model: ExamModel, include: [QuestionModel] }],
    });
  }

  // 3. Fetch questions for an ongoing attempt
  static async getExamQuestions(attemptId: number, studentId: number) {
    const attempt = await ExamAttemptModel.findOne({
      where: {
        attempt_id: attemptId,
        student_id: studentId,
        status: "ongoing",
      },
    });
    if (!attempt) throw new Error("Invalid or completed attempt");

    // randomize per-request; for fixed order consider storing order on start
    return QuestionModel.findAll({
      where: { exam_id: attempt.exam_id },
      order: sequelize.random(),
    });
  }

  // 4. Save or update a single response
  static async saveResponse(
    attemptId: number,
    data: { question_id: number; selected_option: string; student_id: number }
  ) {
    return sequelize.transaction(async (t) => {
      const attempt = await ExamAttemptModel.findOne({
        where: {
          attempt_id: attemptId,
          student_id: data.student_id,
          status: "ongoing",
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
        rejectOnEmpty: true,
      });

      const question = await QuestionModel.findOne({
        where: {
          question_id: data.question_id,
          exam_id: attempt.exam_id,
        },
        transaction: t,
        rejectOnEmpty: true,
      });

      const isCorrect =
        data.selected_option.toLowerCase() ===
        question.correct_option.toLowerCase();

      const [response] = await ResponseModel.upsert(
        {
          attempt_id: attemptId,
          question_id: data.question_id,
          selected_option: data.selected_option.toLowerCase(),
          is_correct: isCorrect,
        },
        { transaction: t }
      );

      return response;
    });
  }

  // 5. Record a violation/flag; auto-submit on 3rd
  static async recordViolation(
    attemptId: number,
    studentId: number,
    reason: string
  ) {
    return sequelize.transaction(async (t) => {
      const attempt = await ExamAttemptModel.findOne({
        where: {
          attempt_id: attemptId,
          student_id: studentId,
          status: "ongoing",
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
        rejectOnEmpty: true,
      });

      await FlagModel.create(
        {
          attempt_id: attemptId,
          flag_type: "AUTO",
          reason: reason.slice(0, 255),
        },
        { transaction: t }
      );

      const newCount = attempt.flags_count + 1;
      await attempt.update({ flags_count: newCount }, { transaction: t });

      if (newCount >= 3) {
        // force submit on 3rd violation
        await this.submitAttempt(attemptId, studentId, t, "disqualified");
        return { status: "disqualified", flags: newCount };
      }

      return { flags: newCount };
    });
  }

  // 6. Submit an attempt (manual or forced), single result only
  static async submitAttempt(
    attemptId: number,
    studentId: number,
    externalTransaction?: Transaction,
    statusOverride: "completed" | "disqualified" = "completed"
  ) {
    const useTx = externalTransaction ?? (await sequelize.transaction());
    try {
      const attempt = await ExamAttemptModel.findOne({
        where: {
          attempt_id: attemptId,
          student_id: studentId,
          status: "ongoing",
        },
        transaction: useTx,
        lock: useTx.LOCK.UPDATE,
        rejectOnEmpty: true,
      });

      const responses = await ResponseModel.findAll({
        where: { attempt_id: attemptId },
        transaction: useTx,
      });
      const totalQ = await QuestionModel.count({
        where: { exam_id: attempt.exam_id },
        transaction: useTx,
      });

      const correctCount = responses.filter((r) => r.is_correct).length;
      const score = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

      await attempt.update(
        {
          status: statusOverride,
          submitted_at: new Date(),
          total_score: score,
        },
        { transaction: useTx }
      );

      // ensure single result
      const [result, created] = await ResultModel.findOrCreate({
        where: { attempt_id: attemptId },
        defaults: {
          student_id: studentId,
          total_marks: score,
          status: statusOverride,
        },
        transaction: useTx,
      });

      if (!externalTransaction) await useTx.commit();
      return result;
    } catch (err) {
      if (!externalTransaction) await useTx.rollback();
      throw err;
    }
  }

  // 7. Get exam progress (# answered / total)
  static async getExamProgress(attemptId: number, studentId: number) {
    const attempt = await ExamAttemptModel.findOne({
      where: { attempt_id: attemptId, student_id: studentId },
    });
    if (!attempt) throw new Error("Attempt not found");

    const answered = await ResponseModel.count({
      where: { attempt_id: attemptId },
    });
    const total = await QuestionModel.count({
      where: { exam_id: attempt.exam_id },
    });
    return { answered, total };
  }

  // 8. Get remaining time in ms
  static async getRemainingTime(attemptId: number, studentId: number) {
    const attempt = await ExamAttemptModel.findOne({
      where: { attempt_id: attemptId, student_id: studentId },
      include: [ExamModel],
    });
    if (!attempt || !attempt.started_at) throw new Error("Invalid attempt");

    const endTime =
      attempt.started_at.getTime() +
      (attempt as any).Exam.duration_minutes * 60000;
    return Math.max(0, endTime - Date.now());
  }
}

export default ExamService;
