import express from "express";
const app = express();
const cors = require("cors");
import MainRouter from "./routes/index"

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3001", // your frontend URL
  credentials: true
}));

app.use("/api/v1", MainRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
