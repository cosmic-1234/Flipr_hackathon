import { WebSocketServer, WebSocket } from "ws";
import prismaClient from "../db/db";
interface User {
    socket: WebSocket;
    room: string;
}
//{ type : join,
// userId : "asdfas"
// payload : {
//  roomId : "13214"
//}
//type : chat,
//userId : "sfag"
// payload : {
// message : "faf", }
//}
// This is a part of Step 9
interface SocketMap {
     [key: string]: User;
}


let allSockets: SocketMap = {};

export function InitWebsocket(){
    const wss = new WebSocketServer({port : 8080})
    wss.on("connection", (soc) => {
        console.log("user connected");
    
        soc.on("message", async (message) =>{
                    // @ts-ignore
            
            const parsedMessage = JSON.parse(message);
            const fileUrl = parsedMessage.fileUrl;
            const username = parsedMessage.username
            if(parsedMessage.type === "join"){
                console.log("User with Id " + username + " joined");

                allSockets[username] = {
                    socket: soc, 
                    room: parsedMessage.payload.roomId
                }
            }
    
            if(parsedMessage.type === "chat"){
                console.log("user with " + username + " messaged" )
                const currRoom = allSockets[username].room;
                const message = await prismaClient.message.create({
                    data : {
                        
                        chatId : currRoom, 
                        username : username,
                        content : parsedMessage.payload.message,
                        fileUrl : fileUrl
                    }
                })

                // Create a proper message object
                const messageToSend = {
                    type: "chat",
                    chatId : currRoom, 
                    username : username,
                    content : parsedMessage.payload.message,
                    fileUrl : fileUrl,
                    createdAt: new Date()
                };

                Object.entries(allSockets).forEach(([key, val]) => {
                    if(currRoom === val.room && key !== username ){
                        val.socket.send(JSON.stringify(messageToSend)) // Send stringified JSON object
                        try {
                            const readMessages = async() =>{
                                await prismaClient.messageRead.create({
                                data: {
                                messageId : message.id,
                                username : username,
                                },
                            });
                        }
                        readMessages(); 
                        } catch (err) {
                            console.error("Error marking message as read:", err);
                        }
                    }
                })
            }

            // Handle read event
            if (parsedMessage.type === "read") {
                const { messageId, roomId } = parsedMessage;
                Object.entries(allSockets).forEach(([key, val]) => {
                    if (val.room === roomId) {
                        val.socket.send(JSON.stringify({
                            type: "read",
                            messageId,
                            username, // who read it
                        }));
                    }
                });
            }
        })
        soc.on("close", () => {
          console.log("Websocket closed now")
            const username = Object.entries(allSockets)
                .find(([_, user]) => user.socket === soc)?.[0];
            if (username) delete allSockets[username];
        })
    })
    
}