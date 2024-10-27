const router=require('express').Router();
const {login,register,getAllUsers}=require('../controllers/userController');

router.post('/login',login);
router.post('/register',register);
router.get('/allusers',getAllUsers)
module.exports=router;
