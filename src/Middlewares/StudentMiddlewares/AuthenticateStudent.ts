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
      return res.status(401).json({
        message: "Token not provided",
      });
    }
    token = token.replace("Bearer ", "");
    jwt.verify(token, process.env.JWTSECRET!);

    if (!req.session.student || !req.session.studentToken) {
      return res.status(401).json({
        message: "please Login",
      });
    }
    if (req.session.studentToken !== token) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }
    if (req.session.student.role !== "student") {
      return res.status(401).json({
        message: "Please Login from Student Account",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid request",
    });
  }
};

export default AuthenticateStudent;
