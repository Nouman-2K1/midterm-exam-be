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
      return res.status(401).json({
        message: "Token not provided",
      });
    }
    token = token.replace("Bearer ", "");
    jwt.verify(token, process.env.JWTSECRET!);

    if (!req.session.teacher || !req.session.teacherToken) {
      return res.status(401).json({
        message: "please Login",
      });
    }
    if (req.session.teacherToken !== token) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }
    if (req.session.teacher.role !== "teacher") {
      return res.status(401).json({
        message: "Please Login from Teacher Account",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid request",
    });
  }
};

export default AuthenticateTeacher;
