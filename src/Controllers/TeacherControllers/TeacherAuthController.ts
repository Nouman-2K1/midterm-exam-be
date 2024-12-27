import TeacherAuthService from "../../Services/TeacherServices/TeacherAuthService";
import { Request, Response } from "express";
interface TeacherAuthControllerType {
  registerTeacher: (req: Request, res: Response) => Promise<Response>;
  loginTeacher: (req: Request, res: Response) => Promise<Response>;
}

const TeacherAuthController: TeacherAuthControllerType = {
  registerTeacher: async (req: Request, res: Response): Promise<Response> => {
    try {
      const teacher = await TeacherAuthService.registerTeacher(req.body);
      return res
        .status(201)
        .json({ message: "teacher registered successfully" });
    } catch (error: any) {
      if (error.message === "teacher with this Email already exists") {
        return res
          .status(400)
          .json({ message: "teacher with this email already exists" });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  loginTeacher: async (req: Request, res: Response): Promise<Response> => {
    try {
      const session = req.session as unknown as {
        teacherToken: string;
        teacher: { id: number; name: string; email: string; role: string };
        save: () => any;
      };
      const teacher = await TeacherAuthService.loginTeacher(
        { session },
        req.body
      );
      const { teacherToken, teacherdata } = teacher;
      return res.status(200).json({
        message: "teacher Loged in Sussceefully",
        teacherToken,
        teacherdata,
      });
    } catch (error: any) {
      let statusCode = 500;
      if (error.message == "teacher with this email do not exist") {
        statusCode = 403;
      } else if (error.message == "Invalid Password") {
        statusCode = 403;
      }
      return res
        .status(statusCode)
        .json({ message: "Bad Requset", error: error.message });
    }
  },
};

export default TeacherAuthController;
