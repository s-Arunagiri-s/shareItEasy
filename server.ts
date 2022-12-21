import * as dotenv from "dotenv";
import path from "path";
import cors from "cors";
import express from "express";
import { connectToDatabase } from "./src/database";
import { userRouter } from "./src/routes/user.routes";
 
// Load environment variables from the .env file, where the ATLAS_URI is configured
dotenv.config();
 
 
connectToDatabase("mongodb+srv://Optisol-project1:Optisol-project1@cluster0.mujzk.mongodb.net/test")
   .then(() => {
       const app = express();
       app.use(cors());

        //app.router
        app.use("/users", userRouter);

       // add frontend

       app.use(express.static("dist/reg1"));
        app.get("*", (req, res) => {
        res.sendFile(
            path.resolve(__dirname,"dist", "reg1", "index.html")
        );
        });

       // start the Express server
       app.listen(5000, () => {
           console.log(`Server running at http://localhost:5000...`);
       });
 
   })
   .catch(error => console.error(error));