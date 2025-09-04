import { Meteor } from "meteor/meteor";
import { CommentsCollection } from "./CommentsCollection";
import { Comment } from "./CommentsCollection";
import { check } from "meteor/check";
import { requireLoginMethod } from "../accounts/wrappers";

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
});
