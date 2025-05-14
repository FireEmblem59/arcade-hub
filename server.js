const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

const os = require("os");
const ip = Object.values(os.networkInterfaces())
  .flat()
  .find((i) => i.family === "IPv4" && !i.internal)?.address;

app.use(express.static(path.join(__dirname, "")));

app.listen(port, () => {
  console.log(`Arcade Hub server available at:
  → Local:   http://localhost:${port}
  → Network: http://${ip}:${port}`);
  console.log(`Serving files from: ${__dirname}`);
});
