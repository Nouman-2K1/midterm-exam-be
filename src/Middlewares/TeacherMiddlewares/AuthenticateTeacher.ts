import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { Session, SessionData } from "express-session";

interface TeacherSession extends Session, Partial<SessionData> {
  teacher?: { role: string };
  teacherToken?: string;
  cookie: any;
}

interface AuthenticatedRequest extends Request {
  session: TeacherSession;
}

const AuthenticateTeacher = (
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
    jwt.verify(token, process.env.JWTSECRET!);

    if (!req.session.teacher || !req.session.teacherToken) {
      res.status(401).json({
        message: "please Login",
      });
      return;
    }
    if (req.session.teacherToken !== token) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }
    if (req.session.teacher.role !== "teacher") {
      res.status(401).json({
        message: "Please Login from Teacher Account",
      });
      return;
    }
    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid request",
    });
  }
};

export default AuthenticateTeacher;
