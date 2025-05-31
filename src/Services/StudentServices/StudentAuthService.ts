import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import Studentmodel from "../../Models/StudentModels/StudentModel";
import { promisify } from "util";
import DepartmentModel from "../../Models/DepartmentModels/DepartmentModels";
import SubjectEnrollmentModel from "../../Models/SubjectEnrollmentModels/SubjectEnrollmentModels";
import SubjectModel from "../../Models/SubjectModels/SubjectModels";
import AnnouncementModel from "../../Models/AnnouncementModel/AnnouncementModel";
import TeacherModel from "../../Models/TeacherModels/TeacherModel";
import { Op } from "sequelize";
import sequelize from "sequelize";
import ExamModel from "../../Models/ExamModels/ExamModels";
import ExamAttemptModel from "../../Models/ExamAttemptModels/ExamAttemptModels";
import ResponseModel from "../../Models/ResponseModels/ResponseModels";
import QuestionModel from "../../Models/QuestionModels/QuestionModels";

// Add this import if ExamAttributes is defined in your ExamModels file

const StudentAuthService = {
  registerStudent: async (studentData: {
    name: any;
    email: any;
    password: any;
    role: any;
    roll_number: any;
    department_id: any;
    semester: any;
    admission_year: any;
    current_year: any;
    active_status: boolean;
  }) => {
    const {
      name,
      email,
      password,
      role,
      roll_number,
      department_id,
      semester,
      admission_year,
      current_year,
      active_status,
    } = studentData;
    const studentExist = await Studentmodel.findOne({ where: { email, role } });

    if (studentExist) {
      throw new Error("Student with this Email already exists");
    }

    const hashedPassword = await hash(password, 10);

    const newStudent = await Studentmodel.create({
      name,
      email,
      password: hashedPassword,
      role,
      roll_number,
      department_id,
      semester,
      admission_year,
      current_year,
      active_status,
    });

    return newStudent;
  },
  // at login time we don't need role
  loginStudent: async (
    req: {
      session: {
        studentToken: string;
        student: {
          student_id: number;
          name: string;
          email: string;
          role: string;
          roll_number: string;
          department_id: number;
          semester: number;
          admission_year: number;
          current_year: number;
          active_status: boolean;
        };
        save: () => any;
      };
    },
    studentData: { email: any; password: any }
  ) => {
    const { email, password } = studentData;

    const student = await Studentmodel.findOne({ where: { email } });
    if (!student) {
      throw new Error(`student with this email do not exist`);
    }
    const comparedPassword = await compare(password, student.password);
    if (!comparedPassword) {
      throw new Error(`Invalid Password`);
    }
    const studentdata = {
      student_id: student.student_id,
      name: student.name,
      email: student.email,
      role: student.role || "",
      roll_number: student.roll_number,
      department_id: student.department_id,
      semester: student.semester,
      admission_year: student.admission_year,
      current_year: student.current_year,
      active_status: student.active_status,
    };
    const studentToken = jwt.sign(studentdata, process.env.JWTSECRET!, {
      expiresIn: "14d",
    });
    req.session.studentToken = studentToken;
    req.session.student = studentdata;
    const saveSession = promisify(req.session.save).bind(req.session);
    await saveSession();
    return {
      studentToken,
      studentdata,
    };
  },
  logoutStudent: async (req: {
    session: { destroy: (callback: (err?: any) => void) => void };
  }) => {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(new Error("Logout failed"));
        } else {
          resolve("Logout successful");
        }
      });
    });
  },
  fetchAllStudents: async () => {
    try {
      interface StudentAttributes {
        student_id: number;
        roll_number: string;
        name: string;
        email: string;
        department_id: number | null;
        semester: number | null;
        admission_year: number;
        current_year: number;
        active_status: boolean;
        created_at: Date | null;
        role: string;
        createdAt: Date;
        updatedAt: Date;
      }

      interface StudentWithDepartment extends StudentAttributes {
        Department: {
          name: string;
        };
      }

      const students = (await Studentmodel.findAll({
        attributes: [
          "student_id",
          "roll_number",
          "name",
          "email",
          "department_id",
          "semester",
          "admission_year",
          "current_year",
          "active_status",
          "created_at",
          "role",
          "createdAt",
          "updatedAt",
        ],
        include: [
          {
            model: DepartmentModel,
            attributes: ["name"],
          },
        ],
        raw: true,
        nest: true,
      })) as unknown as StudentWithDepartment[];

      const formattedStudents = students.map((student) => ({
        student_id: student.student_id,
        roll_number: student.roll_number,
        name: student.name,
        email: student.email,
        department_id: student.department_id,
        semester: student.semester,
        admission_year: student.admission_year,
        current_year: student.current_year,
        active_status: student.active_status,
        created_at: student.created_at,
        role: student.role,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        department_name: student.Department ? student.Department.name : null,
      }));

      return formattedStudents;
    } catch (error) {
      throw new Error("Failed to fetch students");
    }
  },
  deleteStudent: async ({ studentId }: { studentId: number }) => {
    const deletedCount = await Studentmodel.destroy({
      where: { student_id: studentId },
    });

    return deletedCount > 0;
  },
  async getEnrolledClasses(studentId: number) {
    try {
      // Verify student exists
      const student = await Studentmodel.findByPk(studentId);
      if (!student) throw new Error("Student not found");

      // Get enrollments with subject details
      const enrollments = await SubjectEnrollmentModel.findAll({
        where: { student_id: studentId },
        include: [
          {
            model: SubjectModel,
            as: "subject",
            required: true,
            attributes: [
              "subject_id",
              "name",
              "department_id",
              "semester",
              "academic_year",
              "teacher_id",
              "created_at",
            ],
          },
        ],
        order: [["enrolled_at", "DESC"]],
      });

      // Format response
      return enrollments.map((enrollment) => ({
        ...enrollment.subject.get({ plain: true }),
        enrollment_id: enrollment.enrollment_id,
        enrolled_at: enrollment.enrolled_at,
      }));
    } catch (error) {
      console.error("Error fetching enrolled classes:", error);
      throw new Error("Failed to retrieve enrolled classes");
    }
  },
  async getClassAnnouncements(subjectId: number) {
    try {
      return await AnnouncementModel.findAll({
        where: { subject_id: subjectId },
        include: [
          {
            model: TeacherModel,
            attributes: ["name"],
            as: "teacher",
          },
        ],
        order: [["created_at", "DESC"]],
        raw: true,
        nest: true,
      });
    } catch (error) {
      console.error("Error fetching announcements:", error);
      throw new Error("Failed to retrieve announcements");
    }
  },
  async getStudentExams(
    studentId: number,
    status: "upcoming" | "ongoing" | "past"
  ) {
    try {
      const enrollments = await SubjectEnrollmentModel.findAll({
        where: { student_id: studentId },
        attributes: ["subject_id"],
        raw: true,
      });

      if (enrollments.length === 0) return [];
      const subjectIds = enrollments.map((e) => e.subject_id);
      const now = new Date();

      const whereCondition: {
        subject_id: number[];
        [Op.and]: (
          | object
          | sequelize.WhereAttributeHash
          | ReturnType<typeof sequelize.literal>
        )[];
      } = {
        subject_id: subjectIds,
        [Op.and]: [],
      };

      if (status === "upcoming") {
        whereCondition[Op.and].push({ scheduled_time: { [Op.gt]: now } });
      } else if (status === "ongoing") {
        whereCondition[Op.and].push({
          scheduled_time: { [Op.lte]: now },
        });
        whereCondition[Op.and].push(
          sequelize.literal(
            `(scheduled_time + INTERVAL '1 minute' * duration_minutes) > NOW()`
          )
        );
      } else if (status === "past") {
        whereCondition[Op.and].push(
          sequelize.literal(
            `(scheduled_time + INTERVAL '1 minute' * duration_minutes) <= NOW()`
          )
        );
      }

      return await ExamModel.findAll({
        where: whereCondition,
        include: [
          {
            model: SubjectModel,
            attributes: ["name"],
            as: "Subject",
          },
          {
            model: TeacherModel,
            attributes: ["name"],
            as: "Teacher",
          },
        ],
        order: [["scheduled_time", "ASC"]],
      });
    } catch (error) {
      console.error("Error fetching exams:", error);
      throw new Error(`Failed to retrieve ${status} exams`);
    }
  },
  async getExamDetailsById(examId: number) {
    try {
      const exam = await ExamModel.findByPk(examId, {
        include: [
          {
            model: SubjectModel,
            attributes: ["name"],
          },
          {
            model: TeacherModel,
            attributes: ["name"],
          },
        ],
      });

      if (!exam) {
        throw new Error("Exam not found");
      }

      return exam;
    } catch (error) {
      console.error("Error fetching exam details:", error);
      throw new Error("Failed to retrieve exam details");
    }
  },
  async getStudentResults(studentId: number) {
    try {
      // Get enrolled subjects
      const enrollments = await SubjectEnrollmentModel.findAll({
        where: { student_id: studentId },
        attributes: ["subject_id"],
      });

      if (enrollments.length === 0) return [];
      const subjectIds = enrollments.map((e) => e.subject_id);

      // Find completed exams (past end time)
      const completedExams = await ExamModel.findAll({
        where: {
          subject_id: subjectIds,
          [Op.and]: [
            sequelize.literal(
              `(scheduled_time + INTERVAL '1 minute' * duration_minutes) <= NOW()`
            ),
          ],
        },
        include: [
          { model: SubjectModel, attributes: ["name"] },
          { model: TeacherModel, attributes: ["name"] },
        ],
        order: [["scheduled_time", "DESC"]],
      });

      // Get exam attempts
      const examAttempts = await ExamAttemptModel.findAll({
        where: { student_id: studentId },
        attributes: ["exam_id", "status", "total_score"],
      });

      const examAttemptMap = new Map(
        examAttempts.map((attempt) => [attempt.exam_id, attempt])
      );

      // Map exam data with attempt status
      return completedExams.map((exam) => ({
        exam_id: exam.exam_id,
        name: exam.name,
        total_marks: exam.total_marks,
        duration_minutes: exam.duration_minutes,
        scheduled_time: exam.scheduled_time,
        Subject: exam.Subject,
        Teacher: exam.Teacher,
        attempted: examAttemptMap.has(exam.exam_id),
        status: examAttemptMap.get(exam.exam_id)?.status || "missed",
        score: examAttemptMap.get(exam.exam_id)?.total_score || 0,
      }));
    } catch (error) {
      console.error("Error fetching student results:", error);
      throw new Error("Failed to retrieve student results");
    }
  },
  async getExamResultDetails(studentId: number, examId: number) {
    try {
      // Get exam details
      const exam = await ExamModel.findByPk(examId, {
        include: [
          { model: SubjectModel, attributes: ["name"] },
          { model: TeacherModel, attributes: ["name"] },
        ],
      });

      if (!exam) {
        throw new Error("Exam not found");
      }

      // Extract exam data with proper typing
      const examData = {
        exam_id: exam.exam_id,
        name: exam.name,
        total_marks: exam.total_marks,
        duration_minutes: exam.duration_minutes,
        scheduled_time: exam.scheduled_time,
        Subject: exam.Subject
          ? { name: exam.Subject.name }
          : { name: "Unknown" },
        Teacher: exam.Teacher
          ? { name: exam.Teacher.name }
          : { name: "Unknown" },
      };

      // Get student's attempt
      const attempt = await ExamAttemptModel.findOne({
        where: {
          exam_id: examId,
          student_id: studentId,
          status: { [Op.in]: ["completed", "disqualified"] },
        },
      });

      if (!attempt) {
        throw new Error("You didn't attempt this exam");
      }

      // Get all questions for the exam
      const questions = await QuestionModel.findAll({
        where: { exam_id: examId },
        attributes: [
          "question_id",
          "question_text",
          "option_a",
          "option_b",
          "option_c",
          "option_d",
          "correct_option",
        ],
      });

      // Get student's responses
      const responses = await ResponseModel.findAll({
        where: { attempt_id: attempt.attempt_id },
        attributes: ["question_id", "selected_option", "is_correct"],
      });

      const responseMap = new Map(responses.map((r) => [r.question_id, r]));

      // Combine questions with student responses
      const detailedQuestions = questions.map((question) => {
        const response = responseMap.get(question.question_id);
        return {
          question_id: question.question_id,
          question_text: question.question_text,
          options: {
            A: question.option_a,
            B: question.option_b,
            C: question.option_c,
            D: question.option_d,
          },
          correct_option: question.correct_option,
          student_answer: response?.selected_option || null,
          is_correct: response?.is_correct || false,
        };
      });

      // Calculate score stats
      const correctCount = detailedQuestions.filter((q) => q.is_correct).length;
      const totalQuestions = detailedQuestions.length;
      const incorrectCount = totalQuestions - correctCount;
      const percentage =
        totalQuestions > 0
          ? Math.round((correctCount / totalQuestions) * 100)
          : 0;

      return {
        exam: examData,
        attempt: {
          started_at: attempt.started_at,
          submitted_at: attempt.submitted_at,
          total_score: attempt.total_score || 0,
          status: attempt.status,
        },
        questions: detailedQuestions,
        stats: {
          total_questions: totalQuestions,
          correct_count: correctCount,
          incorrect_count: incorrectCount,
          percentage: percentage,
        },
      };
    } catch (error) {
      console.error("Error fetching exam result details:", error);
      throw new Error("Failed to retrieve exam result details");
    }
  },
  async getDashboardData(studentId: number) {
    try {
      const enrollments = await SubjectEnrollmentModel.count({
        where: { student_id: studentId },
      });

      const enrolledSubjects = await SubjectEnrollmentModel.findAll({
        where: { student_id: studentId },
        attributes: ["subject_id"],
        raw: true,
      });
      const enrolledSubjectIds = enrolledSubjects.map((sub) => sub.subject_id);

      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      const endOfDay = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        23,
        59,
        59,
        999
      );

      const upcomingExamsCount = await ExamModel.count({
        where: {
          subject_id: enrolledSubjectIds,
          scheduled_time: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      const upcomingExams = await ExamModel.findAll({
        where: {
          subject_id: enrolledSubjectIds,
          scheduled_time: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
        include: [{ model: SubjectModel, attributes: ["name"] }],
        order: [["scheduled_time", "ASC"]],
        limit: 3,
      });

      const recentAnnouncements = await AnnouncementModel.findAll({
        include: [
          {
            model: SubjectModel,
            attributes: ["name"],
          },
        ],
        where: {
          subject_id: enrolledSubjectIds,
          created_at: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        order: [["created_at", "DESC"]],
        limit: 3,
      });

      const completedExams = await ExamAttemptModel.count({
        where: {
          student_id: studentId,
          status: "completed",
        },
      });

      const totalScoreSum = await ExamAttemptModel.sum("total_score", {
        where: {
          student_id: studentId,
          status: "completed",
        },
      });

      const averageScore =
        completedExams > 0 ? Math.round(totalScoreSum / completedExams) : 0;

      const stats = {
        totalClasses: enrollments,
        upcomingExamsCount,
        completedExams: completedExams,
        averageScore: averageScore,
      };

      return {
        upcomingExams,
        recentAnnouncements,
        stats,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw new Error("Failed to retrieve dashboard data");
    }
  },
};

export default StudentAuthService;
