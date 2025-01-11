import "dotenv/config";
import express from "express";
import sequelize, { connectDb } from "./DB/config";
import dbInit from "./DB/init";
import Session from "express-session";
import SequelizeStore from "connect-session-sequelize";
import cors from "cors";
import AllRouter from "./Routers/AllRouter";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3301;

connectDb();
dbInit()
  .then(() => console.log("DB Synced"))
  .catch((error) => {
    console.error("Error syncing DB:", error);
  });

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
    proxy: true, // ✅ Set to true when behind a proxy (like during development)
    cookie: {
      httpOnly: true,
      secure: false, // ✅ Set to true in production with HTTPS
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    },
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
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
app.use(corsInstance);

app.get("/session-check", (req, res) => {
  console.log("Session Data:", req.session);
  res.json(req.session);
});

app.use("/", AllRouter);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
