import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";

Meteor.publish("users.all", async function () {
  if (!this.userId) {
    return this.ready();
  }
  const isAdmin = await Roles.userIsInRoleAsync(this.userId, "admin");
  if (!isAdmin) {
    return this.ready();
  }
  return Meteor.users.find({}, { fields: { username: 1, roles: 1 } });
});

Meteor.publish("roleAssignments.mine", function () {
  if (!this.userId) {
    return this.ready();
  }
  return Meteor.roleAssignment.find(
    { "user._id": this.userId },
    { fields: { user: 1, role: 1 } }
  );
});

Meteor.publish("roleAssignments.all", async function () {
  if (!this.userId) {
    return this.ready();
  }
  const isAdmin = await Roles.userIsInRoleAsync(this.userId, "admin");
  if (!isAdmin) {
    return this.ready();
  }
  return Meteor.roleAssignment.find({}, { fields: { user: 1, role: 1 } });
});

Meteor.publish("roles.all", async function () {
  if (!this.userId) {
    return this.ready();
  }
  const isAdmin = await Roles.userIsInRoleAsync(this.userId, "admin");
  if (!isAdmin) {
    return this.ready();
  }
  return Meteor.roles.find({}, {fields: { role: 1 }});
});