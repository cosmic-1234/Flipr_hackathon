import express from "express";
const router = express.Router();
import prisma from "../../db/db";
import { USER_BODY, SIGNIN_BODY } from "../../zod";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();



//This Route is part of Step 2

//SIGNUP



router.post("/signup", async (req, res) => {
  const success = USER_BODY.safeParse(req.body);
  if (success.success) {
    try {
      const user = await prisma.user.create({
        data: {
          email: req.body.email,
          username: req.body.username,
          password: req.body.password,
        },
      });
      const token = jwt.sign(
        {
          userId: user.id,
        },
        //@ts-ignore
        process.env.USER_JWT_SECRET
      );

      return void res.status(200).json({
        token: token,
      });
    } catch (error) {
      return void res.status(500).json({ error: "Internal Server Error" });
    }
  }
});




//This Route is also part of Step 2
//SIGNIN

router.post("/signin", async (req, res) => {
  const parsedSignin = SIGNIN_BODY.safeParse(req.body);
  if (!parsedSignin.success) {
    return void res.status(400).json({
      error: "Inputs format not correct should be handled in frontend itself",
    });
  }
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: parsedSignin.data.email,
      },
    });
    if (!user) {
      return void res.status(400).json({
        error: "You are not signedup yet",
      });
    }
    if (user.password === parsedSignin.data.password) {
      const token = jwt.sign(
        {
          userId: user.id,
        },
        //@ts-ignore
        process.env.USER_JWT_SECRET
      );
      return void res.status(200).json({
        token: token,
      });
    }
  } catch (error) {
    return void res.status(500).json({
      error: error,
    });
  }
});
router.get("/logout", async(req, res)=>{
    res.clearCookie('token', { httpOnly: true, secure: false, path: '/' });
    res.clearCookie('role', { httpOnly: true, secure: false, path: '/' });
  
    res.status(200).json({ message: 'Logged out successfully' });
})
export default router;
