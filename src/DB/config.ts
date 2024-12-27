import { Dialect, Sequelize } from "sequelize";

const dbName: string = process.env.DBNAME!;
const dbUser: string = process.env.DBUSER!;
const dbPassword: string = process.env.DBPASSWORD!;
const dbHost: string = process.env.DBHOST!;
const dbPort: number = process.env.DBPORT
  ? parseInt(process.env.DBPORT, 10)
  : 5432;
const dbDialect: Dialect = (process.env.DIALECT as Dialect) || "postgres";

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: dbDialect,
  logging: false,
});

export const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection Established");
  } catch (error) {
    console.error("Unable to Connect", error);
  }
};

export default sequelize;
