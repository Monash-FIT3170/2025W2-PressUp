import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB } from "../database";

export interface Comment extends DBEntry{
  postedBy: string;
  datePosted: Date;
  content: string; 
  postId: string;
}

export const CommentsCollection = new Mongo.Collection<OmitDB<Comment>, Comment>(
  "comments",
);
