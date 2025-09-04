import { Meteor } from "meteor/meteor";
import { CommentsCollection } from "./CommentsCollection";
import { Comment } from "./CommentsCollection";
import { check } from "meteor/check";
import { requireLoginMethod } from "../accounts/wrappers";
import { IdType } from "../database";

Meteor.methods({
  "comments.addComment": requireLoginMethod(async function (comment: Comment) {
    if (!comment)
      throw new Meteor.Error("invalid-arguments", "comment is required");
    check(comment.postId, String);
    check(comment.postedBy, String);
    check(comment.content, String);
    comment.datePosted = new Date();
    return await CommentsCollection.insertAsync(comment);
  }),
  "comments.deleteAll": requireLoginMethod(async function (postId: IdType) {
     if (!postId)
      throw new Meteor.Error("invalid-arguments", "Post ID is required");
    return await CommentsCollection.removeAsync({postId: postId});
  })
});
