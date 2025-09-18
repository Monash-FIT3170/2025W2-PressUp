import { Meteor } from "meteor/meteor";
import { faker } from "@faker-js/faker";
import { PostsCollection } from "./PostsCollection";
import { CommentsCollection } from "./CommentsCollection";
import { mockAccounts } from "../accounts/mock";

export const mockPosts = async (count: number = 5) => {
  if ((await PostsCollection.countDocuments()) > 0) {
    await PostsCollection.dropCollectionAsync();
  }

  const userCount = await Meteor.users.find().countAsync();
  if (userCount <= 1) {
    await mockAccounts(8);
  }

  const users = await Meteor.users.find().fetchAsync();
  const userIds = users.map((user) => user._id);

  for (let i = 0; i < count; i++) {
    await PostsCollection.insertAsync({
      postedBy: faker.helpers.arrayElement(userIds),
      datePosted: faker.date.recent({ days: 30 }),
      subject: faker.lorem.sentence({ min: 3, max: 8 }),
      content: faker.lorem.paragraphs({ min: 1, max: 3 }),
      category: faker.helpers.arrayElement([
        "General",
        "Announcements",
        "Staff",
        "Menu Updates",
        "Maintenance",
      ]),
    });
  }
};

export const mockComments = async (count: number = 10) => {
  if ((await CommentsCollection.countDocuments()) > 0) {
    await CommentsCollection.dropCollectionAsync();
  }

  const userCount = await Meteor.users.find().countAsync();
  if (userCount <= 1) {
    await mockAccounts(8);
  }

  const users = await Meteor.users.find().fetchAsync();
  const userIds = users.map((user) => user._id);

  const posts = await PostsCollection.find().fetchAsync();
  if (posts.length === 0) {
    await mockPosts(3);
    const newPosts = await PostsCollection.find().fetchAsync();

    for (let i = 0; i < count; i++) {
      const randomPost = faker.helpers.arrayElement(newPosts);
      await CommentsCollection.insertAsync({
        postedBy: faker.helpers.arrayElement(userIds),
        datePosted: faker.date.recent({ days: 7 }),
        content: faker.lorem.paragraph({ min: 1, max: 3 }),
        postId: randomPost._id,
      });
    }
  } else {
    for (let i = 0; i < count; i++) {
      const randomPost = faker.helpers.arrayElement(posts);
      await CommentsCollection.insertAsync({
        postedBy: faker.helpers.arrayElement(userIds),
        datePosted: faker.date.recent({ days: 7 }),
        content: faker.lorem.paragraph({ min: 1, max: 3 }),
        postId: randomPost._id,
      });
    }
  }
};
