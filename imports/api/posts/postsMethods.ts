import { Meteor } from "meteor/meteor";
import { Post, PostsCollection } from "./PostsCollection";
import { check } from "meteor/check";
import { requireLoginMethod } from "../accounts/wrappers";
import { IdType } from "../database";

Meteor.methods({
  "posts.createPost": requireLoginMethod(async function (post: Post) {
    if (!post)
      throw new Meteor.Error("invalid-arguments", "Post data is required");
    return await PostsCollection.insertAsync(post);
  }),

  "posts.getAll": requireLoginMethod(async function () {
    return PostsCollection.find().fetch();
  }),

});
