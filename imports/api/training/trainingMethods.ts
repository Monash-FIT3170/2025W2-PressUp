import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { TrainingListsCollection, TrainingList } from "./TrainingListsCollection";
import { TrainingProgressCollection, TrainingProgress } from "./TrainingProgressCollection";
import { requireLoginMethod } from "../accounts/wrappers";
import { IdType, OmitDB } from "../database";

// TrainingLists methods
Meteor.methods({
  "trainingLists.insert": requireLoginMethod(async function (
    list: OmitDB<TrainingList>,
  ) {
    check(list.title, String);
    check(list.items, Array);

    return await TrainingListsCollection.insertAsync(list);
  }),

  "trainingLists.update": requireLoginMethod(async function (
    listId: IdType,
    updates: Partial<OmitDB<TrainingList>>,
  ) {
    check(listId, String);
    if (updates.title !== undefined) check(updates.title, String);
    if (updates.items !== undefined) check(updates.items, Array);

   const result = await TrainingListsCollection.updateAsync(listId, { $set: updates });

     // If items changed, update all related progress entries
  if (updates.items !== undefined) {
    const newItemIds = updates.items.map(item => item.id);

    // Update all progress entries for this list
    await TrainingProgressCollection.updateAsync(
      { trainingListId: listId },
      {
        $set: newItemIds.reduce((acc, itemId) => {
          acc[`completedItems.${itemId}`] = false; // add new items if missing
          return acc;
        }, {} as Record<string, boolean>)
      },
      { multi: true } // update all documents for this training list
    );

    // Optionally, remove any completedItems that are no longer in the list
    const removeKeys = Object.keys(updates.items.reduce((acc, item) => {
      acc[item.id] = true;
      return acc;
    }, {} as Record<string, boolean>));

    await TrainingProgressCollection.updateAsync(
      { trainingListId: listId },
      {
        $unset: removeKeys.reduce((acc, key) => {
          if (!newItemIds.includes(key)) acc[`completedItems.${key}`] = "";
          return acc;
        }, {} as Record<string, "">)
      },
      { multi: true }
    );
  }

  return result;
  }),

  "trainingLists.remove": requireLoginMethod(async function (listId: IdType) {
    check(listId, String);
    return await TrainingListsCollection.removeAsync(listId);
  }),

  // TrainingProgress methods
  "trainingProgress.insert": requireLoginMethod(async function (
    progress: OmitDB<TrainingProgress>,
  ) {
    check(progress.staffId, String);
    check(progress.trainingListId, String);
    check(progress.completedItems, Object);

    return await TrainingProgressCollection.insertAsync(progress);
  }),

  "trainingProgress.ensureForStaff": requireLoginMethod(async function (staffId: string, trainingListId: string, items: { id: string }[]) {
    const completedItems = items.reduce((acc, item) => {
      acc[item.id] = false;
      return acc;
    }, {} as Record<string, boolean>);

        check(staffId, String);
    check(trainingListId, String);
    check(completedItems, Object);

   // Check if already exists
    const existing = await TrainingProgressCollection.findOneAsync({
      staffId,
      trainingListId,
    });

    if (!existing) {

      const progress: OmitDB<TrainingProgress> = {
        staffId,
        trainingListId,
        completedItems,
      };
      // Insert normally via Meteor collection so minimongo sees it
     return await TrainingProgressCollection.insertAsync(progress);
    }
  }),

  "trainingProgress.update": requireLoginMethod(async function (
    progressId: IdType,
    updates: Partial<OmitDB<TrainingProgress>>,
  ) {
    check(progressId, String);
    if (updates.staffId !== undefined) check(updates.staffId, String);
    if (updates.trainingListId !== undefined) check(updates.trainingListId, String);
    if (updates.completedItems !== undefined) { check(updates.completedItems, Object);
}
    return await TrainingProgressCollection.updateAsync(progressId, { $set: updates });
  }),

    "trainingProgress.addCompletedItemToAll": requireLoginMethod(async function (
    itemId: string,
    completed: boolean,
  ) {
    check(itemId, String);
    check(completed, Boolean);

    // Use MongoDB $set operator with dot notation to update nested fields
    return await TrainingProgressCollection.updateAsync(
      {}, // Match all documents
      { $set: { [`completedItems.${itemId}`]: completed } },
      { multi: true }
    );
  }),

  "trainingProgress.remove": requireLoginMethod(async function (progressId: IdType) {
    check(progressId, String);
    return await TrainingProgressCollection.removeAsync(progressId);
  }),
});