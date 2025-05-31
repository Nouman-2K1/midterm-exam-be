import TeacherAuthService from "../../Services/TeacherServices/TeacherAuthService";
import { Request, Response } from "express";

interface TeacherAuthControllerType {
  registerTeacher: (req: Request, res: Response) => Promise<void>;
  loginTeacher: (req: Request, res: Response) => Promise<void>;
  logoutTeacher: (req: Request, res: Response) => Promise<void>;
  getAllTeachers: (req: Request, res: Response) => Promise<void>;
  deleteTeacher: (req: Request, res: Response) => Promise<void>;
  createSubject: (req: Request, res: Response) => Promise<void>;
  getAllSubjects: (req: Request, res: Response) => Promise<void>;
  deleteSubject: (req: Request, res: Response) => Promise<void>;
  getEnrollments: (req: Request, res: Response) => Promise<void>;
  getAvailableStudents: (req: Request, res: Response) => Promise<void>;
  createEnrollment: (req: Request, res: Response) => Promise<void>;
  deleteEnrollment: (req: Request, res: Response) => Promise<void>;
  getSubjectsByTeacherId: (req: Request, res: Response) => Promise<void>;
  createExam: (req: Request, res: Response) => Promise<void>;
  getExamsByTeacher: (req: Request, res: Response) => Promise<void>;
  deleteExam: (req: Request, res: Response) => Promise<void>;
  createQuestion: (req: Request, res: Response) => Promise<void>;
  getQuestions: (req: Request, res: Response) => Promise<void>;
  deleteQuestion: (req: Request, res: Response) => Promise<void>;
  getTeacherExams: (req: Request, res: Response) => Promise<void>;
  getExamStudents: (req: Request, res: Response) => Promise<void>;
  getStudentAttemptDetails: (req: Request, res: Response) => Promise<void>;
  getTeacherDashboard: (req: Request, res: Response) => Promise<void>;
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
  logoutTeacher: async (req: Request, res: Response): Promise<void> => {
    try {
      await TeacherAuthService.logoutTeacher(req);
      res.status(200).json({ message: "Teacher logged out successfully" });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },
  getAllTeachers: async (req: Request, res: Response): Promise<void> => {
    try {
      const teachers = await TeacherAuthService.fetchAllTeachers();
      res
        .status(200)
        .json({ message: "Teachers fetched successfully", teachers });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },
  deleteTeacher: async (req: Request, res: Response): Promise<void> => {
    try {
      const { teacher_id } = req.params; // Use department_id here
      const deletedTeacher = await TeacherAuthService.deleteTeacher({
        teacherId: Number(teacher_id),
      });
      if (deletedTeacher) {
        res.status(200).json({ message: "Teacher deleted successfully" });
      } else {
        res.status(404).json({ message: "Teacher not found" });
      }
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },
  createSubject: async (req: Request, res: Response) => {
    try {
      console.log(req.body);
      const subject = await TeacherAuthService.createSubject(req.body);
      console.log(subject);
      res.status(201).json(subject);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(500).json({ error: "Failed to create subject" });
    }
  },
  getAllSubjects: async (req: Request, res: Response) => {
    try {
      const subjects = await TeacherAuthService.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  },
  deleteSubject: async (req: Request, res: Response) => {
    try {
      await TeacherAuthService.deleteSubject(Number(req.params.id)); // Use params.id
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subject" });
    }
  },
  getEnrollments: async (req, res) => {
    try {
      const enrollments = await TeacherAuthService.getEnrollments(
        Number(req.params.subjectId) // Not req.params.subject_id
      );
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch enrollments" });
    }
  },

  getAvailableStudents: async (req, res) => {
    try {
      const students = await TeacherAuthService.getAvailableStudents(
        Number(req.params.subjectId) // Not req.params.subject_id
      );
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch available students" });
    }
  },

  createEnrollment: async (req: Request, res: Response) => {
    try {
      const enrollment = await TeacherAuthService.createEnrollment(req.body);
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create enrollment" });
    }
  },

  deleteEnrollment: async (req: Request, res: Response) => {
    try {
      await TeacherAuthService.deleteEnrollment(
        Number(req.params.enrollmentId)
      );
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete enrollment" });
    }
  },
  getSubjectsByTeacherId: async (req: Request, res: Response) => {
    try {
      const teacherId = Number(req.params.teacherId);
      if (!teacherId) throw new Error("Teacher ID required");

      const subjects = await TeacherAuthService.getSubjectsByTeacherId(
        teacherId
      );
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teacher's subjects" });
    }
  },
  createExam: async (req: Request, res: Response) => {
    try {
      const exam = await TeacherAuthService.createExam({
        ...req.body,
        created_by_teacher_id: Number(req.params.teacherId),
      });
      res.status(201).json(exam);
    } catch (error) {
      res.status(500).json({ error: "Failed to create exam" });
    }
  },

  getExamsByTeacher: async (req: Request, res: Response) => {
    try {
      const exams = await TeacherAuthService.getExamsByTeacher(
        Number(req.params.teacherId)
      );
      res.json(exams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exams" });
    }
  },

  deleteExam: async (req: Request, res: Response) => {
    try {
      await TeacherAuthService.deleteExam(
        Number(req.params.examId),
        Number(req.params.teacherId)
      );
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete exam" });
    }
  },
  createQuestion: async (req: Request, res: Response) => {
    try {
      const question = await TeacherAuthService.createQuestion(
        Number(req.params.examId),
        req.body
      );
      res.status(201).json(question);
    } catch (error) {
      res.status(500).json({ error: "Failed to create question" });
    }
  },

  getQuestions: async (req: Request, res: Response) => {
    try {
      const questions = await TeacherAuthService.getQuestions(
        Number(req.params.examId)
      );
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  },

  deleteQuestion: async (req: Request, res: Response) => {
    try {
      await TeacherAuthService.deleteQuestion(
        Number(req.params.questionId),
        Number(req.params.examId)
      );
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete question" });
    }
  },

  getTeacherExams: async (req: Request, res: Response) => {
    try {
      const exams = await TeacherAuthService.getTeacherExams(
        Number(req.params.teacherId)
      );
      res.json(exams);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  getExamStudents: async (req: Request, res: Response) => {
    try {
      const students = await TeacherAuthService.getExamStudents(
        Number(req.params.examId)
      );
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  getStudentAttemptDetails: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const attemptId = parseInt(req.params.attemptId);
      if (isNaN(attemptId)) {
        res.status(400).json({ error: "Invalid attempt ID" });
        return;
      }

      const details = await TeacherAuthService.getStudentAttemptDetails(
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
  getTeacherDashboard: async (req: Request, res: Response) => {
    try {
      const teacherId = parseInt(req.params.teacher_id);
      const dashboardData = await TeacherAuthService.getTeacherDashboardData(
        teacherId
      );
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching teacher dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  },
};

export default TeacherAuthController;
