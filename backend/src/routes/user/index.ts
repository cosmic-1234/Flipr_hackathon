import  express  from "express";
const router = express.Router();
import prisma from "../../db/db";
router.post("/signup", async (req, res) => {
   const user = await prisma.user.create({
});
})
export default router;
