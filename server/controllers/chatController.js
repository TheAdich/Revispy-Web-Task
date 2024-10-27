const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();

const fetchChat = async (req, res) => {
    try {
        const allchats = await prisma.chats.findMany({
            where: {
                users: {
                    some: {
                        id: req.user.id
                    }
                },
            },
            include: {
                users: true
            },
            orderBy:{
                updatedAt:'desc'
            }
        })

        const formattedChats = allchats.map(chat => {
            let chatName = "Anonymous Chat";

            const otherUser = chat.users.find((user) => user.id !== req.user.id);
            //console.log(otherUser);
            if (otherUser) {
                chatName = otherUser.username;
            }
            return {
                ...chat,
                chatName
            }
        })
        //console.log(formattedChats);
        return res.status(200).json(formattedChats);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Error fetching chat' });
    }

}

const createChat = async (req, res) => {
    const { userId } = req.body;
    try {
        // Check if the chat with this user already exists 
        const chatExsists = await prisma.chats.findFirst({
            where: {
                AND: [
                    {
                        users: {
                            some: {
                                id: userId
                            }
                        }
                    },
                    {
                        users: {
                            some: {
                                id: req.user.id
                            }
                        }
                    }
                ]
            }
        })

        if (chatExsists) return res.status(400).json({ error: 'Chat already exists' });
        else {
            const newChat = await prisma.chats.create({
                data: {
                    users: {
                        connect: [
                            { id: userId },
                            { id: req.user.id }
                        ]
                    }
                },
                include:{
                    users:true,
                }
            })
            return res.status(200).json( newChat );
        }

    } catch (err) {
        console.log(err);
        res.status(400).json({ error: "Error in creating chat" })
    }
}

const getChat = async (req, res) => {

    const { chatId } = req.body;
    try {
        const chatById = await prisma.chats.findUnique({
            where: {
                id: chatId
            },
            include: {
                messages: {
                    include:{
                        sender:{
                            select:{
                                id:true,
                                email:true,
                                username:true,
                            }
                        }
                    }
                },
                users:true
            }
        })
        if (chatById) {
            //console.log(chatById)
            const chatNameUser=chatById.users.find(user=>user.id!==req.user.id)
             const formattedChats = {
                 ...chatById,
                 chatName:chatNameUser.username
             }
             console.log(formattedChats);
            return res.status(200).json(formattedChats);
        }
        else {
            return res.status(400).json({ error: 'Chat not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Error getting chat' });
    }

}

module.exports = { fetchChat, createChat, getChat }