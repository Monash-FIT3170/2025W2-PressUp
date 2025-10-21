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
import { Form } from "../../components/interaction/form/Form";
import { Label } from "../../components/interaction/Input";
import { Select } from "../../components/interaction/Select";
import { Roles } from "meteor/alanning:roles";
import { RoleEnum } from "/imports/api/accounts/roles";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirm, setConfirm] = useState<"cancel" | "delete" | null>(null);

  const [editStaffId, setEditStaffId] = useState<string | null>(null);
  const [editCheckboxes, setEditCheckboxes] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [pendingSelectListId, setPendingSelectListId] = useState<string | null>(
    null,
  );

  // Subscriptions
  const isLoadingLists = useSubscribe("trainingLists.all");
  const isLoadingProgress = useSubscribe("trainingProgress.all");
  useSubscribe("users.all");

  // Trackers
  const trainingLists = useTracker(() =>
    TrainingListsCollection.find().fetch(),
  );
  const trainingProgress = useTracker(() =>
    TrainingProgressCollection.find({}).fetch(),
  );
  const staff = useTracker(() => Meteor.users.find({}).fetch());

  // Set initial selectedListId when trainingLists load
  useEffect(() => {
    if (trainingLists.length > 0 && !selectedListId) {
      setSelectedListId(trainingLists[0]._id);
    } else if (trainingLists.length === 0 && selectedListId) {
      setSelectedListId(null);
    }
  }, [trainingLists, selectedListId]);

  const currentList =
    trainingLists.find((list) => list._id === selectedListId) || null;
  const items = currentList?.items || [];

  // Ensure all staff have progress entries in the DB
  useEffect(() => {
    // Only run when currentList and its items are loaded
    if (
      !currentList ||
      !Array.isArray(currentList.items) ||
      currentList.items.length === 0 ||
      staff.length === 0
    ) {
      return;
    }
    staff.forEach((user) => {
      Meteor.call(
        "trainingProgress.ensureForStaff",
        user._id,
        currentList._id,
        currentList.items,
      );
    });
  }, [currentList, staff]);

  const handleDelete = () => {
    if (currentList) {
      Meteor.call(
        "trainingLists.remove",
        currentList._id,
        (error: Meteor.Error | undefined) => {
          if (error) {
            alert("Error deleting training list: " + error.reason);
          } else {
            // After deletion, set current list to the first in the collection (if any)
            const updatedLists = TrainingListsCollection.find().fetch();
            if (updatedLists.length > 0) {
              setSelectedListId(updatedLists[0]._id);
            } else {
              setSelectedListId(null);
            }
          }
        },
      );
    }
  };

  // Open edit modal and prefill checkboxes
  const handleEditStaff = (staffId: string) => {
    setEditStaffId(staffId);
    const progress = trainingProgress.find(
      (p) =>
        String(p.staffId) === staffId &&
        String(p.trainingListId) === String(currentList?._id),
    );
    // Prefill with all items, defaulting to false
    const prefill: Record<string, boolean> = {};
    items.forEach((item) => {
      prefill[item.id] = progress?.completedItems?.[item.id] ?? false;
    });
    setEditCheckboxes(prefill);
  };

  // Handle checkbox change in edit modal
  const handleEditCheckboxChange = (itemId: string) => {
    setEditCheckboxes((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Save changes from edit modal
  const handleEditSave = () => {
    if (!editStaffId || !currentList) return;
    // Find progress entry for staff
    const progress = trainingProgress.find(
      (p) =>
        String(p.staffId) === editStaffId &&
        String(p.trainingListId) === String(currentList._id),
    );
    if (progress) {
      Meteor.call(
        "trainingProgress.update",
        progress._id,
        { completedItems: editCheckboxes },
        (err: Meteor.Error | undefined) => {
          if (err) {
            alert("Failed to update training progress");
          } else {
            setEditStaffId(null);
          }
        },
      );
    }
  };

  // Map staff rows using DB state
  const staffRows = staff.map((user) => {
    const progress = trainingProgress.find(
      (p) =>
        String(p.staffId) === String(user._id) &&
        String(p.trainingListId) === String(currentList?._id),
    );
    return {
      id: user._id,
      name:
        `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() ||
        user.username ||
        "Unknown",
      completedItems: progress?.completedItems || {},
    };
  });

  // Apply filter
  const filteredStaffRows = staffRows.filter((row) => {
    const userItems = row.completedItems;
    if (filter === "all") return true;
    if (filter === "completed")
      return items.every((item) => userItems[item.id]);
    if (filter === "incomplete")
      return items.some((item) => !userItems[item.id]);
    return true;
  });

  // Effect to select the new list when it appears
  useEffect(() => {
    if (
      pendingSelectListId &&
      trainingLists.some((list) => list._id === pendingSelectListId)
    ) {
      setSelectedListId(pendingSelectListId);
      setPendingSelectListId(null);
    }
  }, [pendingSelectListId, trainingLists]);

  // Check if current user is admin or manager
  const isAdminOrManager = Roles.userIsInRole(Meteor.userId(), [
    RoleEnum.ADMIN,
    RoleEnum.MANAGER,
  ]);

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="w-full max-w-[70rem]">
        {/* Header */}
        <div className="flex flex-wrap items-end p-4 gap-2">
          {/* Filter */}
          <div className="flex flex-col gap-1 px-4 min-w-[120px]">
            <Label>Filter:</Label>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
          {/* Training List Select */}
          <div className="flex flex-col gap-1 min-w-[200px]">
            <Label>Training List:</Label>
            <Select
              value={selectedListId ?? ""}
              onChange={(e) => setSelectedListId(e.target.value)}
              disabled={trainingLists.length === 0}
            >
              {trainingLists.map((list) => (
                <option key={list._id} value={list._id}>
                  {list.title}
                </option>
              ))}
            </Select>
          </div>
          {/* Button group aligned right */}
          <div className="flex-1 flex justify-end items-end gap-2 min-w-[320px]">
            {isAdminOrManager && currentList ? (
              <>
                <Button
                  variant="negative"
                  onClick={() => {
                    setConfirm("delete");
                    setShowConfirmation(true);
                  }}
                >
                  Delete Training List
                </Button>
                <Button
                  variant="positive"
                  onClick={() => setShowEditModal(true)}
                >
                  Edit Training List
                </Button>
              </>
            ) : (
              <>
                <span className="w-[140px]"></span>
                <span className="w-[140px]"></span>
              </>
            )}
            {isAdminOrManager && (
              <Button variant="positive" onClick={() => setShowAddModal(true)}>
                Add Training List
              </Button>
            )}
          </div>
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
              onEditStaff={isAdminOrManager ? handleEditStaff : undefined}
            />
          )}
        </div>
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
          onSuccess={(newListId) => {
            setShowAddModal(false);
            setFormResetKey((prev) => prev + 1);
            setConfirm(null);
            setShowConfirmation(false);
            if (newListId) setPendingSelectListId(newListId);
          }}
        />
      </Modal>

      {/* Edit Training List Modal */}
      <Modal
        open={showEditModal}
        onClose={() => {
          setConfirm("cancel");
          setShowConfirmation(true);
        }}
      >
        <AddTrainingListForm
          trainingList={currentList}
          key={formResetKey}
          onSuccess={() => {
            setShowEditModal(false);
            setFormResetKey((prev) => prev + 1);
            setConfirm(null);
            setShowConfirmation(false);
          }}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editStaffId} onClose={() => setEditStaffId(null)}>
        <Form
          title="Edit Training Progress"
          onSubmit={(e) => {
            e.preventDefault();
            handleEditSave();
          }}
        >
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <Label key={item.id}>
                <input
                  type="checkbox"
                  checked={!!editCheckboxes[item.id]}
                  onChange={() => handleEditCheckboxChange(item.id)}
                />
                <span className="mx-2">{item.name}</span>
              </Label>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit" variant="positive" width="full">
              Save
            </Button>
            <Button
              type="button"
              variant="negative"
              width="full"
              onClick={() => setEditStaffId(null)}
            >
              Cancel
            </Button>
          </div>
        </Form>
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
