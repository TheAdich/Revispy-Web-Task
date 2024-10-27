const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient
const createMsg = async (req, res) => {
    const { chatId, content, type } = req.body;
    console.log(type);
    try {
        const msg = await prisma.message.create({
            data: {
                content: content,
                senderId: req.user.id,
                chatId: chatId,
                type: type
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        username: true
                    }
                }
            }
        })
        return res.status(200).json(msg);
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: "Message not sent" });
    }
}

const shareMsg = async (req, res) => {
    const { msg, sharedUsers } = req.body;
    try {
        const chatPromise = sharedUsers.map((user)=>{
            return  prisma.chats.findFirst({
                where:{
                    AND:[
                        {
                            users:{
                                some:{
                                    id:req.user.id
                                }
                            }
                        },
                        {
                            users:{
                                some:{
                                    id:user.id
                                }
                            }
                        }
                    ]
                }
            })
        })

        


        const chats=await prisma.$transaction(chatPromise);

        const messages=await prisma.message.createMany({
            data:chats.map((chat)=>{
                return{
                    content:msg.content,
                    senderId:req.user.id,
                    chatId:chat.id,
                    type:msg.type
                }
            })
        })

        return res.status(200).json(messages);
    } catch (err) {
        console.log(err);
        return res.status(400).json({error:"Error in sharing the message"});
    }
}


module.exports = { createMsg ,shareMsg}