const express = require("express");
const mustacheExpress = require("mustache-express");
const morgan = require("morgan");
require("dotenv").config();

const apiRoutes = require("./routes/api");
const viewRoutes = require("./routes/views");

const app = express();

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true })); // for HTML forms
app.use(express.json()); // for JSON API
app.use(express.static("src/public"));

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

// Mustache pages
app.use("/", viewRoutes);

// JSON API
app.use("/api", apiRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3006;
if (require.main === module) {
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}

module.exports = app;

