import { Request, Response } from "express";
import DepartmentService from "../../Services/DepartmentServices/DepartmentServices";

const DepartmentController = {
  createDepartment: async (req: Request, res: Response): Promise<void> => {
    try {
      const department = await DepartmentService.createDepartment(req.body);
      res
        .status(201)
        .json({ message: "Department created successfully", department });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },

  getDepartments: async (req: Request, res: Response): Promise<void> => {
    try {
      const departments = await DepartmentService.getDepartments();
      res.status(200).json(departments);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },

  deleteDepartments: async (req: Request, res: Response): Promise<void> => {
    try {
      const { department_id } = req.params; // Use department_id here
      const deletedDepartment = await DepartmentService.deleteDepartments({
        departmentId: Number(department_id),
      });
      if (deletedDepartment) {
        res.status(200).json({ message: "Department deleted successfully" });
      } else {
        res.status(404).json({ message: "Department not found" });
      }
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },
};

export default DepartmentController;
