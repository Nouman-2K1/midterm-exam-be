import TeacherAuthService from "../../Services/TeacherServices/TeacherAuthService";
import { Request, Response } from "express";

interface TeacherAuthControllerType {
  registerTeacher: (req: Request, res: Response) => Promise<void>;
  loginTeacher: (req: Request, res: Response) => Promise<void>;
}

const TeacherAuthController: TeacherAuthControllerType = {
  registerTeacher: async (req: Request, res: Response): Promise<void> => {
    try {
      await TeacherAuthService.registerTeacher(req.body);
      res.status(201).json({ message: "Teacher registered successfully" });
    } catch (error: any) {
      if (error.message === "Teacher with this Email already exists") {
        res
          .status(400)
          .json({ message: "Teacher with this email already exists" });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  },

  loginTeacher: async (req: Request, res: Response): Promise<void> => {
    try {
      const session = req.session as unknown as {
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
      const teacher = await TeacherAuthService.loginTeacher(
        { session },
        req.body
      );
      const { teacherToken, teacherdata } = teacher;
      res.status(200).json({
        message: "Teacher logged in successfully",
        teacherToken,
        teacherdata,
      });
    } catch (error: any) {
      let statusCode = 500;
      if (error.message === "Teacher with this email does not exist") {
        statusCode = 403;
      } else if (error.message === "Invalid Password") {
        statusCode = 403;
      }
      res
        .status(statusCode)
        .json({ message: "Bad Request", error: error.message });
    }
  },
};

export default TeacherAuthController;
