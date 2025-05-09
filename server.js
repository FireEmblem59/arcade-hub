const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

app.use((req, res, next) => {
  if (req.path.endsWith(".html")) {
    res.setHeader("Cache-Control", "no-store"); // Simplest for ensuring freshness
    console.log(`Serving ${req.path} with Cache-Control: no-store`);
  }
  next();
});

app.use(express.static(path.join(__dirname, "")));

app.listen(port, () => {
  console.log(`Arcade Hub server listening at http://localhost:${port}`);
  console.log(`Serving files from: ${__dirname}`);
});
