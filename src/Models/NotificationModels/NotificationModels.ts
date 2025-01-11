import { DataTypes } from "sequelize";
import sequelize from "../../DB/config";
import { Model } from "sequelize";

interface NotificationAttributes extends Model {
  notification_id: number;
  recipient_type: string;
  recipient_id: number;
  message: string;
  created_at?: Date;
  status?: string;
}

const NotificationModel = sequelize.define<NotificationAttributes>(
  "Notification",
  {
    notification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    recipient_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "unread",
    },
  }
);

export default NotificationModel;
