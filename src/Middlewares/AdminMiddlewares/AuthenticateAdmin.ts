import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { Session, SessionData } from "express-session";

interface AdminSession extends Session, Partial<SessionData> {
  admin?: { role: string };
  adminToken?: string;
  cookie: any;
}

interface AuthenticatedRequest extends Request {
  session: AdminSession;
}

const AuthenticateAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        message: "Token not provided",
      });
    }
    token = token.replace("Bearer ", "");
    jwt.verify(token, process.env.JWTSECRET!);

    if (!req.session.admin || !req.session.adminToken) {
      return res.status(401).json({
        message: "Invalid request",
      });
    }
    if (req.session.adminToken !== token) {
      return res.status(401).json({
        message: "Invalid request",
      });
    }
    if (req.session.admin.role !== "admin") {
      return res.status(401).json({
        message: "Please Login from Admin Account",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid request",
    });
  }
};

export default AuthenticateAdmin;
