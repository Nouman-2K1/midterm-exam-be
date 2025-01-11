import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import Studentmodel from "../../Models/StudentModels/StudentModel";
import { promisify } from "util";

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
};

export default StudentAuthService;
