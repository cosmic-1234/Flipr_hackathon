import  express  from "express";
const router = express.Router();
import UserRouter from "./user/index";
router.use("/user", UserRouter);

export default router;
