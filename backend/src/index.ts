import  express  from "express";
const app = express();
const cors = require("cors");
import MainRouter from "./routes/index"

app.use(express.json());
app.use(cors());

app.use("/api/v1", MainRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
