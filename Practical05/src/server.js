const express = require("express");
const mustacheExpress = require("mustache-express");
const morgan = require("morgan");
require("dotenv").config();

const webRoutes = require("./routes/web");

const app = express();
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("src/public"));

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

app.use("/", webRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
