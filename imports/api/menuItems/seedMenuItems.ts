import { Meteor } from "meteor/meteor";
import { MenuItemsCollection } from "./MenuItemsCollection";
import { mockMenuItems } from "./mock";

Meteor.startup(async () => {
  const shouldHardReset =
    Meteor.isDevelopment && (process.env.RESET_MENU_ITEMS ?? "1") === "1";

  if (shouldHardReset) {
    await MenuItemsCollection.rawCollection().deleteMany({});
    await mockMenuItems();
    console.log("[seed] MenuItems hard reset & reseeded");
  } else if (Meteor.isDevelopment) {
    await mockMenuItems();
    console.log("[seed] MenuItems upserted");
  }
});
