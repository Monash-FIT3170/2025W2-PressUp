import { Mongo } from "meteor/mongo";
import { DBEntry, OmitDB } from "../database";

export interface Post extends DBEntry {
  postedBy: string;
  datePosted: Date;
  subject: string;
  content: string;
  category: string; // TODO: 5.3 to implement this functionality
}

export const PostsCollection = new Mongo.Collection<OmitDB<Post>, Post>(
  "posts",
);
