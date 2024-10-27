const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors=require('cors');
const cookieParser=require('cookie-parser');
const app = express();
const server = createServer(app);
const authRouter=require('./routes/authRoute');
const msgRouter=require('./routes/msgRoute');
const chatRouter=require('./routes/chatRoute');
const authMiddleware=require('./middleware/authMiddleware');

const io = new Server(server,{
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    }
});


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST','PUT','DELETE']
}))
app.use('/api/user',authRouter);
app.use('/api/chat',authMiddleware,chatRouter);
app.use('/api/msg',authMiddleware,msgRouter);
app.get('/',authMiddleware);

let users={};
io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);
    socket.on("joinroom",(chatId)=>{
        console.log(chatId);
        socket.join(chatId);
    })

    socket.on('newMessage',({chatId,content})=>{
        console.log(chatId,content);
        socket.to(chatId).emit('getMessage',content);
    })

    
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(5000, () => {
    console.log('Server is running on port 5000');
})