import { Mongo } from "meteor/mongo";
import { DBEntry, IdType, OmitDB } from "../database";
export interface Post extends DBEntry {
  postedBy: IdType;
  datePosted: Date;
  subject: string;
  content: string;
  category: string;
}

export const PostsCollection = new Mongo.Collection<OmitDB<Post>, Post>(
  "posts",
);
