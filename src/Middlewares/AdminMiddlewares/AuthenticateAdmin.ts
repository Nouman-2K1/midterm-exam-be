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

const AuthenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    // Verify the JWT token
    jwt.verify(token, process.env.JWTSECRET!, (err, decoded) => {
      if (err) {
        res.status(401).json({
          message: "Invalid token",
        });
        return;
      }

      // Check if session values exist and match
      if (
        !req.session.admin ||
        !req.session.adminToken ||
        req.session.adminToken !== token
      ) {
        res.status(401).json({
          message: "Invalid session or token",
        });
        return;
      }

      // Ensure the admin role is correct
      if (req.session.admin.role !== "admin") {
        res.status(401).json({
          message: "Please Login from Admin Account",
        });
        return;
      }

      // Token is valid, proceed to the next middleware
      next();
    });
  } catch (error) {
    console.error("Error in AuthenticateAdmin:", error);
    res.status(401).json({
      message: "Invalid request",
    });
  }
};

export default AuthenticateAdmin;
