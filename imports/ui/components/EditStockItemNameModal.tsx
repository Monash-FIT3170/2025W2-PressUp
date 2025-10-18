import { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";
import { StockItemWithSupplier } from "../pages/inventory/types";
import { UpdateStockItemInput } from "/imports/api/stockItems/types";
import { SuppliersCollection } from "/imports/api";
import { Input, Label } from "./interaction/Input";
import { Button } from "./interaction/Button";
import { Select } from "./interaction/Select";
import { Form } from "./interaction/form/Form";

interface EditStockItemNameModalProps {
  stockItem: StockItemWithSupplier;
  onSuccess: () => void;
}

export const EditStockItemNameModal = ({
  stockItem,
  onSuccess,
}: EditStockItemNameModalProps) => {
  useSubscribe("suppliers");
  const suppliers = useTracker(
    () => SuppliersCollection.find({}, { sort: { name: 1 } }).fetch(),
    [],
  );

  const [name, setName] = useState(stockItem.name);
  const [supplier, setSupplier] = useState(stockItem.supplier?._id || "");

  useEffect(() => {
    setName(stockItem.name);
    setSupplier(stockItem.supplier?._id || "");
  }, [stockItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Item name is required.");
      return;
    }

    const updates: UpdateStockItemInput = {
      name: name.trim(),
      supplier: supplier || null,
    };

    Meteor.call(
      "stockItems.updateStockItem",
      stockItem._id,
      updates,
      (error: Meteor.Error | undefined) => {
        if (error) {
          alert("Error: " + error.reason);
        } else {
          onSuccess();
        }
      },
    );
  };

  return (
    <Form title="Edit Stock Item" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div>
          <Label>Item Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Coffee"
            required
          />
        </div>

        <div>
          <Label>Supplier</Label>
          <Select
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="--Select supplier--"
          >
            <option value="">No supplier</option>
            {suppliers
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((supplier) => (
                <option value={String(supplier._id)} key={supplier._id}>
                  {supplier.name}
                </option>
              ))}
          </Select>
        </div>

        <div className="pt-4">
          <Button type="submit" variant="positive" width="full">
            Save Changes
          </Button>
        </div>
      </div>
    </Form>
  );
};
