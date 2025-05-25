import express from "express";
const router = express.Router();
import prisma from "../../db/db";
import { USER_BODY, SIGNIN_BODY } from "../../zod";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import authenticate from "../../middleware/middleware";
import userAuth from "../../middleware/middleware";
dotenv.config();



//This Route is part of Step 2

//SIGNUP



router.post("/signup", async (req, res) => {
  console.log("inside signup");
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
        process.env.JWT_SECRET
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
        process.env.JWT_SECRET
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

router.get("/profile", userAuth, async(req, res) => {
    try {
          return void res.status(200).json((req as any).user);
      } catch (e) {
          console.log("ERR", e);
          return void res.status(511).json({
              message: "Could'nt get the data",
          });
      }
})
// Add this new endpoint for searching users
router.get("/search", userAuth, async (req, res) => {
  const searchQuery = req.query.q as string;
  console.log('Search query received:', searchQuery);
  console.log('Query type:', typeof searchQuery);

  if (!searchQuery || searchQuery.trim() === "") {
    console.log('Empty search query');
    return void res.status(400).json({ error: "Search query is required" });
  }

  try {
    console.log('Executing database query with:', searchQuery);
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: searchQuery,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        isOnline: true
      },
      take: 10
    });

    console.log('Database query result:', users);
    console.log('Number of users found:', users.length);

    const response = {
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        isOnline: user.isOnline
      }))
    };

    console.log('Sending response:', response);
    return void res.status(200).json(response);
  } catch (error) {
    console.error("Error searching users:", error);
    return void res.status(500).json({ error: "Failed to search users" });
  }
});

export default router;
