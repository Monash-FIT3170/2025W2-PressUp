import { Meteor } from "meteor/meteor";
import { Comment, Post, PostsCollection } from "./PostsCollection";
import { check } from "meteor/check";
import { requireLoginMethod } from "../accounts/wrappers";
import { IdType } from "../database";

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
  "posts.addComment": requireLoginMethod(async function (postId: IdType, comment: Comment) {
      if (!postId || !comment)
        throw new Meteor.Error(
    "invalid-arguments",
    "Post ID and comment are required",
    );
    check(postId, String)
    check(comment.postedBy, String)
    check(comment.content, String)
    comment.datePosted = new Date();
    return await PostsCollection.updateAsync(postId, {$push: { comments: comment}});
  }),
});
