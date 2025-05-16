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
};

export default StudentAuthService;
