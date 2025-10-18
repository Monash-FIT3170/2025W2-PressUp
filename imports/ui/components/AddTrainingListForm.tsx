import React, { useEffect, useState } from "react";
import { Form } from "./interaction/form/Form";
import { Button } from "./interaction/Button";
import { TextArea } from "./interaction/TextArea";
import { Meteor } from "meteor/meteor";
import { TrainingList } from "/imports/api/training/TrainingListsCollection";
import { Input, Label } from "./interaction/Input";

export interface TrainingListFormData {
  title: string;
  items: { id: string; name: string }[];
}

interface AddTrainingListFormProps {
  trainingList?: TrainingList | null;
  onSuccess: (newListId?: string) => void;
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

    if (!title.trim()) return;

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

    const items = inputNames.map((name) => ({
      id: existingItemsByName[name] || crypto.randomUUID(),
      name,
    }));

    const formData: TrainingListFormData = {
      title,
      items,
    };

    try {
      let listId: string;
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
        listId = trainingList._id;
        onSuccess(trainingList._id);
      } else {
        // Insert new list
        listId = await new Promise<string>((resolve, reject) => {
          Meteor.call(
            "trainingLists.insert",
            formData,
            (err: Meteor.Error, res: any) => {
              if (err) reject(err);
              else resolve(res as string);
            },
          );
        });
        onSuccess(listId);
      }

      // Update progress for all staff (after listId is set)
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
    } catch (err) {
      alert("Failed to save training list or update staff progress.");
      console.error(err);
    }
  };

  return (
    <Form
      title={trainingList ? "Edit Training List" : "Create New Training List"}
      onSubmit={handleSubmit}
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
          Training List Title
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Staff Training"
          required
        />
      </div>
      <div>
        <Label>
          Training Items (separated by commas, newlines, or multiple spaces)
        </Label>
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
      >
        Save Training List
      </Button>
    </Form>
  );
};
