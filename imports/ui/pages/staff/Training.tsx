import React, { useEffect, useState } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { TrainingListsCollection } from "/imports/api/training/TrainingListsCollection";
import { TrainingProgressCollection } from "/imports/api/training/TrainingProgressCollection";
import { Meteor } from "meteor/meteor";
import { Button } from "../../components/interaction/Button";
import { Modal } from "../../components/Modal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { AddTrainingListForm } from "../../components/AddTrainingListForm";
import { TrainingTable } from "../../components/TrainingTable";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "incomplete", label: "Incomplete" },
];

export const TrainingPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Staff Management - Training");
  }, [setPageTitle]);

  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">(
    "all",
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirm, setConfirm] = useState<"cancel" | "delete" | null>(null);

  const [progressState, setProgressState] = useState<
    Record<string, Record<string, boolean>>
  >({});

  // Subscriptions
  const isLoadingLists = useSubscribe("trainingLists.all");
  const isLoadingProgress = useSubscribe("trainingProgress.all");
  useSubscribe("users.all");

  // Trackers
  const trainingList = useTracker(() => TrainingListsCollection.find().fetch());
  const trainingProgress = useTracker(() =>
    TrainingProgressCollection.find({}).fetch(),
  );
  const staff = useTracker(() => Meteor.users.find({}).fetch());

  const currentList = trainingList[0] || null;
  const items = currentList?.items || [];

  // Ensure all staff have progress entries in the DB
  useEffect(() => {
    if (!currentList || staff.length === 0) return;
    staff.forEach((user) => {
      Meteor.call(
        "trainingProgress.ensureForStaff",
        user._id,
        currentList._id,
        currentList.items,
      );
    });
  }, [currentList, staff]);

  // Initialise local checkbox state from DB
  useEffect(() => {
    if (!currentList || Object.keys(progressState).length > 0) return;
    const newState: Record<string, Record<string, boolean>> = {};
    staff.forEach((user) => {
      const progress = trainingProgress.find(
        (p) =>
          String(p.staffId) === String(user._id) &&
          String(p.trainingListId) === String(currentList._id),
      );
      newState[user._id] = progress?.completedItems || {};
    });
    // Only set if different from current state
    const changed = JSON.stringify(newState) !== JSON.stringify(progressState);
    if (changed) setProgressState(newState);
  }, [staff, trainingProgress, currentList]);

  const handleCheckboxChange = (staffId: string, itemId: string) => {
    setProgressState((prev) => {
      const userItems = prev[staffId] || {};

      // Merge current state with the DB to avoid losing 'false' items
      const progress = trainingProgress.find(
        (p) =>
          String(p.staffId) === staffId &&
          String(p.trainingListId) === String(currentList?._id),
      );

      const dbItems = progress?.completedItems || {};
      const updatedItems = {
        ...dbItems, // start with all current items from DB
        ...userItems, // merge any local state changes
        [itemId]: !userItems[itemId], // toggle the clicked item
      };

      // Update local state immediately
      const newState = { ...prev, [staffId]: updatedItems };

      // Send full object to server
      if (progress) {
        Meteor.call(
          "trainingProgress.update",
          progress._id,
          { completedItems: updatedItems },
          (err: any) => {
            if (err) console.error("Failed to update progress:", err);
          },
        );
      }

      return newState;
    });
  };

  const handleDelete = () => {
    if (currentList) {
      Meteor.call(
        "trainingLists.remove",
        currentList._id,
        (error: Meteor.Error | undefined) => {
          if (error) {
            alert("Error deleting training list: " + error.reason);
          } else {
            setProgressState({}); // Clear local state
          }
        },
      );
    }
  };

  // Map staff rows using progressState
  const staffRows = staff.map((user) => ({
    id: user._id,
    name:
      `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() ||
      user.username ||
      "Unknown",
    completedItems: progressState[user._id] || {},
  }));

  // Apply filter
  const filteredStaffRows = staffRows.filter((row) => {
    const userItems = progressState[row.id] || {};
    if (filter === "all") return true;
    if (filter === "completed")
      return items.every((item) => userItems[item.id]);
    if (filter === "incomplete")
      return items.some((item) => !userItems[item.id]);
    return true;
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-between items-center p-4 gap-2">
        {/* Filter */}
        <div className="flex gap-2 px-4 items-center">
          <label htmlFor="training-filter" className="font-medium text-red-900">
            Filter:
          </label>
          <select
            id="training-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="border rounded-lg px-2 py-1 text-red-900 bg-white focus:ring-2 focus:ring-pink-400"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex justify-start items-center">
          <span className="font-bold text-lg text-red-900">
            {currentList ? currentList.title : ""}
          </span>
        </div>
        {currentList && (
          <Button
            variant="negative"
            onClick={() => {
              setConfirm("delete");
              setShowConfirmation(true);
            }}
          >
            Delete Training List
          </Button>
        )}
        <Button variant="positive" onClick={() => setShowAddModal(true)}>
          {currentList ? "Edit Training List" : "Add Training List"}
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0">
        {isLoadingLists() || isLoadingProgress() ? (
          <p className="text-gray-400 p-4">Loading training lists...</p>
        ) : !currentList ? (
          <h2 className="flex-1 text-center font-bold text-xl text-red-900">
            No existing training list.
          </h2>
        ) : (
          <TrainingTable
            staffRows={filteredStaffRows}
            items={items}
            onCheckboxChange={handleCheckboxChange}
          />
        )}
      </div>

      {/* Add Training List Modal */}
      <Modal
        open={showAddModal}
        onClose={() => {
          setConfirm("cancel");
          setShowConfirmation(true);
        }}
      >
        <AddTrainingListForm
          key={formResetKey}
          onSuccess={() => {
            setShowAddModal(false);
            setConfirm(null);
            setShowConfirmation(false);
          }}
        />
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        open={showConfirmation}
        message={
          confirm === "cancel"
            ? "Are you sure you want to discard your changes?"
            : "Are you sure you want to delete the training list?"
        }
        onConfirm={() => {
          if (confirm === "cancel") {
            setShowAddModal(false);
            setFormResetKey((prev) => prev + 1);
            setConfirm(null);
          } else if (confirm === "delete") {
            handleDelete();
          }
          setShowConfirmation(false);
          setConfirm(null);
        }}
        onCancel={() => {
          setShowConfirmation(false);
          setConfirm(null);
        }}
      />
    </div>
  );
};
