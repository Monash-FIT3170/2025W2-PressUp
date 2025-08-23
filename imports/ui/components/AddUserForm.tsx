import { Meteor } from "meteor/meteor";
import React, { useState, useEffect } from "react";
import { ExtendedUser } from "/imports/api/accounts/userTypes";

interface AddUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  user?: ExtendedUser | null;
}

export const AddUserForm = ({ onSuccess, onCancel, user }: AddUserFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [group, setGroup] = useState<"Manager" | "Casual">("Casual");
  const [active, setActive] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user?.firstName || "");
      setLastName(user?.lastName || "");
      setGroup(user.group || "Casual");
      setActive(user.active ?? true);
      setUsername(user.username || "");
      setPassword(""); 
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!firstName.trim() || !lastName.trim() || !username.trim()) {
      alert("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (!user && !password.trim()) {
      alert("Password is required for new users");
      setLoading(false);
      return;
    }

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      group,
      active,
      username: username.trim(),
      ...(password && { password }),
    };

    const method = user ? "appUsers.update" : "appUsers.insert";
    const params = user ? [user._id, userData] : [userData];

    Meteor.call(method, ...params, (error: Meteor.Error | undefined) => {
      setLoading(false);
      if (error) {
        alert(`Error ${user ? "updating" : "adding"} user: ${error.reason}`);
      } else {
        onSuccess();
      }
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4" style={{ color: '#6f597b' }}>
        {user ? "Edit User" : "Add New User"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ borderColor: '#6f597b' }}
            required
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username *
          </label>
          <input
            type="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password {!user && "*"}
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder={user ? "Leave blank to keep current password" : ""}
            required={!user}
          />
        </div>

        <div>
          <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
            Group
          </label>
          <select
            id="group"
            value={group}
            onChange={(e) => setGroup(e.target.value as "Manager" | "Casual")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="Casual">Casual</option>
            <option value="Manager">Manager</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 px-4 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#6f597b' }}
          >
            {loading ? "Saving..." : user ? "Update User" : "Add User"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
