import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Modal } from "../../components/Modal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Roles } from "meteor/alanning:roles";
import { PressUpRole } from "/imports/api/accounts/roles";

export const Accounts = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("User Management");
  }, [setPageTitle]);

  useSubscribe("users.all");
  const users = useTracker(() => {
    return Meteor.users.find({}, { sort: { username: 1 } }).fetch();
  });

  const rolesLoading = useSubscribe("roleAssignments.all")();
  const userRoles = useTracker(() => {
    const map: Record<string, string[]> = {};

    Meteor.roleAssignment.find().forEach((a) => {
      const userId = a.user?._id;
      const roleId = a.role?._id;

      if (!userId || !roleId) return;

      if (!map[userId]) {
        map[userId] = [];
      }
      if (!map[userId].includes(roleId)) {
        map[userId].push(roleId);
      }
    });

    return map;
  }, [rolesLoading]);

  const [editUser, setEditUser] = useState<Meteor.User | null>(null);
  const [open, setOpen] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirm, setConfirm] = useState<"cancel" | null>(null);
  const [editRole, setEditRole] = useState<string>("");

  const handleEdit = (user: Meteor.User) => {
    setEditUser(user);
    const userRoles = Roles.getRolesForUser(user._id);
    console.log(
      `Editing user: ${user.username}, Roles: ${userRoles.join(", ")}`,
    );
    setEditRole(userRoles[0] || "");
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
    setFormResetKey((prev) => prev + 1);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditRole(e.target.value);
  };

  const handleRoleSave = async () => {
    if (editUser && editRole) {
      await Meteor.callAsync("accounts.setRole", editUser._id, editRole);
      handleSuccess();
    }
  };

  const handleSuccess = () => handleModalClose();

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
                Username
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
                    {user.username}
                    <div className="absolute bg-amber-700/25 w-px h-3/4 end-0 bottom-1/8" />
                  </div>
                  <div className="truncate relative py-1 px-2">
                    {/* {Roles.getRolesForUser(user._id).join(", ") || "None"} */}
                    {userRoles[user._id]?.join(", ") || "Loading..."}
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
        {editUser && (
          <div className="p-4 flex flex-col gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
                Name
              </label>
              <div>{editUser.username}</div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
                Role
              </label>
              <select
                value={editRole}
                onChange={handleRoleChange}
                className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg block w-full p-2.5"
              >
                {Object.values(PressUpRole).map((role) => (
                  <option value={role} key={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleRoleSave}
                className="bg-press-up-positive-button text-white py-1 px-3 rounded-lg text-sm font-medium"
              >
                Save
              </button>
              <button
                onClick={handleModalClose}
                className="bg-gray-300 text-red-900 py-1 px-3 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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
