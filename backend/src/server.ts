import express from "express";
import sequelize from "./config/database";
import User from "./models/User";
const app = express();
const PORT = 4000;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
    await sequelize.sync({ alter: true });
    console.log("Models synced.");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
}

start();
