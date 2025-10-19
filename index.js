import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(bodyParser.json());

// ✅ Enable CORS for all routes *before* the API key check
app.use(cors({
  origin: "*", // allow all origins for now (you can restrict later)
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-api-key"]
}));

const DATA_FILE = "./data.json";

// ✅ Allow preflight requests (important for browsers)
app.options("*", cors());

// ✅ API key middleware (after CORS)
app.use((req, res, next) => {
  const key = req.headers["x-api-key"];
  if (!key || key !== process.env.API_KEY) {
    // Still send CORS headers even on error
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// ✅ GET /data
app.get("/data", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to read data file" });
  }
});

// ✅ POST /data
app.post("/data", (req, res) => {
  try {
    const newData = req.body;
    if (!newData || typeof newData !== "object") {
      return res.status(400).json({ error: "Invalid data" });
    }
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    const updatedData = { ...data, ...newData };
    fs.writeFileSync(DATA_FILE, JSON.stringify(updatedData, null, 2));
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({ success: true, data: updatedData });
  } catch (err) {
    res.status(500).json({ error: "Failed to update data" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
