const router=require('express').Router();
const {createMsg,shareMsg}=require('../controllers/msgController');

router.post('/createMsg',createMsg);
router.post('/shareMsg',shareMsg)

module.exports=router;