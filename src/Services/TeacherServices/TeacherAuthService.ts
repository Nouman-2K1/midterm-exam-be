import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import TeacherModel from "../../Models/TeacherModels/TeacherModel";
import DepartmentModel from "../../Models/DepartmentModels/DepartmentModels";

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
};

export default TeacherAuthService;
