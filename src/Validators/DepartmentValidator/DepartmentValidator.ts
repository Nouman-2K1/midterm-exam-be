import Joi from "joi";
import { Request, Response, NextFunction } from "express";

interface DepartmentData {
  name: string;
}

const DepartmentValidator = {
  createDepartment: (req: Request, res: Response, next: NextFunction): void => {
    const data: DepartmentData = req.body;
    const schema = Joi.object({
      name: Joi.string().max(100).required(),
    });

    const { error } = schema.validate(data);
    if (error) {
      res.status(400).json({ message: "Invalid input", error: error.details });
      return;
    }
    next();
  },

  // Validator for deleting a department
  deleteDepartment: (req: Request, res: Response, next: NextFunction): void => {
    const { department_id } = req.params;
    const schema = Joi.object({
      department_id: Joi.number().required(), // Ensure it's a number
    });

    const { error } = schema.validate({ department_id: Number(department_id) });
    if (error) {
      res
        .status(400)
        .json({ message: "Invalid department ID", error: error.details });
      return;
    }
    next();
  },
};

export default DepartmentValidator;
