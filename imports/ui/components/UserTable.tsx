import React from "react";
import { ExtendedUser } from "../../api/accounts/userTypes";
import { PressUpRole } from "/imports/api/accounts/roles";

interface UserTableProps {
  users: ExtendedUser[];
  onEdit: (user: ExtendedUser) => void;
  onDelete: (user: ExtendedUser) => void;
  selectedUsers: ExtendedUser[];
  onSelectionChange: (users: ExtendedUser[]) => void;
  currentUserId?: string; // To prevent users from modifying themselves
}

export const UserTable = ({
  users,
  onEdit,
  onDelete,
  selectedUsers,
  onSelectionChange,
  currentUserId,
}: UserTableProps) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select users that aren't the current user (they can't delete themselves)
      const selectableUsers = users.filter(
        (user) => user._id !== currentUserId
      );
      onSelectionChange(selectableUsers);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectUser = (user: ExtendedUser, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedUsers, user]);
    } else {
      onSelectionChange(selectedUsers.filter((u) => u._id !== user._id));
    }
  };

  const isSelected = (user: ExtendedUser) => {
    return selectedUsers.some((u) => u._id === user._id);
  };

  const selectableUsers = users.filter((user) => user._id !== currentUserId);
  const isAllSelected =
    selectableUsers.length > 0 &&
    selectedUsers.length === selectableUsers.length;
  const isIndeterminate =
    selectedUsers.length > 0 && selectedUsers.length < selectableUsers.length;

  const getUserRole = (user: ExtendedUser): string => {
    if (user.roles && user.roles.length > 0) {
      return user.roles[0]; // Return the first role
    }
    return "No Role";
  };

  const getUserName = (user: ExtendedUser): string => {
    if (user.profile?.firstName && user.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    }
    return user.emails?.[0]?.address || "Unknown User";
  };

  const getUserEmail = (user: ExtendedUser): string => {
    return user.emails?.[0]?.address || "No email";
  };

  const canModifyUser = (user: ExtendedUser): boolean => {
    return user._id !== currentUserId;
  };

  const getRoleDisplayStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case PressUpRole.ADMIN:
        return "bg-red-100 text-red-800";
      case PressUpRole.MANAGER:
        return "bg-purple-100 text-purple-800";
      case PressUpRole.CASUAL:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
        <thead>
          <tr style={{ backgroundColor: "#c97f97" }}>
            <th className="text-left p-3 font-medium text-white">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded"
                disabled={selectableUsers.length === 0}
              />
            </th>
            <th className="text-left p-3 font-medium text-white">Name</th>
            <th className="text-left p-3 font-medium text-white">Email</th>
            <th className="text-left p-3 font-medium text-white">Role</th>
            <th className="text-left p-3 font-medium text-white">Status</th>
            <th className="text-left p-3 font-medium text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={user._id}
              className={`border-b hover:bg-gray-50 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
              } ${user._id === currentUserId ? "bg-blue-50" : ""}`}
            >
              <td className="p-3">
                <input
                  type="checkbox"
                  checked={isSelected(user)}
                  onChange={(e) => handleSelectUser(user, e.target.checked)}
                  className="rounded"
                  disabled={!canModifyUser(user)}
                />
              </td>
              <td className="p-3">
                <div className="flex flex-col">
                  <span className="font-medium">{getUserName(user)}</span>
                  {user._id === currentUserId && (
                    <span className="text-xs text-blue-600 font-medium">
                      (You)
                    </span>
                  )}
                </div>
              </td>
              <td className="p-3 text-gray-600 text-sm">
                {getUserEmail(user)}
              </td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleDisplayStyle(
                    getUserRole(user)
                  )}`}
                >
                  {getUserRole(user)}
                </span>
              </td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status?.online
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.status?.online ? "Online" : "Offline"}
                </span>
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-white px-3 py-1 rounded-full text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: "#c97f97" }}
                    disabled={!canModifyUser(user)}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="text-white px-3 py-1 rounded-full text-sm hover:opacity-80 transition-opacity disabled:opacity-50 bg-red-500"
                    disabled={!canModifyUser(user)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="text-center p-8 text-gray-500">No users found</div>
      )}
    </div>
  );
};
