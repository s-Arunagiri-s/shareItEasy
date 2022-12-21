import * as mongodb from "mongodb";
import { User } from "./schema/user";
import { Post } from "./schema/post";
import { Comment } from "./schema/comment"
 
export const collections: {
   users?: mongodb.Collection<User>;
   posts?: mongodb.Collection<Post>;
   comments?: mongodb.Collection<Comment>;
} = {};
 
export async function connectToDatabase(uri: string) {
   const client = new mongodb.MongoClient(uri);
   await client.connect();
 
   const db = client.db("Project");
   await applySchemaValidation(db);
 
   const usersCollection = db.collection<User>("users");
   collections.users = usersCollection;

   const postsCollection = db.collection<Post>("posts");
   collections.posts = postsCollection;

   const commentsCollection = db.collection<Comment>("comments");
   collections.comments = commentsCollection;
}
 
// Update our existing collection with JSON schema validation so we know our documents will always match the shape of our Employee model, even if added elsewhere.
// For more information about schema validation, see this blog series: https://www.mongodb.com/blog/post/json-schema-validation--locking-down-your-model-the-smart-way
async function applySchemaValidation(db: mongodb.Db) {
   const jsonSchema = {
       $jsonSchema: {
           bsonType: "object",
           required: ["firstname", "lastname", "email", "password"],
           additionalProperties: false,
           properties: {
               _id: {},
               firstname: {
                   bsonType: "string",
                   description: "'firstname' is required and is a string",
               },
               lastname: {
                bsonType: "string",
                description: "'lastname' is required and is a string",
               },
               email: {
                bsonType: "string",
                description: "'email' is required and is a string",
               },
               password: {
                bsonType: "string",
                description: "'password' is required and is a string",
               },
           },
       },
   };
 
   // Try applying the modification to the collection, if the collection doesn't exist, create it
  await db.command({
       collMod: "users",
       validator: jsonSchema
   }).catch(async (error: mongodb.MongoServerError) => {
       if (error.codeName === 'NamespaceNotFound') {
           await db.createCollection("users", {validator: jsonSchema});
       }
   });
}
