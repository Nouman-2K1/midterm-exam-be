import { DataTypes, Model } from "sequelize";
import sequelize from "../../DB/config";

interface StudentAttributes extends Model {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

const StudentModel = sequelize.define<StudentAttributes>("student", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default StudentModel;
