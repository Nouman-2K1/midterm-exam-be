import Joi from "joi";
import { Request, Response, NextFunction } from "express";

interface RegisterTeacherData {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface LoginTeacherData {
  email: string;
  password: string;
  role: string;
}

const TeacherAuthValidator = {
  registerTeacher: (req: Request, res: Response, next: NextFunction): void => {
    const data: RegisterTeacherData = req.body;
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

  loginTeacher: (req: Request, res: Response, next: NextFunction): void => {
    const data: LoginTeacherData = req.body;
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

export default TeacherAuthValidator;
