import AdminAuthService from "../../Services/AdminServices/AdminAuthService";
import { Request, Response } from "express";

interface AdminAuthControllerType {
  registerAdmin: (req: Request, res: Response) => Promise<void>;
  loginAdmin: (req: Request, res: Response) => Promise<void>;
  logoutAdmin: (req: Request, res: Response) => Promise<void>;
  getAdminExams: (req: Request, res: Response) => Promise<void>;
  getAdminExamStudents: (req: Request, res: Response) => Promise<void>;
  getAdminStudentAttemptDetails: (req: Request, res: Response) => Promise<void>;
  getAdminSubjects: (req: Request, res: Response) => Promise<void>;
  getAdminSubjectStudents: (req: Request, res: Response) => Promise<void>;
  getAdminExamsExams: (req: Request, res: Response) => Promise<void>;
  getAdminExamQuestions: (req: Request, res: Response) => Promise<void>;
  getAdminDashboardData: (req: Request, res: Response) => Promise<void>;
}

const AdminAuthController: AdminAuthControllerType = {
  registerAdmin: async (req: Request, res: Response): Promise<void> => {
    try {
      await AdminAuthService.registerAdmin(req.body);
      res.status(201).json({ message: "Admin registered successfully" });
    } catch (error: any) {
      if (error.message === "Admin with this Email already exists") {
        res
          .status(400)
          .json({ message: "Admin with this email already exists" });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  },

  loginAdmin: async (req: Request, res: Response): Promise<void> => {
    try {
      const session = req.session as unknown as {
        adminToken: string;
        admin: { admin_id: number; name: string; email: string; role: string };
        save: () => any;
      };
      const admin = await AdminAuthService.loginAdmin({ session }, req.body);
      const { adminToken, admindata } = admin;
      res.status(200).json({
        message: "Admin logged in successfully",
        adminToken,
        admindata,
      });
    } catch (error: any) {
      let statusCode = 500;
      if (error.message === "Admin with this email does not exist") {
        statusCode = 403;
      } else if (error.message === "Invalid Password") {
        statusCode = 403;
      }
      res
        .status(statusCode)
        .json({ message: "Bad Request", error: error.message });
    }
  },
  logoutAdmin: async (req: Request, res: Response): Promise<void> => {
    try {
      await AdminAuthService.logoutAdmin(req);
      res.status(200).json({ message: "Admin logged out successfully" });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },
  getAdminExams: async (req: Request, res: Response) => {
    try {
      const exams = await AdminAuthService.getAdminExams();
      res.json(exams);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  getAdminExamStudents: async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      if (isNaN(examId)) {
        res.status(400).json({ error: "Invalid exam ID" });
        return;
      }
      const data = await AdminAuthService.getAdminExamStudents(examId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  getAdminStudentAttemptDetails: async (req: Request, res: Response) => {
    try {
      const attemptId = parseInt(req.params.attemptId);
      if (isNaN(attemptId)) {
        res.status(400).json({ error: "Invalid attempt ID" });
        return;
      }
      const details = await AdminAuthService.getAdminStudentAttemptDetails(
        attemptId
      );
      res.json(details);
    } catch (error: any) {
      if (error.message && error.message.includes("Attempt not found")) {
        res.status(404).json({ error: error.message });
      } else {
        console.error("Controller error:", error);
        res.status(500).json({ error: error.message });
      }
    }
  },
  getAdminSubjects: async (req: Request, res: Response) => {
    try {
      const subjects = await AdminAuthService.getAdminSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  getAdminSubjectStudents: async (req: Request, res: Response) => {
    try {
      const subjectId = parseInt(req.params.subjectId);
      if (isNaN(subjectId)) {
        res.status(400).json({ error: "Invalid subject ID" });
        return;
      }
      const data = await AdminAuthService.getAdminSubjectStudents(subjectId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
  getAdminExamsExams: async (req: Request, res: Response) => {
    try {
      const exams = await AdminAuthService.getAdminExamsExams();
      res.json(exams);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  getAdminExamQuestions: async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      if (isNaN(examId)) {
        res.status(400).json({ error: "Invalid exam ID" });
        return;
      }
      const data = await AdminAuthService.getAdminExamQuestions(examId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
  getAdminDashboardData: async (req: Request, res: Response) => {
    try {
      const data = await AdminAuthService.getAdminDashboardData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
};

export default AdminAuthController;
