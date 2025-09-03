import { Meteor } from "meteor/meteor";
import { Post, PostsCollection } from "./PostsCollection";
import { check } from "meteor/check";
import { requireLoginMethod } from "../accounts/wrappers";

Meteor.methods({
  "posts.create": requireLoginMethod(async function (post: Post) {
      if (!post)
        throw new Meteor.Error("invalid-arguments", "Post data is required");
    check(post.postedBy, String);
    check(post.subject, String);
    check(post.content, String);
    post.datePosted = new Date();
    return await PostsCollection.insertAsync(post);
}),
});
