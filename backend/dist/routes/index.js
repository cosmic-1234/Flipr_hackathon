"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const uuid_1 = require("uuid");
const router = express_1.default.Router();
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const index_1 = __importDefault(require("./user/index"));
const index_2 = __importDefault(require("./messages/index"));
const db_1 = __importDefault(require("../db/db"));
const middleware_1 = __importDefault(require("../middleware/middleware"));
//step 17 file upload
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
router.post("/upload", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    const fileExt = req.file.originalname.split(".").pop();
    const key = `chat-uploads/${(0, uuid_1.v4)()}.${fileExt}`;
    try {
        const result = yield s3
            .upload({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ACL: "public-read",
        })
            .promise();
        res.json({ url: result.Location });
    }
    catch (err) {
        res.status(500).json({ error: "Upload failed", details: err });
    }
}));
router.use("/user", index_1.default);
router.use("/message", index_2.default);
router.get("/chatroom/:roomId", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomId = req.params.roomId;
    try {
        const chats = yield db_1.default.chat.findMany({
            where: { room_id: roomId },
        });
        return res.status(200).json(chats);
    }
    catch (e) {
        console.log(e);
        return res.status(511).json({
            message: "Couldnt get the chats",
        });
    }
}));
exports.default = router;
