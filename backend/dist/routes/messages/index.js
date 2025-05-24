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
const dotenv_1 = __importDefault(require("dotenv"));
const middleware_1 = __importDefault(require("../../middleware/middleware"));
dotenv_1.default.config();
const router = express_1.default.Router();
// This is a Message Read Receipt Route This is a part of step 8.
router.post("/:messageId/read", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { messageId } = req.params;
    const userId = req.user.userId;
    try {
        const existing = yield db_1.default.messageRead.findUnique({
            where: {
                messageId_userId: {
                    messageId,
                    userId,
                },
            },
        });
        if (!existing) {
            yield db_1.default.messageRead.create({
                data: {
                    messageId,
                    userId,
                },
            });
        }
        return void res.status(200).json({ success: true });
    }
    catch (err) {
        console.error("Error marking message as read:", err);
        return void res.status(500).json({ error: "Failed to mark as read" });
    }
}));
//This Endpoint is for serching the messages 
//This is a part of Step 20
router.get("/messages/search", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const keyword = req.query.q;
    if (!keyword || keyword.trim() === "") {
        res.status(400).json({ error: "Query parameter 'q' is required." });
        return;
    }
    try {
        const messages = yield db_1.default.message.findMany({
            where: {
                content: {
                    contains: keyword,
                    mode: "insensitive",
                },
            },
            orderBy: { createdAt: "desc" },
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
                        userId: true,
                        readAt: true,
                    },
                },
            },
        });
        res.status(200).json({ results: messages });
    }
    catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Failed to search messages" });
    }
}));
exports.default = router;
