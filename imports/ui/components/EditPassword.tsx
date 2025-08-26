import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Input } from "./interaction/Input";

type UserState = {
  firstName: string;
  lastName: string;
  role: string;
  oldPassword: string;
  password: string;
};

type EditPasswordProps = {
  user: Meteor.User;
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
          <Input
            value={oldPassword}
            onChange={(e) =>
              setPassword((prev) => ({ ...prev, oldPassword: e.target.value }))
            }
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
        <Input
          value={password}
          onChange={(e) =>
            setPassword((prev) => ({ ...prev, password: e.target.value }))
          }
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
