const router=require('express').Router();
const {createChat,fetchChat,getChat}=require('../controllers/chatController');

router.post('/createChat',createChat);
router.get('/fetchallchat',fetchChat);
router.post('/getChat',getChat)

module.exports=router;