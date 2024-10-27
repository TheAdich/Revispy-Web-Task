const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config()
const prisma=new PrismaClient();
//Jwt Token Config
const maxAge = 24 * 60 * 60;

const genrateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_KEY, {
        expiresIn: maxAge
    })
}

async function hashPassword(password) {
    try {
        const saltRounds = 10; // Number of salt rounds to use
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.log(error)
    }
}

async function comparePassword(password, hashedPassword) {
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    } catch (error) {
        console.log(error)
    }
}

const login=async(req,res)=>{
    const {username,password}=req.body;


    if(!username || !password){
        return res.status(400).json({error:"Username and password are required"})
    }

    try{

        const user=await prisma.user.findUnique({
            where:{
                username:username
            },
        })
        
        if(!user){
            return res.status(400).json({error:"User not found"})
        }
        //console.log(user);
        const compare = await comparePassword(password, user.password);


        if(compare){ 
            const token=genrateToken(user.id);
            res.cookie('jwt',token,{ httpOnly: true, maxAge: maxAge * 1000, sameSite: "none", secure: true });
            const formattedUser = {
                id:user.id,
                username: user.username,
                email: user.email
            };
            return res.status(200).json({formattedUser,token});
        }
        else {
            return res.status(401).json({ error: 'Invalid password' });
        }

    }catch(err){
        console.log(err)
        return res.status(400).json({error:"Error in Logging the User"})
    }

}

const register=async(req,res)=>{

    const {username,password,email}=req.body;
    if(!username || !password || !email){
        return res.status(400).json({error:"All fields are required"})
    }
    try{

        const checkUserExist=await prisma.user.findFirst({
            where:{
                OR:[
                    {username:username},
                    {email:email}
                ]
            }
        })

        if(checkUserExist){
            return res.status(400).json({error:"User already exists"})
        }

        const hashedPassword=await hashPassword(password);
        const user=await prisma.user.create({
            data:{
                username:username,
                password:hashedPassword,
                email:email
            },
            select:{
                username:true,
                email:true,
                id:true,
            }
        })
        //console.log(user);
        const token=genrateToken(user.id);
        res.cookie('jwt',token,{ httpOnly: true, maxAge: maxAge * 1000, sameSite: "none", secure: true });
        return res.status(200).json({user,token});

    }catch(err){
        console.log(err)
        return res.status(400).json({error:"Error in Registering the User"})
    }

}

const getAllUsers=async(req,res)=>{
    try{
        const users=await prisma.user.findMany({
            select:{
                id:true,
                username:true,
                email:true,
            }
        })
        return res.status(200).json(users);
    }catch(err){
        console.log(err);
        return res.status(400).json({error:"Cannot Fetch Users"})
    }
}

module.exports={login,register,getAllUsers};