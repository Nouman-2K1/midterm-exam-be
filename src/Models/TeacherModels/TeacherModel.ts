import { DataTypes, Model } from "sequelize";
import sequelize from "../../DB/config";

interface TeacherAttributes extends Model {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

const TeacherModel = sequelize.define<TeacherAttributes>("teacher", {
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

export default TeacherModel;
