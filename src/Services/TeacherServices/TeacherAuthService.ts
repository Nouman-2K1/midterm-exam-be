import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import TeacherModel from "../../Models/TeacherModels/TeacherModel";
import DepartmentModel from "../../Models/DepartmentModels/DepartmentModels";
import SubjectModel from "../../Models/SubjectModels/SubjectModels";
import SubjectEnrollmentModel from "../../Models/SubjectEnrollmentModels/SubjectEnrollmentModels";
import StudentModel from "../../Models/StudentModels/StudentModel";
import { Identifier, Op } from "sequelize";
import ExamModel from "../../Models/ExamModels/ExamModels";
import QuestionModel from "../../Models/QuestionModels/QuestionModels";
import ExamAttemptModel from "../../Models/ExamAttemptModels/ExamAttemptModels";
import ResponseModel from "../../Models/ResponseModels/ResponseModels";
import FlagModel from "../../Models/FlagModels/FlagModels";
import sequelize from "../../DB/config";
import AnnouncementModel from "../../Models/AnnouncementModel/AnnouncementModel";

const TeacherAuthService = {
  registerTeacher: async (teacherData: {
    name: any;
    email: any;
    password: any;
    department_id: any;
    role: any;
  }) => {
    const { name, email, password, role, department_id } = teacherData;
    const teacherExist = await TeacherModel.findOne({ where: { email, role } });

    if (teacherExist) {
      throw new Error("teacher with this Email already exists");
    }

    const hashedPassword = await hash(password, 10);

    const newTeacher = await TeacherModel.create({
      name,
      email,
      password: hashedPassword,
      department_id,
      role,
    });

    return newTeacher;
  },
  // at login time we don't need role
  loginTeacher: async (
    req: {
      session: {
        teacherToken: string;
        teacher: {
          teacher_id: number;
          name: string;
          email: string;
          role: string;
          department_id: number;
        };
        save: () => any;
      };
    },
    teacherData: { email: any; password: any }
  ) => {
    const { email, password } = teacherData;

    const teacher = await TeacherModel.findOne({ where: { email } });
    if (!teacher) {
      throw new Error(`teacher with this email do not exist`);
    }
    const comparedPassword = await compare(password, teacher.password);
    if (!comparedPassword) {
      throw new Error(`Invalid Password`);
    }
    const teacherdata = {
      teacher_id: teacher.teacher_id,
      name: teacher.name,
      email: teacher.email,
      department_id: teacher.department_id,
      role: teacher.role,
    };
    const teacherToken = jwt.sign(teacherdata, process.env.JWTSECRET!, {
      expiresIn: "14d",
    });
    req.session.teacherToken = teacherToken;
    req.session.teacher = teacherdata;
    console.log(req.session);
    await req.session.save();
    return {
      teacherToken,
      teacherdata,
    };
  },
  logoutTeacher: async (req: {
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
  fetchAllTeachers: async () => {
    try {
      interface TeacherAttributes {
        teacher_id: number;
        name: string;
        email: string;
        department_id: number;
        role: string;
        created_at: Date;
      }

      interface TeacherWithDepartment extends TeacherAttributes {
        Department: {
          name: string;
        };
      }

      const teachers = (await TeacherModel.findAll({
        attributes: [
          "teacher_id",
          "name",
          "email",
          "department_id",
          "role",
          "created_at",
        ],
        include: [
          {
            model: DepartmentModel,
            attributes: ["name"],
          },
        ],
        raw: true,
        nest: true,
      })) as unknown as TeacherWithDepartment[];

      const formattedTeachers = teachers.map((teacher) => ({
        teacher_id: teacher.teacher_id,
        name: teacher.name,
        email: teacher.email,
        department_id: teacher.department_id,
        role: teacher.role,
        created_at: teacher.created_at,
        department_name: teacher.Department.name,
      }));

      return formattedTeachers;
    } catch (error) {
      throw new Error("Failed to fetch teachers");
    }
  },
  deleteTeacher: async ({ teacherId }: { teacherId: number }) => {
    const deletedCount = await TeacherModel.destroy({
      where: { teacher_id: teacherId },
    });

    return deletedCount > 0;
  },
  async createSubject(subjectData: {
    name: string;
    department_id: number;
    semester: number;
    academic_year: string;
    teacher_id: number;
  }) {
    return await SubjectModel.create(subjectData);
  },
  async getAllSubjects() {
    return await SubjectModel.findAll();
  },

  async deleteSubject(subjectId: number) {
    return await SubjectModel.destroy({
      where: { subject_id: subjectId },
    });
  },
  async getEnrollments(subjectId: number) {
    return await SubjectEnrollmentModel.findAll({
      where: { subject_id: subjectId },
      include: [
        {
          model: StudentModel,
          as: "student", // Match the alias
          attributes: ["student_id", "name", "email"],
        },
      ],
    });
  },

  async getAvailableStudents(subjectId: number) {
    const enrolledStudents = await SubjectEnrollmentModel.findAll({
      where: { subject_id: subjectId },
      attributes: ["student_id"],
      raw: true,
    });

    const enrolledStudentIds = enrolledStudents.map((e) => e.student_id);

    return await StudentModel.findAll({
      where:
        enrolledStudentIds.length > 0
          ? { student_id: { [Op.notIn]: enrolledStudentIds } }
          : {},
      attributes: ["student_id", "name", "email"],
    });
  },

  async createEnrollment(enrollmentData: {
    subject_id: number;
    student_id: number;
  }) {
    const subject = await SubjectModel.findByPk(enrollmentData.subject_id);
    if (!subject) throw new Error("Subject not found");

    const student = await StudentModel.findByPk(enrollmentData.student_id);
    if (!student) throw new Error("Student not found");

    return await SubjectEnrollmentModel.create(enrollmentData);
  },

  async deleteEnrollment(enrollmentId: number) {
    const enrollment = await SubjectEnrollmentModel.findByPk(enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");

    await enrollment.destroy();
    return true;
  },
  async getSubjectsByTeacherId(teacherId: number) {
    return await SubjectModel.findAll({
      where: { teacher_id: teacherId },
    });
  },
  async createExam(examData: {
    name: string;
    subject_id: number;
    total_marks: number;
    duration_minutes: number;
    scheduled_time: Date;
    academic_year: number;
    created_by_teacher_id: number;
  }) {
    // Verify subject belongs to teacher
    const subject = await SubjectModel.findOne({
      where: {
        subject_id: examData.subject_id,
        teacher_id: examData.created_by_teacher_id,
      },
    });

    if (!subject) throw new Error("Subject not found or access denied");

    return await ExamModel.create(examData);
  },

  async getExamsByTeacher(teacherId: number) {
    return await ExamModel.findAll({
      where: { created_by_teacher_id: teacherId },
      include: [
        {
          model: SubjectModel,
          where: { teacher_id: teacherId },
          attributes: ["name"],
          required: true,
        },
      ],
    });
  },

  async deleteExam(examId: number, teacherId: number) {
    const exam = await ExamModel.findOne({
      where: {
        exam_id: examId,
        created_by_teacher_id: teacherId,
      },
    });

    if (!exam) throw new Error("Exam not found or access denied");

    await exam.destroy();
    return true;
  },
  async createQuestion(
    examId: number,
    questionData: { text: string; options: string[]; correctOption: number }
  ) {
    return await QuestionModel.create({ ...questionData, exam_id: examId });
  },

  async getQuestions(examId: number) {
    return await QuestionModel.findAll({
      where: { exam_id: examId },
      order: [["created_at", "ASC"]],
    });
  },

  async deleteQuestion(questionId: number, examId: number) {
    const question = await QuestionModel.findOne({
      where: {
        question_id: questionId,
        exam_id: examId,
      },
    });

    if (!question) throw new Error("Question not found");
    await question.destroy();
    return true;
  },
  getTeacherExams: async (teacherId: any) => {
    try {
      return await ExamModel.findAll({
        where: { created_by_teacher_id: teacherId },
        include: [{ model: SubjectModel, attributes: ["name"] }],
        order: [["scheduled_time", "DESC"]],
      });
    } catch (error) {
      throw new Error("Failed to retrieve teacher exams");
    }
  },

  getExamStudents: async (examId: any) => {
    try {
      return await ExamAttemptModel.findAll({
        where: { exam_id: examId },
        include: [
          {
            model: StudentModel,
            attributes: ["student_id", "name", "roll_number"],
          },
        ],
        attributes: ["attempt_id", "total_score", "status"],
      });
    } catch (error) {
      throw new Error("Failed to retrieve exam students");
    }
  },

  getStudentAttemptDetails: async (attemptId: number) => {
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

  getTeacherDashboardData: async (teacherId: number) => {
    try {
      // 1. Get teacher's subjects
      const teacherSubjects = await SubjectModel.findAll({
        where: { teacher_id: teacherId },
        attributes: ["subject_id"],
      });
      const subjectIds = teacherSubjects.map((s) => s.subject_id);

      if (subjectIds.length === 0) {
        return {
          stats: {
            totalSubjects: 0,
            upcomingExamsCount: 0,
            totalStudents: 0,
            pendingFlags: 0,
          },
          upcomingExams: [],
          recentAnnouncements: [],
          recentFlags: [],
        };
      }

      // 2. Get stats in parallel
      const [totalSubjects, upcomingExamsCount, totalStudents] =
        await Promise.all([
          SubjectModel.count({ where: { teacher_id: teacherId } }),
          ExamModel.count({
            where: {
              created_by_teacher_id: teacherId,
              scheduled_time: { [Op.gt]: new Date() },
            },
          }),
          SubjectEnrollmentModel.count({
            distinct: true,
            col: "student_id",
            where: { subject_id: { [Op.in]: subjectIds } },
          }),
        ]);

      // 3. Get pending flags count
      const pendingFlags = await FlagModel.count({
        where: { reviewed_by_teacher: false },
        include: [
          {
            model: ExamAttemptModel,
            required: true,
            include: [
              {
                model: ExamModel,
                required: true,
                where: { created_by_teacher_id: teacherId },
              },
            ],
          },
        ],
      });

      // 4. Get upcoming exams
      const upcomingExams = await ExamModel.findAll({
        where: {
          created_by_teacher_id: teacherId,
          scheduled_time: { [Op.gt]: new Date() },
        },
        order: [["scheduled_time", "ASC"]],
        limit: 5,
        include: [
          {
            model: SubjectModel,
            attributes: ["name"],
          },
        ],
      });

      // Add student counts to exams
      const examsWithCounts = await Promise.all(
        upcomingExams.map(async (exam) => {
          const studentCount = await SubjectEnrollmentModel.count({
            where: { subject_id: exam.subject_id },
          });
          return {
            ...exam.toJSON(),
            student_count: studentCount,
          };
        })
      );

      // 5. Get recent announcements
      const recentAnnouncements = await AnnouncementModel.findAll({
        where: { teacher_id: teacherId },
        order: [["created_at", "DESC"]],
        limit: 5,
        include: [
          {
            model: SubjectModel,
            attributes: ["name"],
          },
        ],
      });

      // 6. Get recent flags with exam and student info
      const recentFlags = await FlagModel.findAll({
        where: { reviewed_by_teacher: false },
        order: [["flagged_at", "DESC"]],
        limit: 5,
        include: [
          {
            model: ExamAttemptModel,
            required: true,
            as: "ExamAttempt",
            include: [
              {
                model: ExamModel,
                attributes: ["name"],
              },
              {
                model: StudentModel,
                attributes: ["name"],
              },
            ],
          },
        ],
      });

      return {
        stats: {
          totalSubjects,
          upcomingExamsCount,
          totalStudents,
          pendingFlags,
        },
        upcomingExams: examsWithCounts,
        recentAnnouncements,
        recentFlags: recentFlags.map((flag) => ({
          flag_id: flag.flag_id,
          flag_type: flag.flag_type,
          reason: flag.reason,
          flagged_at: flag.flagged_at,
          ExamAttempt: {
            Exam: flag.ExamAttempt.Exam,
            Student: flag.ExamAttempt.Student,
          },
        })),
      };
    } catch (error) {
      console.error("Error in teacherService.getTeacherDashboardData:", error);
      throw error;
    }
  },
};

export default TeacherAuthService;
