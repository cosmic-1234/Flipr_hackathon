"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import multer from "multer";
const aws_sdk_1 = __importDefault(require("aws-sdk"));
// import { v4 as uuidv4 } from "uuid";
const router = express_1.default.Router();
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const index_1 = __importDefault(require("./user/index"));
const index_2 = __importDefault(require("./messages/index"));
const index_3 = __importDefault(require("./chats/index"));
//step 17 file upload
// const upload = multer({ storage: multer.memoryStorage() });
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
// router.post("/upload", upload.single("file"), async (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No file uploaded" });
//   const fileExt = req.file.originalname.split(".").pop();
//   const key = `chat-uploads/${uuidv4()}.${fileExt}`;
//   try {
//     const result = await s3
//       .upload({
//         Bucket: process.env.AWS_S3_BUCKET!,
//         Key: key,
//         Body: req.file.buffer,
//         ContentType: req.file.mimetype,
//         ACL: "public-read",
//       })
//       .promise();
//     res.json({ url: result.Location });
//   } catch (err) {
//     res.status(500).json({ error: "Upload failed", details: err });
//   }
// });
router.use("/user", index_1.default);
router.use("/message", index_2.default);
router.use("/chats", index_3.default);
// router.get("/chatroom/:roomId", authenticate, async (req, res) => {
//   const roomId = req.params.roomId;
//   try {
//     const chats = await prismaClient.chat.findMany({
//       where: { room_id: roomId },
//     });
//     return res.status(200).json(chats);
//   } catch (e) {
//     console.log(e);
//     return res.status(511).json({
//       message: "Couldnt get the chats",
//     });
//   }
// });
exports.default = router;
