import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { FormEvent, useState, KeyboardEvent } from "react";
import { Meteor } from "meteor/meteor";
import { Supplier, SuppliersCollection } from "/imports/api/";
import { Mongo } from "meteor/mongo";
import {X} from 'lucide-react'


export const AddSupplierForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [supplierName, setSupplierName] = useState("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [goods, setGoods] =  useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');

  // Function to add a new good, when pressing enter, add the good. 
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      setGoods([...goods, inputValue.trim()]);
      setInputValue('');
    }
  };

  // Function to remove a good
  const removeGood = (indexToRemove: number) => {
    setGoods(goods.filter((_, index) => index !== indexToRemove));
  };

  // Function to validate email
  const validateEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};



  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    //const parsedQuantity = parseInt(quantity, 10);
    if (
      !supplierName ||
      //!description ||
      //!pastOrderQty ||
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
        goods: goods
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
          setGoods([]);
          setInputValue("");
          onSuccess();
        }
      },
    );
  };

  return (
    <div>
      <div className="flex items-center justify-center p-4 w-100 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
        <h3 className="text-xl font-semibold text-rose-400 dark:text-white">
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
          <div>
          <label className="block mb-2 text-sm font-medium text-red-900 dark:text-white">
            Supplier Goods
        </label>
        
        <div className="flex flex-wrap gap-2 mb-2">
            {goods.map((good, index) => (
            <span 
                key={index} 
                className="bg-red-400 text-white px-3 py-1 rounded-md flex items-center"
            >
                {good}
                <button 
                onClick={() => removeGood(index)} 
                className="ml-2 focus:outline-none"
                aria-label={`Remove ${good}`}
                >
                <X size={16} />
                </button>
            </span>
            ))}
        </div>
        
        <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type and press Enter to add"
            className="bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white"
            
        />
        </div>
        
          <div className="grid grid-cols-1 p-4">
            <button
              type="submit"
              className="ease-in-out transition-all duration-300 shadow-lg/20 cursor-pointer ml-4 text-white bg-rose-500 hover:bg-rose-500 focus:drop-shadow-none focus:ring-2 focus:outline-none focus:ring-rose-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-rose-300 dark:hover:bg-rose-400 dark:focus:ring-rose-400"
            >
              Add Supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
