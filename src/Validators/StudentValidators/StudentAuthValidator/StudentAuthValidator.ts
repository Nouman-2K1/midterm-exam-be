import Joi from "joi";
import { Request, Response, NextFunction } from "express";

interface RegisterStudentData {
  name: string;
  email: string;
  password: string;
  role: string;
  roll_number: string;
  department_id: number;
  semester: number;
  admission_year: number;
  current_year: number;
  active_status: boolean;
}

interface LoginStudentData {
  email: string;
  password: string;
  role: string;
}

const StudentAuthValidator = {
  // ✅ Registration Validation
  registerStudent: (req: Request, res: Response, next: NextFunction): void => {
    const data: RegisterStudentData = req.body;

    // Schema Definition
    const schema = Joi.object({
      name: Joi.string().max(100).required(),
      email: Joi.string().email({ minDomainSegments: 2 }).required(),
      password: Joi.string().min(6).max(100).required(),
      role: Joi.string().valid("student", "teacher", "admin").required(),
      roll_number: Joi.string()
        .pattern(/^[0-9]{2}-[a-zA-Z]{2}-[0-9]{2,}$/)
        .required()
        .messages({
          "string.pattern.base":
            "Roll number format should be like '20-cs-63'.",
        }),
      department_id: Joi.number().positive().integer().required(),
      semester: Joi.number().integer().min(1).max(8).required(),
      admission_year: Joi.number()
        .integer()
        .min(2000)
        .max(new Date().getFullYear())
        .required(),
      current_year: Joi.number()
        .integer()
        .min(2000)
        .max(new Date().getFullYear() + 1)
        .required(),
      active_status: Joi.boolean().required(),
    });

    // Validate the data
    const { error } = schema.validate(data);
    if (error) {
      res.status(400).json({ message: "Invalid input", error: error.details });
      return;
    }
    next();
  },

  // ✅ Login Validation
  loginStudent: (req: Request, res: Response, next: NextFunction): void => {
    const data: LoginStudentData = req.body;

    // Schema Definition
    const schema = Joi.object({
      email: Joi.string().email({ minDomainSegments: 2 }).required(),
      password: Joi.string().min(6).max(100).required(),
      role: Joi.string().valid("student", "teacher", "admin").required(),
    });

    // Validate the data
    const { error } = schema.validate(data);
    if (error) {
      res.status(400).json({ message: "Invalid input", error: error.details });
      return;
    }
    next();
  },
};

export default StudentAuthValidator;
