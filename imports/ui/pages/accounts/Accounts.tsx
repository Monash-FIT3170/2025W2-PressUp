import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Modal } from "../../components/Modal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Roles } from "meteor/alanning:roles";

export const Accounts = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("User Management");
  }, [setPageTitle]);

  useSubscribe("users.all");
  useSubscribe("users.roles");
  const users = useTracker(() => {
    const users = Meteor.users.find({}, { sort: { username: 1 } }).fetch();
    return users.map((user) => ({
      ...user,
      roles: Roles.getRolesForUser(user._id),
    }));
  });

  const [, setEditUser] = useState<Meteor.User | null>(null);
  const [open, setOpen] = useState(false);
  const [, setFormResetKey] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirm, setConfirm] = useState<"cancel" | null>(null);

  const handleEdit = (user: Meteor.User) => {
    setEditUser(user);
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
    setFormResetKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="grid grid-cols-2">
        <div />
        <button
          onClick={() => {
            setEditUser(null);
            setOpen(true);
          }}
          className="text-nowrap justify-self-end shadow-lg/20 ease-in-out transition-all duration-300 p-1 m-4 rounded-xl px-3 bg-press-up-purple text-white cursor-pointer w-24 right-2 hover:bg-press-up-purple"
        >
          Add User
        </button>
      </div>
      <div id="accounts" className="flex flex-1 flex-col overflow-auto">
        {users.length === 0 ? (
          <h2 className="flex-1 text-center font-bold text-xl text-red-900">
            No users found
          </h2>
        ) : (
          <div id="grid-container" className="overflow-auto flex-1">
            <div className="grid gap-y-2 text-nowrap text-center grid-cols-[minmax(0,2fr)_1fr_min-content] text-red-900">
              <div className="bg-press-up-light-purple py-1 px-2 border-y-3 border-press-up-light-purple rounded-l-lg sticky top-0 z-1 text-left">
                Name
                <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
              </div>
              <div className="bg-press-up-light-purple py-1 px-2 border-y-3 border-press-up-light-purple sticky top-0 z-1">
                Role
                <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
              </div>
              <div className="bg-press-up-light-purple py-1 px-4 border-y-3 border-press-up-light-purple rounded-r-lg sticky top-0 z-1">
                Actions
              </div>
              {users.map((user) => (
                <React.Fragment key={user._id}>
                  <div className="text-left truncate relative py-1 px-2">
                    {user.profile?.firstName || user.username}
                    <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
                  </div>
                  <div className="truncate relative py-1 px-2">
                    {user.roles && user.roles.length > 0
                      ? user.roles.join(", ")
                      : "None"}
                    <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
                  </div>
                  <div className="relative truncate py-1 px-2 flex gap-2 justify-center items-center">
                    <button
                      onClick={() => handleEdit(user)}
                      className="bg-press-up-positive-button text-white py-1 px-3 rounded-lg text-sm font-medium transition-all hover:bg-press-up-blue focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-1"
                    >
                      Edit
                    </button>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
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
