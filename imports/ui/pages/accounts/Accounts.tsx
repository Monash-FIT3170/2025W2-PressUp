import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Modal } from "../../components/Modal";
// import { EditUserForm } from "../../components/EditUserForm"; // If you have an edit form
import { ConfirmModal } from "../../components/ConfirmModal";

// Replace with your actual User and Role types
interface User {
  _id: string;
  username: string;
  profile?: { name?: string };
  roles?: string[];
}

export const Accounts = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("User Management");
  }, [setPageTitle]);

  useSubscribe("users.all"); // You need to publish users on the server
  const users: User[] = useTracker(() => {
    return Meteor.users.find({}, { sort: { username: 1 } }).fetch();
  });

  const [editUser, setEditUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirm, setConfirm] = useState<"cancel" | null>(null);

  const handleEdit = (user: User) => {
    setEditUser(user);
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
    setFormResetKey((prev) => prev + 1);
  };

  const handleSuccess = () => handleModalClose();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-between items-center p-4 gap-2">
        <h2 className="text-xl font-bold text-red-900">Users</h2>
        {/* Add User button could go here */}
      </div>
      <div id="user-container" className="flex flex-1 flex-col overflow-auto">
        <div className="grid gap-y-2 text-nowrap text-center grid-cols-[minmax(0,2fr)_1fr_min-content] text-red-900">
          <div className="font-bold py-2 px-2">Name</div>
          <div className="font-bold py-2 px-2">Role</div>
          <div className="font-bold py-2 px-2">Actions</div>
          {users.map((user, i) => (
            <React.Fragment key={user._id}>
              <div className="truncate py-1 px-2 flex items-center justify-center">
                {user.profile?.name || user.username}
              </div>
              <div className="truncate py-1 px-2 flex items-center justify-center">
                {user.roles && user.roles.length > 0 ? user.roles.join(", ") : "None"}
              </div>
              <div className="py-1 px-2 flex gap-2 justify-center items-center">
                <button
                  onClick={() => handleEdit(user)}
                  className="bg-press-up-purple text-white py-1 px-3 rounded-lg text-sm font-medium transition-all hover:bg-press-up-blue focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-1"
                >
                  Edit
                </button>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
      <Modal
        open={open}
        onClose={() => {
          setConfirm("cancel");
          setShowConfirmation(true);
        }}
      >
        {/* <EditUserForm key={formResetKey} user={editUser} onSuccess={handleSuccess} /> */}
        <div className="p-4">Edit User Form goes here</div>
      </Modal>
      <ConfirmModal
        open={showConfirmation}
        message={
          confirm === "cancel"
            ? "Are you sure you want to discard your changes?"
            : ""
        }
        onConfirm={() => {
          if (confirm === "cancel") {
            handleModalClose();
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