import React, { useEffect, useState } from "react";
import { Form } from "./interaction/form/Form";
import { Button } from "./interaction/Button";
import { TextArea } from "./interaction/TextArea";
import { Meteor } from "meteor/meteor";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { TrainingListsCollection } from "/imports/api/training/TrainingListsCollection";

export interface TrainingListFormData {
  title: string;
  items: { id: string; name: string }[];
}

export const AddTrainingListForm = ({
  onSuccess,
}: {
  onSuccess: () => void;
}) => {
  useSubscribe("trainingLists.all");
  const trainingList = useTracker(() => TrainingListsCollection.find().fetch());
  const [title, setTitle] = useState("");
  const [rawItems, setRawItems] = useState("");
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    if (!initialised && trainingList.length > 0) {
      setTitle(trainingList[0].title);
      setRawItems(trainingList[0].items.map((i) => i.name).join("\n"));
      setInitialised(true); // only initialize once
    }
  }, [trainingList, initialised]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return; // optional: prevent empty title

    // Build a lookup of existing items by name
    const existingItemsByName = (trainingList[0]?.items || []).reduce(
      (acc, item) => {
        acc[item.name] = item.id;
        return acc;
      },
      {} as Record<string, string>,
    );

    // Split raw items and assign IDs
    const items = rawItems
      .split(/[\n,]+|\s{2,}/) // split by newline, comma, or 2+ spaces
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((name) => ({
        id: existingItemsByName[name] || crypto.randomUUID(),
        name,
      }));

    const formData: TrainingListFormData = {
      title,
      items,
    };

    if (trainingList.length > 0) {
      // Update existing list
      try {
        await new Promise((resolve, reject) => {
          Meteor.call(
            "trainingLists.update",
            trainingList[0]._id,
            formData,
            (err: Meteor.Error, res: any) => {
              if (err) reject(err);
              else resolve(res);
            },
          );
        });
        onSuccess();
      } catch (err) {
        alert("Failed to update training list.");
        console.error(err);
      }
      return;
    }

    // Insert new list
    try {
      await new Promise((resolve, reject) => {
        Meteor.call(
          "trainingLists.insert",
          formData,
          (err: Meteor.Error, res: any) => {
            if (err) reject(err);
            else resolve(res);
          },
        );
      });
      onSuccess();
    } catch (err) {
      alert("Failed to create training list.");
      console.error(err);
    }
  };

  return (
    <Form
      title={
        trainingList.length > 0
          ? "Edit Training List"
          : "Create New Training List"
      }
      onSubmit={onSuccess}
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
          Training List Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
          placeholder="Staff Training"
          required
        />
      </div>
      <div>
        <label className="block my-2 text-sm font-medium text-red-900 dark:text-white">
          Training Items (separated by commas, newlines, or multiple spaces)
        </label>
        <TextArea
          value={rawItems}
          onChange={(e) => setRawItems(e.target.value)}
          placeholder={`e.g.\nFire Safety\nFood Handling\nCustomer Service`}
          required
          rows={8}
        />
      </div>
      <Button
        type="submit"
        className="bg-green-600 text-white py-2 mt-2 px-4 rounded w-full"
        onClick={handleSubmit}
      >
        Save Training List
      </Button>
    </Form>
  );
};
