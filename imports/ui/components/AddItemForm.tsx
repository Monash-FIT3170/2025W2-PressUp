import { Meteor } from "meteor/meteor";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";
import { FormEvent, useEffect, useState } from "react";
import {
  SuppliersCollection,
  StockItem,
  StockItemsCollection,
} from "/imports/api";
import { IdType } from "/imports/api/database";
import { Input, Label } from "./interaction/Input";
import { Button } from "./interaction/Button";
import { Select } from "./interaction/Select";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  item?: StockItem | null;
}

export const AddItemForm = ({ onSuccess, item }: Props) => {
  useSubscribe("suppliers");
  useSubscribe("stockItems.all");

  const suppliers = useTracker(
    () => SuppliersCollection.find({}, { sort: { name: 1 } }).fetch(),
    [],
  );

  const existingItemNames = useTracker(() => {
    const allItems = StockItemsCollection.find({}).fetch();
    const uniqueNames = [...new Set(allItems.map((item) => item.name))];
    return uniqueNames.sort();
  }, []);

  const [itemName, setItemName] = useState(item?.name ?? "");
  const [quantity, setQuantity] = useState<string>(
    item ? String(item.quantity) : "",
  );
  const [location, setLocation] = useState(item?.location ?? "");
  const [supplier, setSupplier] = useState<IdType | null>(
    item?.supplier ?? null,
  );
  const [selectedValue, setSelectedValue] = useState<string>(
    item?.supplier ? String(item.supplier) : "",
  );
  const [expiryDate, setExpiryDate] = useState<string>(
    item?.expiryDate ? item.expiryDate.toISOString().split("T")[0] : "",
  );

  useEffect(() => {
    setItemName(item?.name ?? "");
    setQuantity(item ? String(item.quantity) : "");
    setLocation(item?.location ?? "");
    setExpiryDate(
      item?.expiryDate ? item.expiryDate.toISOString().split("T")[0] : "",
    );

    const supplierId = item?.supplier ?? "";
    setSupplier(supplierId || null);
    setSelectedValue(supplierId);
  }, [item]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const parsedQuantity = parseInt(quantity, 10);
    if (
      !itemName ||
      !location ||
      !supplier ||
      isNaN(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      alert("Please fill in all fields correctly.");
      return;
    }

    const expiryDateObj = expiryDate ? new Date(expiryDate) : undefined;

    if (item && item._id) {
      // Editing existing item
      Meteor.call(
        "stockItems.update",
        item._id,
        {
          quantity: parsedQuantity,
          location,
          expiryDate: expiryDateObj,
        },
        (error: Meteor.Error | undefined) => {
          if (error) {
            alert("Error: " + error.reason);
          } else {
            onSuccess();
          }
        },
      );
    } else {
      Meteor.call(
        "stockItems.insert",
        {
          name: itemName,
          quantity: parsedQuantity,
          location,
          supplier,
          expiryDate: expiryDateObj,
        },
        (error: Meteor.Error | undefined) => {
          if (error) {
            alert("Error: " + error.reason);
          } else {
            setItemName("");
            setQuantity("");
            setLocation("");
            setSupplier(null);
            setExpiryDate("");
            onSuccess();
          }
        },
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center p-4 w-100 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
        <h3 className="text-xl font-semibold text-press-up-purple dark:text-white">
          {item ? "Edit Stock Item" : "New Stock Item"}
        </h3>
      </div>
      <div className="p-4 md:p-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label>Item Name</Label>
            <Input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Coffee"
              list="existing-names"
              required
            />
            <datalist id="existing-names">
              {existingItemNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              required
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Storage Room 1"
              required
            />
          </div>
          <div>
            <Label>Supplier</Label>
            <Select
              value={selectedValue}
              onChange={(e) => {
                setSelectedValue(e.target.value);
                if (e.target.value === "") {
                  setSupplier(null);
                } else {
                  const found = suppliers.find(
                    (s) => String(s._id) === e.target.value,
                  );
                  setSupplier(found && found._id ? found._id : null);
                }
              }}
              placeholder="--Select supplier--"
              required
            >
              {suppliers
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((supplier, i) => (
                  <option value={String(supplier._id)} key={i}>
                    {supplier.name}
                  </option>
                ))}
            </Select>
          </div>
          <div>
            <Label>Expiry Date (Optional)</Label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 p-4">
            <Button type="submit" variant="positive" width="full">
              {item ? "Save Item" : "Add Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
