import { Meteor } from "meteor/meteor";
import { Post, PostsCollection } from "./PostsCollection";
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
    check(post.category, String);
    post.datePosted = new Date();
    return await PostsCollection.insertAsync(post);
  }),

  "posts.delete": requireLoginMethod(async function (postId: IdType) {
    if (!postId)
      throw new Meteor.Error("invalid-arguments", "Post ID is required");
    Meteor.call("comments.deleteAll", postId);
    return await PostsCollection.removeAsync(postId);
  }),

  "posts.togglePin": requireLoginMethod(async function (postId: IdType) {
    if (!postId)
      throw new Meteor.Error("invalid-arguments", "Post ID is required");

    const post = await PostsCollection.findOneAsync(postId);
    if (!post) {
      throw new Meteor.Error("not-found", "Post not found");
    }

    const newPinnedStatus = !post.pinned;
    return await PostsCollection.updateAsync(postId, {
      $set: { pinned: newPinnedStatus },
    });
  }),

  "posts.getCategories": async function () {
    const posts = await PostsCollection.find(
      {},
      { fields: { category: 1 } },
    ).fetchAsync();
    const categories = [
      ...new Set(
        posts.map((post) => post.category).filter((cat) => cat && cat.trim()),
      ),
    ];
    return categories.sort();
  },
});
