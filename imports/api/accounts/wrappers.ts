import { Meteor } from "meteor/meteor";

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

export function requireLoginPublish<Args extends any[]>(
  name: string,
  fn: (
    this: { userId?: string | null; ready: () => void },
    ...args: Args
  ) => any,
) {
  Meteor.publish(
    name,
    function (
      this: { userId?: string | null; ready: () => void },
      ...args: Args
    ) {
      if (!this.userId) {
        this.ready();
        return;
      }
      return fn.apply(this, args);
    },
  );
}
