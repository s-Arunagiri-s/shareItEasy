import * as express from "express";
import * as mongodb from "mongodb";
import { collections } from "../database";
import { User } from "../schema/user"
import jwt_decode  from "jwt-decode";

var nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken') 
export const userRouter = express.Router();
userRouter.use(express.json());
 
//create post
userRouter.post("/crpo", async (req, res) => {
    try {
        const post = req.body;
        const result = await collections.posts.insertOne(post);
  
        if (result.acknowledged) {
            console.log("post works")
            res.status(201).send({message:`New post created.`});
        } else {
            res.status(500).send("Failed to create a new post.");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
 });
 
 //create comment
 userRouter.post("/crco", async (req, res) => {
    try {
        const comment = req.body;
        const result = await collections.comments.insertOne(comment);
  
        if (result.acknowledged) {
            console.log("comment works")
            res.status(201).send({message:`New comment created.`});
        } else {
            res.status(500).send("Failed to create a new comment.");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
 });

userRouter.post("/sendmail", async (req, res) => {
    try {
        const user = req.body;
        const result = await collections.users.insertOne(user);
  
        if (result.acknowledged) {
            let payload = { subject: result.insertedId }
            let token = jwt.sign(payload, 'secretKey')
            console.log({token})
            var decoded = jwt_decode(token);
            console.log("Decoded:")
            console.log(decoded);
            res.status(201).send({token});
            //res.status(201).send({message:`New user created.`});
        } else {
            res.status(500).send("Failed to create a new user.");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
 });

function verifyToken(req :any, res: any, next: any) {
    if (!req.headers.authorization) {
        return res.status(401).send('Unauthorised request')
    }
    let token = req.headers.authorization.split(' ')[1]
    if (token ==='null') {
        return res.status(401).send('Unauthorised request')
    }
    let payload = jwt.verify(token, 'secretKey')
    if(!payload) {
        return res.status(401).send('Unauthorised request')
    }
    req.userId = payload.subject
    next()
}

userRouter.get("/", verifyToken , async (_req, res) => {
   try {
       const users = await collections.users.find({}).toArray();
       res.status(200).send(users);
   } catch (error) {
       res.status(500).send(error.message);
   }
});

userRouter.get("/crpo", verifyToken , async (_req, res) => {
    try {
        console.log("yup");
        const posts = await collections.posts.find({}).toArray();
        console.log(posts);
        res.status(200).send(posts);
    } catch (error) {
        res.status(500).send(error.message);
    }
 });

userRouter.get("/:id", async (req, res) => {
    try {
        console.log("user works");
        const id = req?.params?.id;
        const query = { _id: new mongodb.ObjectId(id) };
        const user = await collections.users.findOne(query);
  
        if (user) {
            console.log('test');
            res.status(200).send(user);
        } else {
            res.status(404).send(`Failed to find an user: ID ${id}`);
        }
  
    } catch (error) {
        res.status(404).send(`Failed to find an user123: ID ${req?.params?.id}`);
    }
 });

 userRouter.get("/like/:id", async (req, res) => {
    try {
        console.log("liked");
        const id = req?.params?.id;
        const query = { _id: new mongodb.ObjectId(id) };
        const post = await collections.posts.findOne(query);
  
        if (post) {
            console.log(post);
            res.status(200).send(post);
        } else {
            res.status(404).send(`Failed to find an post: ID ${id}`);
        }
  
    } catch (error) {
        console.log("like error");
        res.status(404).send(error);
    }
 });

 userRouter.get("/likecomment/:id", async (req, res) => {
    try {
        console.log("liked comment");
        const id = req?.params?.id;
        const query = { _id: new mongodb.ObjectId(id) };
        const comment = await collections.comments.findOne(query);
  
        if (comment) {
            console.log(comment);
            res.status(200).send(comment);
        } else {
            res.status(404).send(`Failed to find an post: ID ${id}`);
        }
  
    } catch (error) {
        console.log("like error");
        res.status(404).send(error);
    }
 });

//get certain user posts
 userRouter.get("/post/:creator", async (req, res) => {
    try {
        const id = req?.params?.creator;
        console.log('dfgsdf',id);
    //    const query = { _id: new mongodb.Object(id) };
        console.log("yupdfghdfh");
        const posts = await collections.posts.find({creator: id}).toArray();
        console.log(posts);
        res.status(200).send(posts);
    } catch (error) {
        console.log('fsdfs', error);
        res.status(404).send(error);
    }
 });

 userRouter.get("/comment/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        console.log('half work',id);
        const comments = await collections.comments.find({postid: id}).toArray();
        console.log(comments);
        res.status(200).send(comments);
    } catch (error) {
        console.log('comment not work', error);
        res.status(404).send(error);
    }
 });

 /*userRouter.get("/homepage/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new mongodb.ObjectId(id) };
        const user = await collections.users.findOne(query);
  
        if (user) {
            console.log('test');
            res.status(200).send(user);
        } else {
            res.status(404).send(`Failed to find an user: ID ${id}`);
        }
  
    } catch (error) {
        res.status(404).send(`Failed to find an user: ID ${req?.params?.id}`);
    }
 });*/

 //
 userRouter.post("/", async (req, res) => {
    try {
        const user = req.body;
        const emailExist = await collections.users.findOne({email: req.body.email});
        if(emailExist) {
            return res.status(401).send("Email Already Exists")
        }
        const result = await collections.users.insertOne(user);
  
        if (result.acknowledged) {
            let payload = { subject: result.insertedId }
            let token = jwt.sign(payload, 'secretKey')
            console.log({token})
            var decoded = jwt_decode(token);
            console.log("Decoded:")
            console.log(decoded);
            res.status(201).send({token});
            //res.status(201).send({message:`New user created.`});
        } else {
            res.status(500).send("Failed to create a new user.");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
 });

 //user edit
 userRouter.put("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const user = req.body;
        const query = { _id: new mongodb.ObjectId(id) };
        const result = await collections.users.updateOne(query, { $set: user });
  
        if (result && result.matchedCount) {
            res.status(200).send(`Updated an user: ID ${id}.`);
        } else if (!result.matchedCount) {
            res.status(404).send(`Failed to find an user: ID ${id}`);
        } else {
            res.status(304).send(`Failed to update an user: ID ${id}`);
        }
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
 });

 //post edit
 userRouter.put("/like/edit/:id", async (req, res) => {
    try {
        console.log("edit");
        const id = req?.params?.id;
        const post = req.body;
        const query = { _id: new mongodb.ObjectId(id) };
        const result = await collections.posts.updateOne(query, { $set: {
            like: post.like
        } });
  
        if (result && result.matchedCount) {
            res.status(200).send(`Updated an post: ID ${id}.`);
        } else if (!result.matchedCount) {
            res.status(404).send(`Failed to find an post: ID ${id}`);
        } else {
            res.status(304).send(`Failed to update an post: ID ${id}`);
        }
    } catch (error) {
        console.log("user update no")
        console.error(error.message);
        res.status(400).send(error.message);
    }
 });

 userRouter.put("/like/editcomment/:id", async (req, res) => {
    try {
        console.log("editcomment");
        const id = req?.params?.id;
        const comment = req.body;
        const query = { _id: new mongodb.ObjectId(id) };
        const result = await collections.comments.updateOne(query, { $set: {
            like: comment.like
        } });
  
        if (result && result.matchedCount) {
            res.status(200).send(`Updated an comment: ID ${id}.`);
        } else if (!result.matchedCount) {
            res.status(404).send(`Failed to find an comment: ID ${id}`);
        } else {
            res.status(304).send(`Failed to update an comment: ID ${id}`);
        }
    } catch (error) {
        console.log("user update no")
        console.error(error.message);
        res.status(400).send(error.message);
    }
 });

 userRouter.put("/like/edit/post/:id", async (req, res) => {
    try {
        console.log("editpost");
        const id = req?.params?.id;
        const post = req.body;
        const query = { _id: new mongodb.ObjectId(id) };
        const result = await collections.posts.updateOne(query, { $set: {
            title: post.title,
            edcon: post.edcon
        } });
  
        if (result && result.matchedCount) {
            res.status(200).send(`Updated an post: ID ${id}.`);
        } else if (!result.matchedCount) {
            res.status(404).send(`Failed to find an post: ID ${id}`);
        } else {
            res.status(304).send(`Failed to update an post: ID ${id}`);
        }
    } catch (error) {
        console.log("user update no")
        console.error(error.message);
        res.status(400).send(error.message);
    }
 });

 //delete user
 userRouter.delete("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new mongodb.ObjectId(id) };
        const result = await collections.users.deleteOne(query);
  
        if (result && result.deletedCount) {
            res.status(202).send(`Removed an user: ID ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove an user: ID ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Failed to find an user: ID ${id}`);
        }
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
 });

//delete post
 userRouter.delete("/like/delete/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new mongodb.ObjectId(id) };
        const result = await collections.posts.deleteOne(query);
  
        if (result && result.deletedCount) {
            res.status(202).send(`Removed a post: ID ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove an post: ID ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Failed to find an post: ID ${id}`);
        }
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
 });

// user login
 userRouter.post("/login", async (req, res) => {
    try {
        const user = req.body;
        console.log(user);
        const email = user.email;
        const query = { email: email };
        const result = await collections.users.findOne(query);
        if (result.password !== user.password)
        {
            console.log(result);
            console.log("invalid");
            res.status(401).send('Invalid email or password');
        }else
        if (result) {
            console.log("pass",result); 
            let payload = { subject: result._id } 
            let token = jwt.sign(payload, 'secretKey')
            console.log({token})
            var decoded = jwt_decode(token);
            console.log("Decoded:")
            console.log(decoded);
            res.status(201).send({token});
            //res.status(201).send({message:`signed in a new user.`});
            
        } else {
            console.log("fail");
            res.status(500).send("Failed to sign in a new user.");
        }
        
    } catch (error) {
        console.error(error, "dfgdfg");
        res.status(400).send(error.message);
    }
 });

//forgot password
 userRouter.post("/login/signin", async (req, res) => {
    try {
        console.log('work');
        const user = req.body;
        console.log(user);
        const email = user.email;
        const query = { email: email };
        const result = await collections.users.findOne(query);
        
        if (result) {
            console.log("pass",result); 
            res.status(201).send(result);
            var transporter = nodemailer.createTransport({
                service: 'hotmail',
                auth: {
                  user: 'ssaruna2022@outlook.com',
                  pass: 'AA123456789'
                }
              });
              
              var mailOptions = {
                from: 'ssaruna2022@outlook.com',
                to: email,
                subject: 'Sending Email using Node.js',
                text: "Did forget your password?! Your reset key is: 1234"
              };
              
              transporter.sendMail(mailOptions, function(error : any, info : any){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
             }       
    } catch (error) {
        console.error(error, "dfgdfg");
        res.status(400).send(error.message);
    }
 });

 userRouter.post("/login/signin/pass", async (req, res) => {
    try {
        console.log('work');
        const user = req.body;
        console.log(user);
        const email = user.email;
        const query = { email: email };
        const result = await collections.users.findOne(query);
        
        if (result) {
            console.log("pass",result); 
            res.status(201).send(result);
             }       
    } catch (error) {
        console.error(error, "dfgdfg");
        res.status(400).send(error.message);
    }
 });

 userRouter.post("/notification", async (req, res) => {
    try {
        console.log('notified');
        const user = req.body;
        console.log("user:",user);
        const email = user._value.email;
        const query = { email: email };
        const result = await collections.users.findOne(query);
        console.log("result:",result);
        if (result) {
            console.log("pass",result); 
            res.status(201).send(result);
            var transporter = nodemailer.createTransport({
                service: 'hotmail',
                auth: {
                  user: 'ssaruna2022@outlook.com',
                  pass: 'AA123456789'
                }
              });
              
              var mailOptions = {
                from: 'ssaruna2022@outlook.com',
                to: email,
                subject: 'New comment',
                text: "New comment has been added to your post!"
              };
              
              transporter.sendMail(mailOptions, function(error : any, info : any){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
             }       
    } catch (error) {
        console.error(error, "dfgdfg");
        res.status(400).send(error.message);
    }
 });