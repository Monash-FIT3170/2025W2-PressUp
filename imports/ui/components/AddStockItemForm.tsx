import { Meteor } from "meteor/meteor";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";
import { FormEvent, useState } from "react";
import { SuppliersCollection, StockItemsCollection } from "/imports/api";

import { StockItemWithSupplier } from "../pages/inventory/types";
import { Input, Label } from "./interaction/Input";
import { Button } from "./interaction/Button";
import { Select } from "./interaction/Select";
import { Form } from "./interaction/form/Form";

interface AddStockItemFormProps {
  onSuccess: () => void;
  prefillData?: StockItemWithSupplier;
}

export const AddStockItemForm = ({
  onSuccess,
  prefillData,
}: AddStockItemFormProps) => {
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

  const [itemName, setItemName] = useState(prefillData?.name || "");
  const [quantity, setQuantity] = useState<string>("");
  const [location, setLocation] = useState("");
  const [supplier, setSupplier] = useState<string>(
    String(prefillData?.supplier?._id || ""),
  );
  const [expiry, setExpiry] = useState<string>("");

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

    Meteor.call(
      "stockItems.insert",
      {
        name: itemName,
        quantity: parsedQuantity,
        location,
        supplier: supplier || null,
        expiry: expiry ? new Date(expiry) : null,
      },
      (error: Meteor.Error | undefined) => {
        if (error) {
          alert("Error: " + error.reason);
        } else {
          setItemName("");
          setQuantity("");
          setLocation("");
          setSupplier("");
          setExpiry("");
          onSuccess();
        }
      },
    );
  };

  return (
    <Form title="New Stock Item" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
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
          <Label>Supplier</Label>
          <Select
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
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
          <Label>Expiry Date (Optional)</Label>
          <Input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
        </div>

        <div className="pt-4">
          <Button type="submit" variant="positive" width="full">
            Add Item
          </Button>
        </div>
      </div>
    </Form>
  );
};
