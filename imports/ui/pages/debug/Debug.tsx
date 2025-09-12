import { useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { Button } from "../../components/interaction/Button";
import { CoffeeIcon } from "../../components/symbols/navigation/Coffee";
import {
  StockIcon,
  SupplierIcon,
} from "../../components/symbols/navigation/Inventory";
import { BookIcon, TableIcon } from "../../components/symbols/navigation/POS";
import { MessageSquare, Calendar, PenTool } from "lucide-react";

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
          <h3 className="font-semibold flex items-center gap-2">
            <PenTool size={20} />
            Deductions
          </h3>
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

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold flex items-center gap-2">
            <StockIcon fill="currentColor" />
            Stock Items
          </h3>
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
          <h3 className="font-semibold flex items-center gap-2">
            <SupplierIcon fill="currentColor" />
            Suppliers
          </h3>
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
          <h3 className="font-semibold flex items-center gap-2">
            <SupplierIcon fill="currentColor" />
            Purchase Orders
          </h3>
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
          <h3 className="font-semibold flex items-center gap-2">
            <BookIcon fill="currentColor" />
            Orders
          </h3>
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
          <h3 className="font-semibold flex items-center gap-2">
            <TableIcon fill="currentColor" />
            Tables
          </h3>
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
          <h3 className="font-semibold flex items-center gap-2">
            <CoffeeIcon fill="currentColor" />
            Menu Items
          </h3>
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
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar size={20} />
            Shifts
          </h3>
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
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare size={20} />
            Posts
          </h3>
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
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare size={20} />
            Comments
          </h3>
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
      </div>
    </div>
  );
};
