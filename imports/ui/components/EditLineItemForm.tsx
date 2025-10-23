import { Meteor } from "meteor/meteor";
import { FormEvent, useState, useEffect } from "react";
import { UpdateLineItemInput } from "/imports/api/stockItems/types";
import { LineItemWithDetails } from "../pages/inventory/types";
import { Input, Label } from "./interaction/Input";
import { Button } from "./interaction/Button";
import { Form } from "./interaction/form/Form";

interface EditLineItemFormProps {
  item: LineItemWithDetails;
  onSuccess: () => void;
}

export const EditLineItemForm = ({
  item,
  onSuccess,
}: EditLineItemFormProps) => {
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [location, setLocation] = useState(item.location);
  const [expiry, setExpiry] = useState(
    item.expiry ? item.expiry.toISOString().split("T")[0] : "",
  );

  useEffect(() => {
    setQuantity(String(item.quantity));
    setLocation(item.location);
    setExpiry(item.expiry ? item.expiry.toISOString().split("T")[0] : "");
  }, [item]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const parsedQuantity = parseInt(quantity, 10);
    if (!location || isNaN(parsedQuantity) || parsedQuantity < 0) {
      alert("Please fill in all fields correctly.");
      return;
    }

    const updates: UpdateLineItemInput = {
      quantity: parsedQuantity,
      location,
      expiry: expiry ? new Date(expiry) : null,
    };

    Meteor.call(
      "stockItems.updateLineItem",
      item.stockItemId,
      item.id,
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
    <Form title="Edit Line Item" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div>
          <Label>Item Name</Label>
          <Input value={item.stockItemName} disabled />
        </div>

        <div>
          <Label>Supplier</Label>
          <Input value={item.supplier?.name || "No supplier"} disabled />
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
            Save Changes
          </Button>
        </div>
      </div>
    </Form>
  );
};
