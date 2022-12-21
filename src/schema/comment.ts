import * as mongodb from "mongodb";
 
export interface Comment {
   postid: string;
   comment: string;
   author: string;
   time: string;
   like: number;
   _id?: mongodb.ObjectId;
}