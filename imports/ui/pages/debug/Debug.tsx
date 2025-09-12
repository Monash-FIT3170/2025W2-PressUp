import { useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { Button } from "../../components/interaction/Button";

export const DebugPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Debug");
  }, [setPageTitle]);

  return (
    <div className="flex flex-col gap-4 w-full overflow-y-scroll p-4">
      <div className="flex flex-col gap-2">
        <h2 className="font-bold text-lg">All Collections</h2>
        <div className="flex gap-2">
          <Button onClick={() => Meteor.call("debug.mockAll")}>
            Add All Mock Data
          </Button>
          <Button
            variant="negative"
            onClick={() => Meteor.call("debug.dropAll")}
          >
            Drop All Collections
          </Button>
        </div>
      </div>

      <hr className="border-gray-300" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Menu Items</h3>
          <div className="flex gap-2">
            <Button onClick={() => Meteor.call("debug.mockMenuItems")}>
              Add Mock Menu Items
            </Button>
            <Button
              variant="negative"
              onClick={() => Meteor.call("debug.dropMenuItems")}
            >
              Drop Menu Items
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Stock Items</h3>
          <div className="flex gap-2">
            <Button onClick={() => Meteor.call("debug.mockStockItems")}>
              Add Mock Stock Items
            </Button>
            <Button
              variant="negative"
              onClick={() => Meteor.call("debug.dropStockItems")}
            >
              Drop Stock Items
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Suppliers</h3>
          <div className="flex gap-2">
            <Button onClick={() => Meteor.call("debug.mockSuppliers")}>
              Add Mock Suppliers
            </Button>
            <Button
              variant="negative"
              onClick={() => Meteor.call("debug.dropSuppliers")}
            >
              Drop Suppliers
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Purchase Orders</h3>
          <div className="flex gap-2">
            <Button onClick={() => Meteor.call("debug.mockPurchaseOrders")}>
              Add Mock Purchase Orders
            </Button>
            <Button
              variant="negative"
              onClick={() => Meteor.call("debug.dropPurchaseOrders")}
            >
              Drop Purchase Orders
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Tables</h3>
          <div className="flex gap-2">
            <Button onClick={() => Meteor.call("debug.mockTables")}>
              Add Mock Tables
            </Button>
            <Button
              variant="negative"
              onClick={() => Meteor.call("debug.dropTables")}
            >
              Drop Tables
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Orders</h3>
          <div className="flex gap-2">
            <Button onClick={() => Meteor.call("debug.mockOrders")}>
              Add Mock Orders
            </Button>
            <Button
              variant="negative"
              onClick={() => Meteor.call("debug.dropOrders")}
            >
              Drop Orders
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Posts</h3>
          <div className="flex gap-2">
            <Button onClick={() => Meteor.call("debug.mockPosts")}>
              Add Mock Posts
            </Button>
            <Button
              variant="negative"
              onClick={() => Meteor.call("debug.dropPosts")}
            >
              Drop Posts
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Comments</h3>
          <div className="flex gap-2">
            <Button onClick={() => Meteor.call("debug.mockComments")}>
              Add Mock Comments
            </Button>
            <Button
              variant="negative"
              onClick={() => Meteor.call("debug.dropComments")}
            >
              Drop Comments
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Shifts</h3>
          <div className="flex gap-2">
            <Button onClick={() => Meteor.call("debug.mockShifts")}>
              Add Mock Shifts
            </Button>
            <Button
              variant="negative"
              onClick={() => Meteor.call("debug.dropShifts")}
            >
              Drop Shifts
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Deductions</h3>
          <div className="flex gap-2">
            <Button onClick={() => Meteor.call("debug.mockDeductions")}>
              Add Mock Deductions
            </Button>
            <Button
              variant="negative"
              onClick={() => Meteor.call("debug.dropDeductions")}
            >
              Drop Deductions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
