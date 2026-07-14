
import express from "express";
import cors from "cors";
import proposalsRouter from "./routes/proposals.js";
import pagesRouter from "./routes/pages.js";

const app = express();
const PORT = Number(process.env.PORT || 10000);

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    ok: true,
    name: "EPM Proposal System",
    version: "1.0.0",
    endpoints: [
      "/api/health",
      "/api/proposals/health",
      "/api/proposals",
      "/proposals-admin"
    ]
  });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, version: "1.0.0", proposalsReady: true });
});

app.use("/api/proposals", proposalsRouter);
app.use("/", pagesRouter);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Unexpected server error." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`EPM Proposal System V1 running on port ${PORT}`);
});
