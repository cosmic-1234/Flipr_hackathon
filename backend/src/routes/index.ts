import express from "express";
import multer from "multer";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
const router = express.Router();
import dotenv from "dotenv";
dotenv.config();
import UserRouter from "./user/index";
import MessageRouter from "./messages/index";
import prismaClient from "../db/db";
import authenticate from "../middleware/middleware";

//step 17 file upload
const upload = multer({ storage: multer.memoryStorage() });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileExt = req.file.originalname.split(".").pop();
  const key = `chat-uploads/${uuidv4()}.${fileExt}`;

  try {
    const result = await s3
      .upload({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: "public-read",
      })
      .promise();

    res.json({ url: result.Location });
  } catch (err) {
    res.status(500).json({ error: "Upload failed", details: err });
  }
});

router.use("/user", UserRouter);
router.use("/message", MessageRouter);

router.get("/chatroom/:roomId", authenticate, async (req, res) => {
  const roomId = req.params.roomId;
  try {
    const chats = await prismaClient.chat.findMany({
      where: { room_id: roomId },
    });
    return res.status(200).json(chats);
  } catch (e) {
    console.log(e);
    return res.status(511).json({
      message: "Couldnt get the chats",
    });
  }
});

export default router;
