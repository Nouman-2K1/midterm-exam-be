import AdminAuthService from "../../Services/AdminServices/AdminAuthService";
import { Request, Response } from "express";
interface AdminAuthControllerType {
  registerAdmin: (req: Request, res: Response) => Promise<Response>;
  loginAdmin: (req: Request, res: Response) => Promise<Response>;
}

const AdminAuthController: AdminAuthControllerType = {
  registerAdmin: async (req: Request, res: Response): Promise<Response> => {
    try {
      const admin = await AdminAuthService.registerAdmin(req.body);
      return res.status(201).json({ message: "Admin registered successfully" });
    } catch (error: any) {
      if (error.message === "Admin with this Email already exists") {
        return res
          .status(400)
          .json({ message: "Admin with this email already exists" });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  loginAdmin: async (req: Request, res: Response): Promise<Response> => {
    try {
      const session = req.session as unknown as {
        adminToken: string;
        admin: { id: number; name: string; email: string; role: string };
        save: () => any;
      };
      const admin = await AdminAuthService.loginAdmin({ session }, req.body);
      const { adminToken, admindata } = admin;
      return res.status(200).json({
        message: "Admin Loged in Sussceefully",
        adminToken,
        admindata,
      });
    } catch (error: any) {
      let statusCode = 500;
      if (error.message == "Admin with this email do not exist") {
        statusCode = 403;
      } else if (error.message == "Invalid Password") {
        statusCode = 403;
      }
      return res
        .status(statusCode)
        .json({ message: "Bad Requset", error: error.message });
    }
  },
};

export default AdminAuthController;
