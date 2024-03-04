import express from "express";
import db from "./config/Database.js";
import FileUpload from "express-fileupload";
import { sendEmailsForMatchingDateOut } from "./controllers/Email.js";
import session from "express-session";
import SequelizeStore from "connect-session-sequelize";
import UserRoute from "./routes/UserRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import cors from "cors";

// Routes
import BarangRoute from "./routes/BarangRoute.js";

const app = express();

const sessionStore = SequelizeStore(session.Store); //? menyimpan session user

const store = new sessionStore({
  db: db,
});

(async () => {
  await db.sync();
})();

app.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
      secure: "auto",
    },
  })
);

app.use(
  cors({
    credentials: true, //? akses untuk frontend
    origin: "http://localhost:3030", //? domain yang diijinka mengakses api
  })
);

sendEmailsForMatchingDateOut();

app.use(express.json());
app.use(FileUpload());
app.use(express.static("public"));

app.use(BarangRoute);
app.use(UserRoute);
app.use(AuthRoute);

app.get("/", (req, res) => {
  res.send("Gilang Silpiy");
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
