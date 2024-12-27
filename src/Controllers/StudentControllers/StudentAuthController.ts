import StudentAuthService from "../../Services/StudentServices/StudentAuthService";
import { Request, Response } from "express";
interface StudentAuthControllerType {
  registerStudent: (req: Request, res: Response) => Promise<Response>;
  loginStudent: (req: Request, res: Response) => Promise<Response>;
}

const StudentAuthController: StudentAuthControllerType = {
  registerStudent: async (req: Request, res: Response): Promise<Response> => {
    try {
      const student = await StudentAuthService.registerStudent(req.body);
      return res
        .status(201)
        .json({ message: "student registered successfully" });
    } catch (error: any) {
      if (error.message === "student with this Email already exists") {
        return res
          .status(400)
          .json({ message: "studemt with this email already exists" });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  loginStudent: async (req: Request, res: Response): Promise<Response> => {
    try {
      const session = req.session as unknown as {
        studentToken: string;
        student: { id: number; name: string; email: string; role: string };
        save: () => any;
      };
      const student = await StudentAuthService.loginStudent(
        { session },
        req.body
      );
      const { studentToken, studentdata } = student;
      return res.status(200).json({
        message: "student Loged in Sussceefully",
        studentToken,
        studentdata,
      });
    } catch (error: any) {
      let statusCode = 500;
      if (error.message == "student with this email do not exist") {
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

export default StudentAuthController;
