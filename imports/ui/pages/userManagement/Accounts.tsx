import React, { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import { RoleEnum, getHighestRole } from "/imports/api/accounts/roles";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { CreateUserData } from "../../../api/accounts/userTypes";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { EditPassword } from "../../components/EditPassword";
import { Accounts } from "meteor/accounts-base";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Input } from "../../components/interaction/Input";
import { Button } from "../../components/interaction/Button";

import { Table, TableColumn } from "../../components/Table";
import { SmallPill } from "../../components/SmallPill";
import { Roles } from "meteor/alanning:roles";

export const UserManagementPage = () => {
  const [selectedUsers, setSelectedUsers] = useState<Meteor.User[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Meteor.User | null>(null);

  const { users, currentUserId } = useTracker(() => {
    const usersHandle = Meteor.subscribe("users.all");
    const rolesHandle = Meteor.subscribe("users.roles");

    const users = Meteor.users.find({}, { sort: { createdAt: -1 } }).fetch();

    return {
      users: users.map((user) => ({
        ...user,
        roles: Roles.getRolesForUser(user._id),
      })),
      currentUser: Meteor.user(),
      currentUserId: Meteor.userId() || undefined,
      isLoading: !usersHandle.ready() || !rolesHandle.ready(),
    };
  }, []);

  const handleAddUser = (userData: CreateUserData) => {
    Meteor.call("users.create", userData, (error: Meteor.Error) => {
      if (error) {
        alert(`Error creating user: ${error.message}`);
      } else {
        setShowAddUserModal(false);
        alert("User created successfully!");
      }
    });
  };

  // Set title
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("User Management");
  }, [setPageTitle]);

  const handleEditUser = (user: Meteor.User) => {
    setEditingUser(user);
    setShowEditUserModal(true);
  };

  const handleUpdateUser = (
    userId: string,
    updates: Partial<Meteor.User & { role: string }>,
  ) => {
    // Update profile
    if (updates.profile) {
      Meteor.call(
        "users.updateProfile",
        userId,
        updates.profile,
        (error: Meteor.Error) => {
          if (error) {
            alert(`Error updating profile: ${error.message}`);
            return;
          }
        },
      );
    }

    // Update role
    if (updates.role) {
      Meteor.call(
        "users.updateRole",
        userId,
        updates.role,
        (error: Meteor.Error) => {
          if (error) {
            alert(`Error updating role: ${error.message}`);
            return;
          }
        },
      );
    }

    setShowEditUserModal(false);
    setEditingUser(null);
    alert("User updated successfully!");
  };

  const handleDeleteUser = (user: Meteor.User) => {
    if (
      confirm(
        `Are you sure you want to delete ${user.profile?.firstName} ${user.profile?.lastName}?`,
      )
    ) {
      Meteor.call("users.delete", user._id, (error: Meteor.Error) => {
        if (error) {
          alert(`Error deleting user: ${error.message}`);
        } else {
          alert("User deleted successfully!");
          setSelectedUsers((prev) => prev.filter((u) => u._id !== user._id));
        }
      });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedUsers.length === 0) return;

    if (
      confirm(
        `Are you sure you want to delete ${selectedUsers.length} selected user(s)?`,
      )
    ) {
      selectedUsers.forEach((user) => {
        Meteor.call("users.delete", user._id, (error: Meteor.Error) => {
          if (error) {
            console.error(`Error deleting user ${user._id}:`, error.message);
          }
        });
      });
      setSelectedUsers([]);
      alert(`Deleted ${selectedUsers.length} user(s)`);
    }
  };

  const exportToCSV = () => {
    if (users.length === 0) return;

    const csvContent = [
      ["Name", "Username", "Role", "Created At"].join(","),
      ...users.map((user) =>
        [
          `"${user.profile?.firstName || ""} ${user.profile?.lastName || ""}"`,
          `"${user.username || ""}"`,
          `"${user.roles?.[0] || "No Role"}"`,
          `"${
            user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "Unknown"
          }"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `users_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Define table columns
  const columns: TableColumn<Meteor.User & { roles: string[] }>[] = [
    {
      key: "select",
      header: (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedUsers([...users]);
              } else {
                setSelectedUsers([]);
              }
            }}
          />
          <span>Name</span>
        </div>
      ),
      gridCol: "2fr",
      align: "left",
      render: (user) => (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedUsers.some((u) => u._id === user._id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedUsers((prev) => [...prev, user]);
              } else {
                setSelectedUsers((prev) =>
                  prev.filter((u) => u._id !== user._id),
                );
              }
            }}
          />
          <span className="font-medium text-gray-800">
            {`${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() ||
              "Unknown User"}
          </span>
        </div>
      ),
    },
    {
      key: "username",
      header: "Username",
      gridCol: "1fr",
      align: "left",
      render: (user) => <span>{user.username || "No username"}</span>,
    },
    {
      key: "role",
      header: "Role",
      gridCol: "min-content",
      render: (user) => {
        if (!user.roles || user.roles.length === 0) {
          return <span className="text-gray-500 italic">No Role</span>;
        }

        const highestRole = getHighestRole(user.roles);
        if (!highestRole) {
          return <span className="text-gray-500 italic">No Role</span>;
        }

        return <SmallPill>{highestRole}</SmallPill>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      gridCol: "min-content",
      render: (user) => (
        <div className="flex gap-2">
          <Button variant="positive" onClick={() => handleEditUser(user)}>
            Edit
          </Button>
          {user._id !== currentUserId && (
            <Button variant="negative" onClick={() => handleDeleteUser(user)}>
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Action buttons */}
      <div className="flex justify-between items-center p-4 gap-2">
        <div></div>
        <div className="flex gap-2">
          <Button variant="positive" onClick={() => setShowAddUserModal(true)}>
            Add New User
          </Button>
          {selectedUsers.length > 0 && (
            <Button variant="negative" onClick={handleDeleteSelected}>
              Remove Users ({selectedUsers.length})
            </Button>
          )}
          <Button variant="positive" onClick={exportToCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      <Table columns={columns} data={users} emptyMessage="No users found" />

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onSubmit={handleAddUser}
        />
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => {
            setShowEditUserModal(false);
            setEditingUser(null);
          }}
          onSubmit={handleUpdateUser}
        />
      )}
    </div>
  );
};

// Add User Modal Component
const AddUserModal = ({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: CreateUserData) => void;
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    role: RoleEnum.CASUAL as string,
    payRate: 0,
  });
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const currentUserRole = Roles.getRolesForUser(Meteor.userId());
  const canEditPayRate =
    currentUserRole.includes(RoleEnum.ADMIN) ||
    currentUserRole.includes(RoleEnum.MANAGER);

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-lg w-96 shadow-2xl">
        <h2 className="text-xl font-bold mb-4" style={{ color: "#1e032e" }}>
          Add New User
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />
          <Input
            type="username"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />{" "}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-6 top-6 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={RoleEnum.CASUAL}>Casual</option>
            <option value={RoleEnum.MANAGER}>Manager</option>
            <option value={RoleEnum.ADMIN}>Admin</option>
          </select>
          {canEditPayRate && (
            <Input
              type="number"
              placeholder="Pay Rate"
              value={formData.payRate ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  payRate: value === "" ? 0 : parseFloat(value),
                });
              }}
              required
            />
          )}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="negative"
              width="full"
            >
              Cancel
            </Button>
            <Button type="submit" variant="positive" width="full">
              Add User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal = ({
  user,
  onClose,
  onSubmit,
}: {
  user: Meteor.User;
  onClose: () => void;
  onSubmit: (
    userId: string,
    updates: Partial<Meteor.User & { role: string }>,
  ) => void;
}) => {
  useSubscribe("user.roles");

  const [formData, setFormData] = useState({
    firstName: user.profile?.firstName || "",
    lastName: user.profile?.lastName || "",
    role: Roles.getRolesForUser(user._id)[0] || RoleEnum.CASUAL,
    payRate: (user as any).payRate ?? undefined,
    oldPassword: "",
    password: "",
  });

  const currentUserRole = Roles.getRolesForUser(Meteor.userId());
  const canEditPayRate =
    currentUserRole.includes(RoleEnum.ADMIN) ||
    currentUserRole.includes(RoleEnum.MANAGER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Update user profile + role
    onSubmit(user._id, {
      profile: {
        firstName: formData.firstName,
        lastName: formData.lastName,
      },
      role: formData.role,
      payRate: formData.payRate,
    } as any);

    // Only update password if user entered one
    if (formData.password && formData.password.trim() !== "") {
      const isSelf = user._id === Meteor.userId();

      if (isSelf) {
        // User changing their own password
        Accounts.changePassword(
          formData.oldPassword,
          formData.password,
          (err) => {
            // callback
            if (err) alert(`Failed to update password: ${err}`);
            else console.log("Password updated successfully");
          },
        );
      } else {
        Meteor.call(
          "users.updatePassword", // server method
          user._id, // userId
          formData.password, // newPassword
          (err: Meteor.Error) => {
            // callback
            if (err) alert(`Failed to update password: ${err}`);
            else console.log("Password updated successfully");
          },
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-lg w-96 shadow-2xl">
        <h2 className="text-xl font-bold mb-4" style={{ color: "#1e032e" }}>
          Edit User
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            required
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            required
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={RoleEnum.CASUAL}>Casual</option>
            <option value={RoleEnum.MANAGER}>Manager</option>
            <option value={RoleEnum.ADMIN}>Admin</option>
          </select>
          {canEditPayRate && (
            <Input
              type="number"
              placeholder="Pay Rate"
              value={formData.payRate ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  payRate: value === "" ? undefined : parseFloat(value),
                });
              }}
            />
          )}
          <EditPassword
            user={user}
            oldPassword={formData.oldPassword}
            password={formData.password}
            setPassword={setFormData}
          ></EditPassword>
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="negative"
              width="full"
            >
              Cancel
            </Button>
            <Button type="submit" variant="positive" width="full">
              Update User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
