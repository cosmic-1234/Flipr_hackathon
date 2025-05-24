import express from "express";
import prisma from "../../db/db";
import authenticate from "../../middleware/middleware"
const router = express.Router();
router.get("/chats/:chatId/messages", authenticate, async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await prisma.message.findMany({
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
  } catch (error) {
    console.error("Error fetching messages:", error);
    return void res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.post("/createchat", authenticate, async (req,res)=>{
  const usernames : string[] = req.body.usernames
    try {
      const chat = await prisma.chat.create({
        data:{
          isGroup: req.body.isGroup
        }
      })
      if (chat){
        const participantsData = usernames.map((username) => ({
          chatId: chat.id,
          username
        }));
        if (participantsData.length !== 0) {
          await prisma.participant.createMany({
            data: participantsData,
            skipDuplicates: true,
          });
        }
      }
    } catch (error) {
      
    }
})

export default router;