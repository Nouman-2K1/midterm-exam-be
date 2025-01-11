import StudentAuthService from "../../Services/StudentServices/StudentAuthService";
import { Request, Response } from "express";

interface StudentAuthControllerType {
  registerStudent: (req: Request, res: Response) => Promise<void>;
  loginStudent: (req: Request, res: Response) => Promise<void>;
  logoutStudent: (req: Request, res: Response) => Promise<void>;
}

const StudentAuthController: StudentAuthControllerType = {
  registerStudent: async (req: Request, res: Response): Promise<void> => {
    try {
      await StudentAuthService.registerStudent(req.body);
      res.status(201).json({ message: "Student registered successfully" });
    } catch (error: any) {
      if (error.message === "Student with this Email already exists") {
        res
          .status(400)
          .json({ message: "Student with this email already exists" });
      } else {
        res.status(500).json({
          message: "Internal Server Error",
          error: error.message,
        });
      }
    }
  },

  loginStudent: async (req: Request, res: Response): Promise<void> => {
    try {
      const session = req.session as unknown as {
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
      const student = await StudentAuthService.loginStudent(
        { session },
        req.body
      );
      const { studentToken, studentdata } = student;
      res.status(200).json({
        message: "Student logged in successfully",
        studentToken,
        studentdata,
      });
    } catch (error: any) {
      let statusCode = 500;
      if (error.message === "Student with this email does not exist") {
        statusCode = 403;
      } else if (error.message === "Invalid Password") {
        statusCode = 403;
      }
      res
        .status(statusCode)
        .json({ message: "Bad Request", error: error.message });
    }
  },
  logoutStudent: async (req: Request, res: Response): Promise<void> => {
    try {
      await StudentAuthService.logoutStudent(req);
      res.status(200).json({ message: "Student logged out successfully" });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },
};

export default StudentAuthController;
