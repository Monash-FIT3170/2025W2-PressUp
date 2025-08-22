import { PressUpRole } from "/imports/api/accounts/roles";

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
  return (
    <div>
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
        type="password"
      />
    </div>
  );
};
