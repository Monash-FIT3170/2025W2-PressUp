import { useState } from "react";
import { PressUpRole } from "/imports/api/accounts/roles";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type UserState = {
  firstName: string;
  lastName: string;
  role: PressUpRole;
  password: string;
};

type EditPasswordProps = {
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<UserState>>;
};

export const EditPassword: React.FC<EditPasswordProps> = ({
  password,
  setPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
        Change User Password
      </label>
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
        className="absolute right-6 top-12 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
};
