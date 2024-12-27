import "dotenv/config";
import express from "express";
import sequelize, { connectDb } from "./DB/config";
import dbInit from "./DB/init";
import Session from "express-session";
import SequelizeStore from "connect-session-sequelize";
import cors from "cors";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3301;

connectDb();
dbInit()
  .then(() => console.log("DB Synced"))
  .catch(() => console.log("DB not sycned"));

const mySequalizeStore = SequelizeStore(Session.Store);
const mySequalizeStore1 = new mySequalizeStore({
  db: sequelize,
});

app.use(
  Session({
    secret: process.env.SESSIONSECRET!,
    store: mySequalizeStore1,
    saveUninitialized: true,
    resave: false,
    proxy: false,
  })
);
mySequalizeStore1.sync({});

const corsInstance = cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ],
  credentials: true,
});
app.use(corsInstance);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
