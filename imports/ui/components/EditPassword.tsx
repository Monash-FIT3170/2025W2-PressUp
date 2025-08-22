import { useState } from "react";
import { PressUpRole } from "/imports/api/accounts/roles";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ExtendedUser } from "/imports/api/accounts/userTypes";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

type UserState = {
  firstName: string;
  lastName: string;
  role: PressUpRole;
  oldPassword: string;
  password: string;
};

type EditPasswordProps = {
  user: ExtendedUser;
  oldPassword: string;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<UserState>>;
};

export const EditPassword: React.FC<EditPasswordProps> = ({
  user,
  oldPassword,
  password,
  setPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);

  const currentUserId = useTracker(() => Meteor.userId(), []);
  const isSelf = user?._id === currentUserId;

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
        Change User Password
      </label>
      {isSelf && (
        <div className="my-4 relative">
          <input
            value={oldPassword}
            onChange={(e) =>
              setPassword((prev) => ({ ...prev, oldPassword: e.target.value }))
            }
            className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
            placeholder="Old Password"
            type={showOldPassword ? "text" : "password"}
          />
          <button
            type="button"
            onClick={() => setShowOldPassword((prev) => !prev)}
            className="absolute right-6 top-6 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showOldPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      )}
      <div className="relative">
        <input
          value={password}
          onChange={(e) =>
            setPassword((prev) => ({ ...prev, password: e.target.value }))
          }
          className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
          placeholder="User Password"
          type={showPassword ? "text" : "password"}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-6 top-6 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );
};
