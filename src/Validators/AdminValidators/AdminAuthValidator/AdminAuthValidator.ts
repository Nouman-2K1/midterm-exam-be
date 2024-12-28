import Joi from "joi";
import { Request, Response, NextFunction } from "express";

interface RegisterAdminData {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface LoginAdminData {
  email: string;
  password: string;
  role: string;
}

const AdminAuthValidator = {
  registerAdmin: (req: Request, res: Response, next: NextFunction): void => {
    const data: RegisterAdminData = req.body;
    const schema = Joi.object({
      name: Joi.string().max(20).required(),
      email: Joi.string().email({ minDomainSegments: 2 }).required(),
      password: Joi.string().min(6).max(100).required(),
      role: Joi.string().min(6).max(100).required(),
    });

    const { error } = schema.validate(data);
    if (error) {
      res.status(400).json({ message: "Invalid input", error: error.details });
      return;
    }
    next();
  },

  loginAdmin: (req: Request, res: Response, next: NextFunction): void => {
    const data: LoginAdminData = req.body;
    const schema = Joi.object({
      email: Joi.string().email({ minDomainSegments: 2 }).required(),
      password: Joi.string().min(6).max(100).required(),
      role: Joi.string().max(100).required(),
    });

    const { error } = schema.validate(data);
    if (error) {
      res.status(400).json({ message: "Invalid input", error: error.details });
      return;
    }
    next();
  },
};

export default AdminAuthValidator;
