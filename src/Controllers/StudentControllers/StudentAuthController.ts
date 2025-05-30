import StudentAuthService from "../../Services/StudentServices/StudentAuthService";
import { Request, Response } from "express";

interface StudentAuthControllerType {
  registerStudent: (req: Request, res: Response) => Promise<void>;
  loginStudent: (req: Request, res: Response) => Promise<void>;
  logoutStudent: (req: Request, res: Response) => Promise<void>;
  getAllStudents: (req: Request, res: Response) => Promise<void>;
  deleteStudent: (req: Request, res: Response) => Promise<void>;
  getEnrolledClasses: (req: Request, res: Response) => Promise<void>;
  getClassAnnouncements: (req: Request, res: Response) => Promise<void>;
  getStudentExams: (req: Request, res: Response) => Promise<void>;
  getExamDetails: (req: Request, res: Response) => Promise<void>;
  getStudentResults: (req: Request, res: Response) => Promise<void>;
  getExamResultDetails: (req: Request, res: Response) => Promise<void>;
  getDashboardData: (req: Request, res: Response) => Promise<void>;
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
  getAllStudents: async (req: Request, res: Response): Promise<void> => {
    try {
      const students = await StudentAuthService.fetchAllStudents();
      res
        .status(200)
        .json({ message: "Students fetched successfully", students });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },

  deleteStudent: async (req: Request, res: Response): Promise<void> => {
    try {
      const { student_id } = req.params;
      const deletedStudent = await StudentAuthService.deleteStudent({
        studentId: Number(student_id),
      });
      if (deletedStudent) {
        res.status(200).json({ message: "Student deleted successfully" });
      } else {
        res.status(404).json({ message: "Student not found" });
      }
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },
  getEnrolledClasses: async (req: Request, res: Response): Promise<void> => {
    try {
      const studentId = parseInt(req.params.studentId);
      if (isNaN(studentId)) {
        res.status(400).json({ error: "Invalid student ID" });
      }

      const subjects = await StudentAuthService.getEnrolledClasses(studentId);
      res.json(subjects);
    } catch (error: any) {
      res.status(500).json({
        error: error.message || "Failed to fetch enrolled classes",
      });
    }
  },
  getClassAnnouncements: async (req: Request, res: Response): Promise<void> => {
    try {
      const subjectId = parseInt(req.params.subjectId);
      if (isNaN(subjectId)) {
        res.status(400).json({ error: "Invalid subject ID" });
      }

      const announcements = await StudentAuthService.getClassAnnouncements(
        subjectId
      );
      res.json(announcements);
    } catch (error: any) {
      res.status(500).json({
        error: error.message || "Failed to fetch announcements",
      });
    }
  },
  getStudentExams: async (req: Request, res: Response): Promise<void> => {
    try {
      const studentId = parseInt(req.params.studentId);
      const status = req.query.status as "upcoming" | "ongoing" | "past";

      if (isNaN(studentId))
        res.status(400).json({ error: "Invalid student ID" });
      if (!["upcoming", "ongoing", "past"].includes(status)) {
        res.status(400).json({ error: "Invalid status parameter" });
      }

      const exams = await StudentAuthService.getStudentExams(studentId, status);
      res.json(exams);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch exams" });
    }
  },
  getExamDetails: async (req: Request, res: Response): Promise<void> => {
    try {
      const examId = parseInt(req.params.examId);

      if (isNaN(examId)) {
        res.status(400).json({ error: "Invalid exam ID" });
      }

      const exam = await StudentAuthService.getExamDetailsById(examId);
      res.json(exam);
    } catch (error: any) {
      if (error.message === "Exam not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to fetch exam details" });
      }
    }
  },
  getStudentResults: async (req: Request, res: Response): Promise<void> => {
    try {
      const studentId = parseInt(req.params.studentId);
      if (isNaN(studentId)) {
        res.status(400).json({ error: "Invalid student ID" });
        return;
      }

      const results = await StudentAuthService.getStudentResults(studentId);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({
        error: error.message || "Failed to fetch student results",
      });
    }
  },
  getExamResultDetails: async (req: Request, res: Response): Promise<void> => {
    try {
      const studentId = parseInt(req.params.studentId);
      const examId = parseInt(req.params.examId);

      if (isNaN(studentId) || isNaN(examId)) {
        res.status(400).json({ error: "Invalid student or exam ID" });
        return;
      }

      const resultDetails = await StudentAuthService.getExamResultDetails(
        studentId,
        examId
      );
      res.json(resultDetails);
    } catch (error: any) {
      if (error.message === "Exam not found") {
        res.status(404).json({ error: error.message });
      } else if (error.message === "You didn't attempt this exam") {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({
          error: error.message || "Failed to fetch exam result details",
        });
      }
    }
  },
  getDashboardData: async (req: Request, res: Response): Promise<void> => {
    try {
      const studentId = parseInt(req.params.studentId);
      if (isNaN(studentId)) {
        res.status(400).json({ error: "Invalid student ID" });
        return;
      }

      const dashboardData = await StudentAuthService.getDashboardData(
        studentId
      );
      res.json(dashboardData);
    } catch (error: any) {
      res.status(500).json({
        error: error.message || "Failed to fetch dashboard data",
      });
    }
  },
};

export default StudentAuthController;
