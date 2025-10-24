import { FormEvent, useState } from "react";
import { Meteor } from "meteor/meteor";
import { Button } from "./interaction/Button";

export const AddSupplierForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [supplierName, setSupplierName] = useState("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  // Function to validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (
      !supplierName ||
      !email ||
      !validateEmail(email) ||
      !phone ||
      !website ||
      !address
    ) {
      alert("Please fill in all fields correctly.");
      return;
    }

    Meteor.call(
      "suppliers.insert",
      {
        name: supplierName,
        email: email,
        phone: phone,
        website: website,
        address: address,
      },
      (error: Meteor.Error | undefined) => {
        if (error) {
          alert("Error: " + error.reason);
        } else {
          setSupplierName("");
          setEmail("");
          setPhone("");
          setWebsite("");
          setAddress("");
          onSuccess();
        }
      },
    );
  };

  return (
    <div>
      <div className="flex items-center justify-center p-4 w-100 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
        <h3 className="text-xl font-semibold text-press-up-purple dark:text-white">
          New Supplier
        </h3>
      </div>
      <div className="p-4 md:p-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
              Supplier Name
            </label>
            <input
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
              placeholder="Press Up"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
              Supplier Email
            </label>
            <input
              type="string"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="fit3170@monash.edu"
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
              Supplier Phone Number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0123456789"
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
              Supplier Website
            </label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="www.pressup.com"
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
              Supplier Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="39 Innovation Walk Clayton VIC 3168"
              className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 p-4">
            <Button
              variant="positive"
              className="ease-in-out transition-all duration-300 shadow-lg/20 cursor-pointer ml-4 text-white bg-press-up-purple hover:bg-press-up-purple focus:drop-shadow-none focus:ring-2 focus:outline-none focus:ring-press-up-purple font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-rose-300 dark:hover:bg-press-up-purple dark:focus:ring-press-up-purple"
            >
              Add Supplier
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
