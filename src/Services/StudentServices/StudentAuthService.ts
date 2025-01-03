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
  }) => {
    const { name, email, password, role } = studentData;
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
    });

    return newStudent;
  },
  // at login time we don't need role
  loginStudent: async (
    req: {
      session: {
        studentToken: string;
        student: { id: number; name: string; email: string; role: string };
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
      id: student.id,
      name: student.name,
      email: student.email,
      role: student.role,
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
