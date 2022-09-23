require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const route = require("./src/routers/index");
const connectDB = require("./src/config/configDb");

const PORT = process.env.PORT || 5050;

app.use(bodyParser.json({ limit: 10000 }));
app.use(bodyParser.urlencoded({ extended: true, limit: 10000 }));
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.static("public"));
connectDB();
route(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
