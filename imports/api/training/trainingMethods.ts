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

    // Fetch all progress entries for this list
    const progresses = await TrainingProgressCollection.find({ trainingListId: listId }).fetchAsync();

    for (const progress of progresses) {
      const newCompletedItems: Record<string, boolean> = {};

      // Preserve status for items that still exist
      for (const itemId of newItemIds) {
        newCompletedItems[itemId] = progress.completedItems?.[itemId] ?? false;
      }

      // Update the progress entry
      await TrainingProgressCollection.updateAsync(
        progress._id,
        { $set: { completedItems: newCompletedItems } }
      );
    }
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
    check(staffId, String);
  check(trainingListId, String);

  const existing = await TrainingProgressCollection.findOneAsync({
    staffId,
    trainingListId,
  });

  // Build new completedItems object
  const itemIds = items.map(item => item.id);
  let completedItems: Record<string, boolean> = {};

  if (existing) {
    // Preserve status for existing items, add new items as false
    for (const itemId of itemIds) {
      completedItems[itemId] = existing.completedItems?.[itemId] ?? false;
    }
    // Remove items no longer in the list
    // (i.e., only keep those in itemIds)
    return await TrainingProgressCollection.updateAsync(
      existing._id,
      { $set: { completedItems } }
    );
  } else {
    // Create new entry
    completedItems = itemIds.reduce((acc, itemId) => {
      acc[itemId] = false;
      return acc;
    }, {} as Record<string, boolean>);
    const progress: OmitDB<TrainingProgress> = {
      staffId,
      trainingListId,
      completedItems,
    };
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