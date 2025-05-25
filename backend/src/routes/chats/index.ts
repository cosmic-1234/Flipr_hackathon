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

router.post("/createchat", async (req,res)=>{
  debugger;
  const usernames : string[] = req.body.usernames
  const singleUsername: string = req.body.username;
  
  if (singleUsername) { // Ensure the single username exists
    usernames.push(singleUsername);
  }

  console.log(usernames)
    try {
      const chat = await prisma.chat.create({
        data:{
          isGroup: req.body.isGroup,
          chatname: req.body.chatname
        }
      })
      if (chat){
        const participantsData = usernames.map((username) => ({
          chatId: chat.id,
          chatname: chat.chatname,
          username
        }));
        try {
          if (participantsData.length !== 0) {
            await prisma.participant.createMany({
              data: participantsData,
              skipDuplicates: true,
            });
            return void res.status(200).json({
              message: "Chat created successfully",
              chatname: chat.chatname,
              users: req.body.usernames
            })
          }
          
        } catch (error) {
          return void res.status(500).json({
            error:error
          })
        }
        
      
      }
    } catch (error) {
      
    }
})
router.get("/getchats", async(req, res)=>{
  try {
    debugger;
    const username = req.query.username as string;
    if (!username) {
      return void res.status(400).json({ error: "Username is required" });
    }

    const chats = await prisma.participant.findMany({
      where:{
        username: username
      }
    })
    if(chats){
      return void res.status(200).json({
        chats: chats
      })
    }
  } catch (error) {
    return void res.status(500).json({
      error:error
    })
  }
})
export default router;