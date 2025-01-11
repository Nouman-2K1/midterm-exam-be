import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import TeacherModel from "../../Models/TeacherModels/TeacherModel";

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
};

export default TeacherAuthService;
