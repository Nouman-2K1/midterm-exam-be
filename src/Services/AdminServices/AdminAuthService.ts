import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import AdminModel from "../../Models/AdminModels/AdminModel";

const AdminAuthService = {
  registerAdmin: async (adminData: {
    name: any;
    email: any;
    password: any;
    role: any;
  }) => {
    const { name, email, password, role } = adminData;
    const adminExist = await AdminModel.findOne({ where: { email, role } });

    if (adminExist) {
      throw new Error("admin with this Email already exists");
    }

    const hashedPassword = await hash(password, 10);

    const newAdmin = await AdminModel.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return newAdmin;
  },
  // at login time we don't need role
  loginAdmin: async (
    req: {
      session: {
        adminToken: string;
        admin: { id: number; name: string; email: string; role: string };
        save: () => any;
      };
    },
    adminData: { email: any; password: any }
  ) => {
    const { email, password } = adminData;

    const admin = await AdminModel.findOne({ where: { email } });
    if (!admin) {
      throw new Error(`admin with this email do not exist`);
    }
    const comparedPassword = await compare(password, admin.password);
    if (!comparedPassword) {
      throw new Error(`Invalid Password`);
    }
    const admindata = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
    const adminToken = jwt.sign(admindata, process.env.JWTSECRET!, {
      expiresIn: "14d",
    });
    req.session.adminToken = adminToken;
    req.session.admin = admindata;
    console.log(req.session);
    await req.session.save();
    return {
      adminToken,
      admindata,
    };
  },
};

export default AdminAuthService;
