import DepartmentModel from "../../Models/DepartmentModels/DepartmentModels";

const DepartmentService = {
  createDepartment: async (departmentData: { name: string }) => {
    const { name } = departmentData;
    const newDepartment = await DepartmentModel.create({ name });
    return newDepartment;
  },

  getDepartments: async () => {
    const departments = await DepartmentModel.findAll();
    return departments;
  },

  deleteDepartments: async ({ departmentId }: { departmentId: number }) => {
    const deletedCount = await DepartmentModel.destroy({
      where: { department_id: departmentId },
    });

    return deletedCount > 0;
  },
};

export default DepartmentService;
