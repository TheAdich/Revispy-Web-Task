const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma=new PrismaClient();
require('dotenv').config()
const authMiddleware = (req, res, next) => {
    
    const token=req.headers.authorization;
    //console.log(token);
    
    if (token) {
        jwt.verify(token, process.env.JWT_KEY, async (err, decodedToken) => {
            if (err) { console.log(err); }
            else {
            //console.log(decodedToken);
                try {
                     const user = await prisma.user.findUnique({
                        where:{
                            id:decodedToken.id
                        }
                     });
                     req.user = user;
                     next();
                 }
                 catch (err) {
                     console.log(err);
                 }
            }
        })
    }
    else {
        console.log('You are not authorised!');
        return res.status(301).send('Not authorised redirecting...');  
    }
}
module.exports = authMiddleware;