import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import TeacherModel from "../../Models/TeacherModels/TeacherModel";
import DepartmentModel from "../../Models/DepartmentModels/DepartmentModels";
import SubjectModel from "../../Models/SubjectModels/SubjectModels";
import SubjectEnrollmentModel from "../../Models/SubjectEnrollmentModels/SubjectEnrollmentModels";
import StudentModel from "../../Models/StudentModels/StudentModel";
import { Op } from "sequelize";
import ExamModel from "../../Models/ExamModels/ExamModels";
import QuestionModel from "../../Models/QuestionModels/QuestionModels";

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
};

export default TeacherAuthService;
