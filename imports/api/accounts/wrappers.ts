import { Meteor } from "meteor/meteor";
import { IdType } from "../database";

export function requireLoginMethod<Args extends any[], R>(
  fn: (this: Meteor.MethodThisType, ...args: Args) => Promise<R> | R,
): (this: Meteor.MethodThisType, ...args: Args) => Promise<R> {
  return async function (...args) {
    if (!this.userId) {
      throw new Meteor.Error("unauthorized", "User must be logged in");
    }
    return await fn.apply(this, args);
  };
}

interface PublishContext {
  userId?: IdType | null;
  ready: () => void;
}

export function requireLoginPublish<Args extends any[]>(
  fn: (this: PublishContext & { userId: IdType }, ...args: Args) => any,
): (this: PublishContext, ...args: Args) => any {
  return function (this: PublishContext, ...args: Args) {
    if (!this.userId) {
      this.ready();
      return;
    }
    return fn.apply(this as PublishContext & { userId: IdType }, args);
  };
}
