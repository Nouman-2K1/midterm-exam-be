import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Session, SessionData } from "express-session";

interface StudentSession extends Session, Partial<SessionData> {
  student?: { role: string };
  studentToken?: string;
  cookie: any;
}

interface AuthenticatedRequest extends Request {
  session: StudentSession;
}

const AuthenticateStudent = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      res.status(401).json({
        message: "Token not provided",
      });
      return;
    }
    token = token.replace("Bearer ", "");
    jwt.verify(token, process.env.JWTSECRET!, (err, decoded) => {
      if (err) {
        throw new Error("Token verification failed");
      } else {
        console.log("Token verified successfully", decoded);
      }
    });

    if (!req.session.student || !req.session.studentToken) {
      res.status(401).json({
        message: "Please log in",
      });
      return;
    }
    if (req.session.studentToken !== token) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }
    if (req.session.student.role !== "student") {
      res.status(401).json({
        message: "Please login with a student account",
      });
      return;
    }
    next();
  } catch (error) {
    console.error("Error verifying token", error);
    res.status(401).json({
      message: "Invalid request",
    });
  }
};

export default AuthenticateStudent;
