import prisma from "../db/db";
import { Request, Response, NextFunction, json } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";





// This Middleware is a part of Step 1
interface User {
      id:       string,
      username: string,
      email:    string,
      password: string
}


interface UserRequest extends Request {
    user?: User;
}

dotenv.config();
const userAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    
    const token = req.headers.authorization;
    if (!token) {
        return void res.status(400).json({
            error: "jwt not present",
        });
    }
    try {
        const decoded = jwt.verify(
            token, //@ts-ignore
            process.env.JWT_SECRET
        );
        const user: User | null = await prisma.user.findFirst({
            where: {
                id: decoded.userId,
            },
        });
        if (!user) {
            return void res.status(400).json({
                error:
                    "This is a authenticated endpoint and you are not authorized to view this w/o signin/signup",
            });
        }
        (req as UserRequest).user = user;
        next();
    } catch (error) {
        return void res.status(400).json({
            message: "Json webtoken invalid",
        });
    }
};
export default userAuth