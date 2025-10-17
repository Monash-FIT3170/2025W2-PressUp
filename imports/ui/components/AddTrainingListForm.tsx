import React, { useEffect, useState } from "react";
import { Form } from "./interaction/form/Form";
import { Button } from "./interaction/Button";
import { TextArea } from "./interaction/TextArea";
import { Meteor } from "meteor/meteor";
import { TrainingList } from "/imports/api/training/TrainingListsCollection";

export interface TrainingListFormData {
  title: string;
  items: { id: string; name: string }[];
}

interface AddTrainingListFormProps {
  trainingList?: TrainingList | null;
  onSuccess: () => void;
}

export const AddTrainingListForm: React.FC<AddTrainingListFormProps> = ({
  trainingList,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [rawItems, setRawItems] = useState("");

  useEffect(() => {
    if (trainingList) {
      setTitle(trainingList.title);
      setRawItems(trainingList.items?.map((i) => i.name).join("\n") || "");
    } else {
      setTitle("");
      setRawItems("");
    }
  }, [trainingList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return; // optional: prevent empty title

    // Parse and deduplicate item names
    const inputNames = Array.from(
      new Set(
        rawItems
          .split(/[\n,]+|\s{2,}/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
      ),
    );

    // Build a lookup of existing items by name
    const existingItemsByName = (trainingList?.items || []).reduce(
      (acc, item) => {
        acc[item.name] = item.id;
        return acc;
      },
      {} as Record<string, string>,
    );

    // Only keep items that are in the inputNames (removes deleted ones)
    const items = inputNames.map((name) => ({
      id: existingItemsByName[name] || crypto.randomUUID(),
      name,
    }));

    const formData: TrainingListFormData = {
      title,
      items,
    };

    let listId = trainingList?._id;

    try {
      if (trainingList) {
        // Update existing list
        await new Promise((resolve, reject) => {
          Meteor.call(
            "trainingLists.update",
            trainingList._id,
            formData,
            (err: Meteor.Error, res: any) => {
              if (err) reject(err);
              else resolve(res);
            },
          );
        });
      } else {
        // Insert new list
        listId = await new Promise((resolve, reject) => {
          Meteor.call(
            "trainingLists.insert",
            formData,
            (err: Meteor.Error, res: any) => {
              if (err) reject(err);
              else resolve(res);
            },
          );
        });
      }

      // Update progress for all staff
      const staff = Meteor.users.find().fetch();
      for (const user of staff) {
        await new Promise((resolve, reject) => {
          Meteor.call(
            "trainingProgress.ensureForStaff",
            user._id,
            listId,
            items,
            (err: Meteor.Error, res: any) => {
              if (err) reject(err);
              else resolve(res);
            },
          );
        });
      }

      onSuccess();
    } catch (err) {
      alert("Failed to save training list or update staff progress.");
      console.error(err);
    }
  };

  return (
    <Form
      title={trainingList ? "Edit Training List" : "Create New Training List"}
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
