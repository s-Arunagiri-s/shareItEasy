import * as mongodb from "mongodb";

export interface Post {
   title: string;
   edcon: string;
   creator: string;
   creatorid: string;
   time: string;
   like: number;
   _id?: mongodb.ObjectId;
}