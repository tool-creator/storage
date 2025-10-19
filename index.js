import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(bodyParser.json());

// Enable CORS for all origins
app.use(cors());

const DATA_FILE = "./data.json";

// API key middleware
app.use((req, res, next) => {
  const key = req.headers["x-api-key"];
  if (!key || key !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// GET /data - view storage
app.get("/data", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  res.json(data);
});

// POST /data - add/update storage
app.post("/data", (req, res) => {
  const newData = req.body;
  if (!newData || typeof newData !== "object") {
    return res.status(400).json({ error: "Invalid data" });
  }
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  const updatedData = { ...data, ...newData };
  fs.writeFileSync(DATA_FILE, JSON.stringify(updatedData, null, 2));
  res.json({ success: true, data: updatedData });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
