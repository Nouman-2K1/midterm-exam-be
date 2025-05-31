import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import AdminModel from "../../Models/AdminModels/AdminModel";
import ExamModel from "../../Models/ExamModels/ExamModels";
import SubjectModel from "../../Models/SubjectModels/SubjectModels";
import TeacherModel from "../../Models/TeacherModels/TeacherModel";
import ExamAttemptModel from "../../Models/ExamAttemptModels/ExamAttemptModels";
import StudentModel from "../../Models/StudentModels/StudentModel";
import ResponseModel from "../../Models/ResponseModels/ResponseModels";
import QuestionModel from "../../Models/QuestionModels/QuestionModels";
import DepartmentModel from "../../Models/DepartmentModels/DepartmentModels";
import SubjectEnrollmentModel from "../../Models/SubjectEnrollmentModels/SubjectEnrollmentModels";
import { Op } from "sequelize";

interface SubjectWithAssociations {
  subject_id: number;
  name: string;
  semester: number;
  academic_year: number;
  teacher_id: number;
  department_id: number;
  Teacher: {
    teacher_id: number;
    name: string;
    email: string;
  };
  Department: {
    department_id: number;
    name: string;
  };
}

// Define type for subject enrollment with student
interface SubjectEnrollmentWithStudent {
  enrollment_id: number;
  subject_id: number;
  student_id: number;
  Student: {
    student_id: number;
    name: string;
    roll_number: string;
    email: string;
    admission_year: number;
    semester: number;
  };
}

const AdminAuthService = {
  registerAdmin: async (adminData: {
    name: any;
    email: any;
    password: any;
    role: any;
  }) => {
    const { name, email, password, role } = adminData;
    const adminExist = await AdminModel.findOne({ where: { email, role } });

    if (adminExist) {
      throw new Error("admin with this Email already exists");
    }

    const hashedPassword = await hash(password, 10);

    const newAdmin = await AdminModel.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return newAdmin;
  },
  // at login time we don't need role
  loginAdmin: async (
    req: {
      session: {
        adminToken: string;
        admin: { admin_id: number; name: string; email: string; role: string };
        save: () => any;
      };
    },
    adminData: { email: any; password: any }
  ) => {
    const { email, password } = adminData;

    const admin = await AdminModel.findOne({ where: { email } });
    if (!admin) {
      throw new Error(`admin with this email do not exist`);
    }
    const comparedPassword = await compare(password, admin.password);
    if (!comparedPassword) {
      throw new Error(`Invalid Password`);
    }
    const admindata = {
      admin_id: admin.admin_id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
    const adminToken = jwt.sign(admindata, process.env.JWTSECRET!, {
      expiresIn: "14d",
    });
    req.session.adminToken = adminToken;
    req.session.admin = admindata;
    console.log(req.session);
    await req.session.save();
    return {
      adminToken,
      admindata,
    };
  },
  logoutAdmin: async (req: {
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
  getAdminExams: async () => {
    try {
      return await ExamModel.findAll({
        include: [
          {
            model: SubjectModel,
            attributes: ["name"],
          },
          // Remove the 'as' property and use the correct association name
          {
            model: TeacherModel,
            attributes: ["teacher_id", "name"],
          },
        ],
        order: [["scheduled_time", "DESC"]],
      });
    } catch (error) {
      console.error("Error fetching admin exams:", error);
      throw new Error("Failed to retrieve all exams");
    }
  },
  getAdminExamStudents: async (examId: number) => {
    try {
      const exam = await ExamModel.findByPk(examId, {
        attributes: ["exam_id", "name"],
      });

      if (!exam) throw new Error("Exam not found");

      const students = await ExamAttemptModel.findAll({
        where: { exam_id: examId },
        include: [
          {
            model: StudentModel,
            attributes: ["student_id", "name", "roll_number"],
          },
        ],
        attributes: ["attempt_id", "total_score", "status"],
      });

      return { exam, students };
    } catch (error) {
      throw new Error("Failed to retrieve exam students");
    }
  },

  getAdminStudentAttemptDetails: async (attemptId: number) => {
    try {
      // Get attempt with student and exam details
      const attempt = await ExamAttemptModel.findByPk(attemptId, {
        include: [
          {
            model: StudentModel,
            attributes: ["student_id", "name", "roll_number"],
          },
          {
            model: ExamModel,
            attributes: ["name", "total_marks"],
            include: [{ model: SubjectModel, attributes: ["name"] }],
          },
        ],
      });

      if (!attempt) throw new Error("Attempt not found");

      // Get all responses for this attempt
      const responses = await ResponseModel.findAll({
        where: { attempt_id: attemptId },
        attributes: [
          "response_id",
          "question_id",
          "selected_option",
          "is_correct",
        ],
      });

      // Get all questions for the exam
      const questions = await QuestionModel.findAll({
        where: { exam_id: attempt.exam_id },
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

      // Create a map for quick question lookup
      const questionMap = new Map();
      questions.forEach((q) => questionMap.set(q.question_id, q));

      // Combine responses with questions
      const detailedResponses = responses.map((r) => ({
        response_id: r.response_id,
        selected_option: r.selected_option,
        is_correct: r.is_correct,
        question: questionMap.get(r.question_id),
      }));

      return {
        attempt,
        responses: detailedResponses,
      };
    } catch (error) {
      console.error("Error fetching attempt details:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to retrieve attempt details: ${errorMessage}`);
    }
  },
  getAdminSubjects: async () => {
    try {
      const subjects = await SubjectModel.findAll({
        include: [
          {
            model: TeacherModel,
            attributes: ["teacher_id", "name", "email"],
          },
          {
            model: DepartmentModel,
            attributes: ["department_id", "name"],
          },
        ],
        attributes: ["subject_id", "name", "semester", "academic_year"],
        order: [
          ["academic_year", "DESC"],
          ["semester", "ASC"],
        ],
      });

      // Map to ensure proper structure
      return subjects.map((subject) => {
        const plainSubject = subject.get({
          plain: true,
        }) as SubjectWithAssociations;
        return {
          subject_id: plainSubject.subject_id,
          name: plainSubject.name,
          semester: plainSubject.semester,
          academic_year: plainSubject.academic_year,
          Teacher: plainSubject.Teacher,
          Department: plainSubject.Department,
        };
      });
    } catch (error) {
      console.error("Error fetching subjects:", error);
      throw new Error("Failed to retrieve subjects");
    }
  },

  getAdminSubjectStudents: async (subjectId: number) => {
    try {
      // Step 1: Get subject details without associations
      const subject = await SubjectModel.findByPk(subjectId);
      if (!subject) throw new Error("Subject not found");

      // Step 2: Get teacher details separately
      const teacher = await TeacherModel.findByPk(subject.teacher_id);
      const department = await DepartmentModel.findByPk(subject.department_id);

      // Step 3: Get enrollments with student IDs
      const enrollments = await SubjectEnrollmentModel.findAll({
        where: { subject_id: subjectId },
        attributes: ["student_id"],
      });

      // Step 4: Extract student IDs
      const studentIds = enrollments.map((e) => e.student_id);

      // Step 5: Get student details in bulk
      const students = await StudentModel.findAll({
        where: { student_id: studentIds },
        attributes: [
          "student_id",
          "name",
          "roll_number",
          "email",
          "admission_year",
          "semester",
        ],
      });

      return {
        subject_name: subject.name,
        teacher_name: teacher?.name || "N/A",
        department_name: department?.name || "N/A",
        semester: subject.semester,
        academic_year: subject.academic_year,
        students: students.map((s) => s.get({ plain: true })),
      };
    } catch (error) {
      console.error("Error fetching subject students:", error);
      throw new Error("Failed to retrieve subject students");
    }
  },
  getAdminExamsExams: async () => {
    try {
      const exams = await ExamModel.findAll({
        attributes: [
          "exam_id",
          "name",
          "total_marks",
          "duration_minutes",
          "scheduled_time",
          "academic_year",
          "subject_id",
          "created_by_teacher_id",
        ],
        order: [["scheduled_time", "DESC"]],
      });

      // Get related data separately
      const subjectIds = exams.map((e) => e.subject_id);
      const teacherIds = exams.map((e) => e.created_by_teacher_id);

      // Get subjects
      const subjects = await SubjectModel.findAll({
        where: { subject_id: subjectIds },
        attributes: ["subject_id", "name"],
      });

      // Get teachers
      const teachers = await TeacherModel.findAll({
        where: { teacher_id: teacherIds },
        attributes: ["teacher_id", "name"],
      });

      // Create maps for quick lookup
      const subjectMap = new Map();
      subjects.forEach((s) => subjectMap.set(s.subject_id, s));

      const teacherMap = new Map();
      teachers.forEach((t) => teacherMap.set(t.teacher_id, t));

      // Map exam data with related info
      return exams.map((exam) => {
        const subject = subjectMap.get(exam.subject_id);
        const teacher = teacherMap.get(exam.created_by_teacher_id);

        return {
          exam_id: exam.exam_id,
          name: exam.name,
          total_marks: exam.total_marks,
          duration_minutes: exam.duration_minutes,
          scheduled_time: exam.scheduled_time,
          academic_year: exam.academic_year,
          subject_id: exam.subject_id,
          created_by_teacher_id: exam.created_by_teacher_id,
          subject_name: subject?.name || "N/A",
          teacher_name: teacher?.name || "N/A",
        };
      });
    } catch (error) {
      console.error("Error fetching exams:", error);
      throw new Error("Failed to retrieve exams");
    }
  },

  getAdminExamQuestions: async (examId: number) => {
    try {
      // Get exam details
      const exam = await ExamModel.findByPk(examId, {
        attributes: [
          "exam_id",
          "name",
          "total_marks",
          "subject_id",
          "created_by_teacher_id",
        ],
      });
      if (!exam) throw new Error("Exam not found");

      // Get subject
      const subject = await SubjectModel.findByPk(exam.subject_id, {
        attributes: ["name"],
      });

      // Get teacher
      const teacher = await TeacherModel.findByPk(exam.created_by_teacher_id, {
        attributes: ["name"],
      });

      // Get questions for exam
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
        order: [["question_id", "ASC"]],
      });

      return {
        exam_name: exam.name,
        subject_name: subject?.name || "N/A",
        teacher_name: teacher?.name || "N/A",
        total_marks: exam.total_marks,
        questions: questions.map((q) => q.get({ plain: true })),
      };
    } catch (error) {
      console.error("Error fetching exam questions:", error);
      throw new Error("Failed to retrieve exam questions");
    }
  },
  getAdminDashboardData: async () => {
    try {
      // Get counts using model count methods
      const [
        totalStudents,
        totalTeachers,
        totalExams,
        totalSubjects,
        totalDepartments,
      ] = await Promise.all([
        StudentModel.count(),
        TeacherModel.count(),
        ExamModel.count(),
        SubjectModel.count(),
        DepartmentModel.count(),
      ]);

      // Get upcoming exams (next 5)
      const recentExams = await ExamModel.findAll({
        where: {
          scheduled_time: {
            [Op.gte]: new Date(),
          },
        },
        order: [["scheduled_time", "ASC"]],
        limit: 5,
        attributes: ["exam_id", "name", "scheduled_time"],
        include: [
          {
            model: SubjectModel,
            attributes: ["name"],
          },
        ],
      });

      // Format recent exams
      const formattedRecentExams = recentExams.map((exam) => ({
        exam_id: exam.exam_id,
        name: exam.name,
        scheduled_time: exam.scheduled_time,
        subject_name: exam.Subject?.name || "N/A",
      }));

      // Get exam statistics without raw queries
      const exams = await ExamModel.findAll({
        attributes: ["exam_id", "name"],
        order: [["scheduled_time", "DESC"]],
        limit: 5,
      });

      const examStats = await Promise.all(
        exams.map(async (exam) => {
          const attempts = await ExamAttemptModel.count({
            where: { exam_id: exam.exam_id },
          });

          // Calculate average score manually
          const examAttempts = await ExamAttemptModel.findAll({
            where: { exam_id: exam.exam_id },
            attributes: ["total_score"],
          });

          let avgScore = 0;
          if (examAttempts.length > 0) {
            const total = examAttempts.reduce(
              (sum, attempt) => sum + (attempt.total_score || 0),
              0
            );
            avgScore = Math.round(total / examAttempts.length);
          }

          return {
            name: exam.name,
            attempts: attempts,
            avg_score: avgScore,
          };
        })
      );

      return {
        totalStudents,
        totalTeachers,
        totalExams,
        totalSubjects,
        totalDepartments,
        recentExams: formattedRecentExams,
        examStats,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw new Error("Failed to retrieve dashboard data");
    }
  },
};

export default AdminAuthService;
