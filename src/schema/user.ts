import * as mongodb from "mongodb";
 
export interface User {
   firstname: string;
   lastname: string;
   emailid: string;
   password: string;
   image: BinaryData;
   _id?: mongodb.ObjectId;
   
}