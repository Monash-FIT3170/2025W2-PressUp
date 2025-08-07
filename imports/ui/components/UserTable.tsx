import React from "react";
import { AppUser } from "/imports/api";

interface UserTableProps {
  users: AppUser[];
  onEdit: (user: AppUser) => void;
  onDelete: (user: AppUser) => void;
  selectedUsers: AppUser[];
  onSelectionChange: (users: AppUser[]) => void;
}

export const UserTable = ({
  users,
  onEdit,
  onDelete,
  selectedUsers,
  onSelectionChange,
}: UserTableProps) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(users);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectUser = (user: AppUser, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedUsers, user]);
    } else {
      onSelectionChange(selectedUsers.filter(u => u._id !== user._id));
    }
  };

  const isSelected = (user: AppUser) => {
    return selectedUsers.some(u => u._id === user._id);
  };

  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;
  const isIndeterminate = selectedUsers.length > 0 && selectedUsers.length < users.length;

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
        <thead>
          <tr style={{ backgroundColor: '#c97f97' }}>
            <th className="text-left p-3 font-medium text-white">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={input => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded"
              />
            </th>
            <th className="text-left p-3 font-medium text-white">Name</th>
            <th className="text-left p-3 font-medium text-white">Role</th>
            <th className="text-left p-3 font-medium text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={user._id}
              className={`border-b hover:bg-gray-50 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
              }`}
            >
              <td className="p-3">
                <input
                  type="checkbox"
                  checked={isSelected(user)}
                  onChange={(e) => handleSelectUser(user, e.target.checked)}
                  className="rounded"
                />
              </td>
              <td className="p-3">{user.firstName} {user.lastName}</td>
              <td className="p-3">
                <span className="text-gray-700">
                  {user.group}
                </span>
              </td>
              <td className="p-3">
                <button
                  onClick={() => onEdit(user)}
                  className="text-white px-4 py-2 rounded-full text-sm hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: '#c97f97' }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          No users found
        </div>
      )}
    </div>
  );
};