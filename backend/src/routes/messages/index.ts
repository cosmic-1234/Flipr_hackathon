import express from "express";
import prisma from "../../db/db";
import dotenv from "dotenv";
import authenticate from "../../middleware/middleware";

dotenv.config();
const router = express.Router();

// This is a Message Read Receipt Route This is a part of step 8.
router.post("/:messageId/read", authenticate, async (req, res) => {
  const { messageId } = req.params;
  const username = (req as any).user.username;

  try {
    const existing = await prisma.messageRead.findUnique({
      where: {
        messageId_username: {
          messageId,
          username,
        },
      },
    });

    if (!existing) {
      await prisma.messageRead.create({
        data: {
          messageId,
          username,
        },
      });
    }

    return void res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error marking message as read:", err);
    return void res.status(500).json({ error: "Failed to mark as read" });
  }
});


//This Endpoint is for serching the messages 


//This is a part of Step 20
router.get("/search", authenticate, async (req, res) => {
  const keyword = req.query.q as string;

  if (!keyword || keyword.trim() === "") {
    res.status(400).json({ error: "Query parameter 'q' is required." });
    return;
  }

  try {
    const messages = await prisma.message.findMany({
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
            username: true,
            readAt: true,
          },
        },
      },
    });

    res.status(200).json({ results: messages });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Failed to search messages" });
  }
});
export default router;
