import AdminAuthService from "../../Services/AdminServices/AdminAuthService";
import { Request, Response } from "express";

interface AdminAuthControllerType {
  registerAdmin: (req: Request, res: Response) => Promise<void>;
  loginAdmin: (req: Request, res: Response) => Promise<void>;
}

const AdminAuthController: AdminAuthControllerType = {
  registerAdmin: async (req: Request, res: Response): Promise<void> => {
    try {
      await AdminAuthService.registerAdmin(req.body);
      res.status(201).json({ message: "Admin registered successfully" });
    } catch (error: any) {
      if (error.message === "Admin with this Email already exists") {
        res
          .status(400)
          .json({ message: "Admin with this email already exists" });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  },

  loginAdmin: async (req: Request, res: Response): Promise<void> => {
    try {
      const session = req.session as unknown as {
        adminToken: string;
        admin: { admin_id: number; name: string; email: string; role: string };
        save: () => any;
      };
      const admin = await AdminAuthService.loginAdmin({ session }, req.body);
      const { adminToken, admindata } = admin;
      res.status(200).json({
        message: "Admin logged in successfully",
        adminToken,
        admindata,
      });
    } catch (error: any) {
      let statusCode = 500;
      if (error.message === "Admin with this email does not exist") {
        statusCode = 403;
      } else if (error.message === "Invalid Password") {
        statusCode = 403;
      }
      res
        .status(statusCode)
        .json({ message: "Bad Request", error: error.message });
    }
  },
};

export default AdminAuthController;
