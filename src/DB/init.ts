import AdminModel from "../Models/AdminModels/AdminModel";
import TeacherModel from "../Models/TeacherModels/TeacherModel";
import StudentModel from "../Models/StudentModels/StudentModel";
const dbInit = async () => {
  await AdminModel.sync({
    alter: true,
    force: false,
  });
  await TeacherModel.sync({
    alter: true,
    force: false,
  });
  await StudentModel.sync({
    alter: true,
    force: false,
  });
};

export default dbInit;
