import { Mongo } from "meteor/mongo";
import { DBEntry, IdType, OmitDB } from "../database";

export interface Comment extends DBEntry {
  postedBy: IdType;
  datePosted: Date;
  content: string;
  postId: string;
}

export const CommentsCollection = new Mongo.Collection<
  OmitDB<Comment>,
  Comment
>("comments");
