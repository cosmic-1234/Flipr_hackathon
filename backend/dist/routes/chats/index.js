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
const db_1 = __importDefault(require("../../db/db"));
const middleware_1 = __importDefault(require("../../middleware/middleware"));
const router = express_1.default.Router();
router.get("/chats/:chatId/messages", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId } = req.params;
    try {
        const messages = yield db_1.default.message.findMany({
            where: { chatId },
            orderBy: { createdAt: "asc" },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
                reactions: {
                    select: {
                        userId: true,
                        emoji: true,
                    },
                },
                messageReads: {
                    select: {
                        username: true,
                        readAt: true,
                    },
                },
            },
        });
        return void res.status(200).json({ messages });
    }
    catch (error) {
        console.error("Error fetching messages:", error);
        return void res.status(500).json({ error: "Failed to fetch messages" });
    }
}));
router.post("/createchat", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const usernames = req.body.usernames;
    try {
        const chat = yield db_1.default.chat.create({
            data: {
                isGroup: req.body.isGroup
            }
        });
        if (chat) {
            const participantsData = usernames.map((username) => ({
                chatId: chat.id,
                username
            }));
            if (participantsData.length !== 0) {
                yield db_1.default.participant.createMany({
                    data: participantsData,
                    skipDuplicates: true,
                });
            }
        }
    }
    catch (error) {
    }
}));
exports.default = router;
