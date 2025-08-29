import { Meteor } from "meteor/meteor";
import { Post, PostsCollection } from "./PostsCollection";
import { check } from "meteor/check";
import { requireLoginMethod } from "../accounts/wrappers";

Meteor.methods({
  "posts.create": requireLoginMethod(async function (post: Post) {
    check(post.postedBy, String);
    check(post.subject, String);
    check(post.content, String);
    post.datePosted = new Date();

    if (!post)
      throw new Meteor.Error("invalid-arguments", "Post data is required");
    return await PostsCollection.insertAsync(post);
  }),
});
