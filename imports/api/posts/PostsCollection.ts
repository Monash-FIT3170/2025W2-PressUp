import { Mongo } from "meteor/mongo";
import { DBEntry, IdType, OmitDB } from "../database";

export interface Comment {
    _id?: IdType;
  postedBy: string;
  datePosted: Date;
  content: string; 
}

export interface Post extends DBEntry {
  postedBy: string;
  datePosted: Date;
  subject: string;
  content: string;
  category: string; // TODO: 5.3 to implement this functionality
  comments?: Comment[];
}

export const PostsCollection = new Mongo.Collection<OmitDB<Post>, Post>(
  "posts",
);
