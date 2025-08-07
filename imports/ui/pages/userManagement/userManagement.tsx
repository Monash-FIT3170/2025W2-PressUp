import { Meteor } from "meteor/meteor";
import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import {
  AppUsersCollection,
  AppUser,
} from "/imports/api";
import { UserTable } from "../../components/UserTable";
import { Modal } from "../../components/Modal";
import { AddUserForm } from "../../components/AddUserForm";
import { ConfirmModal } from "../../components/ConfirmModal";

export const UserManagementPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("User Management");
  }, [setPageTitle]);

  const [formResetKey, setFormResetKey] = useState(0);

  const isLoadingUsers = !useSubscribe("appUsers.all");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirm, setConfirm] = useState<"cancel" | "delete" | "remove" | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<AppUser[]>([]);

  const users: AppUser[] = useTracker(() => {
    return AppUsersCollection.find(
      {},
      { sort: { lastName: 1, firstName: 1 } },
    ).fetch();
  });

  // Modal state
  const [open, setOpen] = useState<boolean>(false);
  const [editUser, setEditUser] = useState<AppUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AppUser | null>(null);

  const handleEdit = (user: AppUser) => {
    setEditUser(user);
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
    setEditUser(null);
    setFormResetKey((prev) => prev + 1);
  };

  const handleSuccess = () => handleModalClose();

  const handleDeleteRequest = (user: AppUser) => {
    setConfirm("delete");
    setShowConfirmation(true);
    setDeleteUser(user);
  };

  const handleRemoveUsers = () => {
    if (selectedUsers.length === 0) {
      alert("Please select users to remove");
      return;
    }
    setConfirm("remove");
    setShowConfirmation(true);
  };

  const handleDelete = () => {
    if (confirm === "delete" && deleteUser) {
      Meteor.call(
        "appUsers.remove",
        deleteUser._id,
        (error: Meteor.Error | undefined) => {
          if (error) {
            alert("Error deleting user: " + error.reason);
          }
        },
      );
    } else if (confirm === "remove" && selectedUsers.length > 0) {
      const userIds = selectedUsers.map(user => user._id);
      Meteor.call(
        "appUsers.removeMultiple",
        userIds,
        (error: Meteor.Error | undefined) => {
          if (error) {
            alert("Error removing users: " + error.reason);
          } else {
            setSelectedUsers([]);
          }
        },
      );
    }
  };

  const handleExportUserList = () => {
    // Create CSV content
    const csvContent = [
      ["First Name", "Last Name", "Group", "Active"].join(","),
      ...users.map(user => [
        user.firstName,
        user.lastName,
        user.group,
        user.active ? "Yes" : "No"
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user-list-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getConfirmationMessage = () => {
    if (confirm === "cancel") {
      return "Are you sure you want to discard your changes?";
    } else if (confirm === "delete") {
      return "Are you sure you want to delete this user?";
    } else if (confirm === "remove") {
      return `Are you sure you want to remove ${selectedUsers.length} selected user(s)?`;
    }
    return "";
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-between items-center p-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditUser(null);
              setOpen(true);
            }}
            className="text-nowrap shadow-lg/20 ease-in-out transition-all duration-300 p-2 rounded-xl px-4 bg-purple-600 text-white cursor-pointer hover:bg-purple-700"
            style={{ backgroundColor: '#6f597b' }}
          >
            + Add New User
          </button>
          <button
            onClick={handleRemoveUsers}
            className="text-nowrap shadow-lg/20 ease-in-out transition-all duration-300 p-2 rounded-xl px-4 bg-red-600 text-white cursor-pointer hover:bg-red-700"
            style={{ backgroundColor: '#c97f97' }}>
            Delete User
          </button>
        </div>
        <div>
          <button
            onClick={handleExportUserList}
            className="text-nowrap shadow-lg/20 ease-in-out transition-all duration-300 p-2 rounded-xl px-4 text-white cursor-pointer hover:bg-purple-700"
            style={{ backgroundColor: '#6f597b' }}
          >
            Export User List
          </button>
        </div>
      </div>
      <div>
      <div className="px-4">
        <div className="flex items-center gap-2 mb-4">
          <span>Show</span>
          <select 
            className="border rounded px-2 py-1"
            defaultValue="10"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>entries</span>
        </div>
      </div>

      <div id="users" className="flex flex-1 flex-col overflow-auto px-4">
        {isLoadingUsers ? (
          <p className="text-gray-400 p-4">Loading users...</p>
        ) : (
          <UserTable
            users={users}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            selectedUsers={selectedUsers}
            onSelectionChange={setSelectedUsers}
          />
        )}
      </div>
      </div>

      <Modal
        open={open}
        onClose={() => {
          setConfirm("cancel");
          setShowConfirmation(true);
        }}
      >
        <AddUserForm
          key={formResetKey}
          onSuccess={handleSuccess}
          onCancel={handleModalClose}
          user={editUser}
        />
      </Modal>
      
      <ConfirmModal
        open={showConfirmation}
        message={getConfirmationMessage()}
        onConfirm={() => {
          if (confirm === "cancel") {
            handleModalClose();
          } else if (confirm === "delete" || confirm === "remove") {
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