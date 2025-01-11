import Joi from "joi";
import { Request, Response, NextFunction } from "express";

interface RegisterTeacherData {
  name: string;
  email: string;
  password: string;
  role: string;
  department_id: number;
}

interface LoginTeacherData {
  email: string;
  password: string;
  role: string;
}

const TeacherAuthValidator = {
  // ✅ Register Teacher Validation
  registerTeacher: (req: Request, res: Response, next: NextFunction): void => {
    const data: RegisterTeacherData = req.body;
    const schema = Joi.object({
      name: Joi.string().max(100).required().messages({
        "string.max": "Name must be at most 100 characters",
        "any.required": "Name is required",
      }),
      email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
        "string.email": "Invalid email format",
        "any.required": "Email is required",
      }),
      password: Joi.string().min(8).max(100).required().messages({
        "string.min": "Password must be at least 8 characters",
        "any.required": "Password is required",
      }),
      role: Joi.string().valid("teacher").required().messages({
        "any.required": "Role is required",
      }),
      department_id: Joi.number().positive().required().messages({
        "number.base": "Department ID must be a number",
        "number.positive": "Department ID must be a positive number",
        "any.required": "Department ID is required",
      }),
    });

    const { error } = schema.validate(data);
    if (error) {
      res.status(400).json({ message: "Invalid input", error: error.details });
      return;
    }
    next();
  },

  // ✅ Login Teacher Validation
  loginTeacher: (req: Request, res: Response, next: NextFunction): void => {
    const data: LoginTeacherData = req.body;
    const schema = Joi.object({
      email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
        "string.email": "Invalid email format",
        "any.required": "Email is required",
      }),
      password: Joi.string().min(8).max(100).required().messages({
        "string.min": "Password must be at least 8 characters",
        "any.required": "Password is required",
      }),
      role: Joi.string().valid("teacher").required().messages({
        "any.required": "Role is required",
      }),
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
