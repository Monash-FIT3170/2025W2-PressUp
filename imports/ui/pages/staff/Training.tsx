import React, { useEffect, useState } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { TrainingListsCollection } from "/imports/api/training/TrainingListsCollection";
import { TrainingProgressCollection } from "/imports/api/training/TrainingProgressCollection";
import { Meteor } from "meteor/meteor";
import { Button } from "../../components/interaction/Button";
import { SearchBar } from "../../components/SearchBar";

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

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">(
    "all",
  );
  const [showAddModal, setShowAddModal] = useState(false);

  const isLoadingLists = useSubscribe("trainingLists.all");
  const isLoadingProgress = useSubscribe("trainingProgress.all");

  // Fetch training lists
  const trainingLists = useTracker(() =>
    TrainingListsCollection.find(
      searchTerm ? { title: { $regex: searchTerm, $options: "i" } } : {},
      { sort: { title: 1 } },
    ).fetch(),
  );

  // Fetch staff progress
  const trainingProgress = useTracker(() =>
    TrainingProgressCollection.find({}).fetch(),
  );

  // Fetch all staff users
  const staff = useTracker(() => Meteor.users.find({}).fetch());

  // Prepare table data for the first training list (can be extended for multiple lists)
  const currentList = trainingLists[0];
  const items = currentList?.items || [];

  // Prepare staff rows
  const staffRows = staff.map((user) => {
    const progress = trainingProgress.find(
      (p) => p.staffId === user._id && p.trainingListId === currentList?._id,
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

  // Filter staff rows based on completion
  const filteredStaffRows = staffRows.filter((row) => {
    if (filter === "all") return true;
    if (filter === "completed")
      return items.every((item) => row.completedItems[item.id]);
    if (filter === "incomplete")
      return items.some((item) => !row.completedItems[item.id]);
    return true;
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-between items-center p-4 gap-2">
        <div className="relative w-full">
          <SearchBar onSearch={setSearchTerm} initialSearchTerm={searchTerm} />
        </div>
        <Button variant="positive" onClick={() => setShowAddModal(true)}>
          Add Training List
        </Button>
      </div>
      {/* Filter Dropdown */}
      <div className="flex gap-2 px-4 pb-2 items-center">
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
      <div className="flex-1 min-h-0">
        {isLoadingLists() || isLoadingProgress() ? (
          <p className="text-gray-400 p-4">Loading training lists...</p>
        ) : trainingLists.length === 0 ? (
          <h2 className="flex-1 text-center font-bold text-xl text-red-900">
            No existing training list.
          </h2>
        ) : (
          <div className="h-full flex flex-col">
            {/* Sticky header with training items */}
            <div className="flex shrink-0 sticky top-0 z-10">
              <div className="w-36 bg-press-up-light-purple py-1 px-2 border-y-2 border-press-up-light-purple rounded-l-lg flex items-center justify-center font-bold text-red-900">
                Staff
              </div>
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex-1 bg-press-up-light-purple py-1 px-2 border-y-2 border-press-up-light-purple font-bold text-red-900 text-center"
                  style={{
                    minWidth: "120px",
                    borderLeft: idx === 0 ? undefined : "1px solid #d1aaff",
                  }}
                >
                  {item.name}
                </div>
              ))}
            </div>
            {/* Staff rows */}
            <div className="flex-1 overflow-y-auto">
              {filteredStaffRows.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center h-12 border-b border-gray-200"
                >
                  <div className="w-36 px-4 py-1 font-medium text-red-900 relative flex items-center h-12">
                    <span className="truncate">{row.name}</span>
                    <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
                  </div>
                  {items.map((item, idx) => {
                    const completed = !!row.completedItems[item.id];
                    return (
                      <div
                        key={item.id}
                        className="flex-1 flex justify-center items-center"
                        style={{
                          minWidth: "120px",
                          borderLeft:
                            idx === 0 ? undefined : "1px solid #f3e8ff",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={completed}
                          disabled
                          className="cursor-pointer accent-green-600"
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
              {filteredStaffRows.length === 0 && (
                <div className="flex items-center justify-center h-24 text-red-900 font-bold text-lg">
                  No staff found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Add Training List Modal (to be implemented) */}
      {/* {showAddModal && <AddTrainingListModal onClose={() => setShowAddModal(false)} />} */}
    </div>
  );
};
