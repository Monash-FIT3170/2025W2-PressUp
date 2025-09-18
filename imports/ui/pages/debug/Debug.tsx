import { useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { Button } from "../../components/interaction/Button";
import { CoffeeIcon } from "../../components/symbols/navigation/Coffee";
import {
  StockIcon,
  SupplierIcon,
} from "../../components/symbols/navigation/Inventory";
import { BookIcon, TableIcon } from "../../components/symbols/navigation/POS";
import { MessageSquare, Calendar, PenTool } from "lucide-react";
import { RoleEnum } from "/imports/api/accounts/roles";

export const DebugPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Debug");
  }, [setPageTitle]);

  const rolesLoaded = useSubscribe("users.roles")();
  const rolesGraphLoaded = useSubscribe("users.rolesGraph")();
  const isAdmin = useTracker(() => {
    return Roles.userIsInRole(Meteor.userId(), [RoleEnum.ADMIN]);
  }, [rolesLoaded, rolesGraphLoaded]);

  if (!isAdmin) {
    return <h1 className="text-4xl font-bold">Forbidden</h1>;
  }

  const handleMethodCall = (methodName: string, successMessage: string) => {
    Meteor.call(methodName, (error: any) => {
      if (error) {
        alert(`Failed: ${error.reason || error.message || "Unknown error"}`);
      } else {
        alert(`Success: ${successMessage}`);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full overflow-y-scroll p-4">
      <div className="flex flex-col gap-2">
        <h2 className="font-bold text-lg">All Collections</h2>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              handleMethodCall(
                "debug.mockAll",
                "All mock data added successfully",
              )
            }
          >
            Add All Mock Data
          </Button>
          <Button
            variant="negative"
            onClick={() =>
              handleMethodCall(
                "debug.dropAll",
                "All collections dropped successfully",
              )
            }
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
            <Button
              onClick={() =>
                handleMethodCall(
                  "debug.mockDeductions",
                  "Mock deductions added successfully",
                )
              }
            >
              Add Mock Deductions
            </Button>
            <Button
              variant="negative"
              onClick={() =>
                handleMethodCall(
                  "debug.dropDeductions",
                  "Deductions collection dropped successfully",
                )
              }
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
            <Button
              onClick={() =>
                handleMethodCall(
                  "debug.mockStockItems",
                  "Mock stock items added successfully",
                )
              }
            >
              Add Mock Stock Items
            </Button>
            <Button
              variant="negative"
              onClick={() =>
                handleMethodCall(
                  "debug.dropStockItems",
                  "Stock items collection dropped successfully",
                )
              }
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
            <Button
              onClick={() =>
                handleMethodCall(
                  "debug.mockSuppliers",
                  "Mock suppliers added successfully",
                )
              }
            >
              Add Mock Suppliers
            </Button>
            <Button
              variant="negative"
              onClick={() =>
                handleMethodCall(
                  "debug.dropSuppliers",
                  "Suppliers collection dropped successfully",
                )
              }
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
            <Button
              onClick={() =>
                handleMethodCall(
                  "debug.mockPurchaseOrders",
                  "Mock purchase orders added successfully",
                )
              }
            >
              Add Mock Purchase Orders
            </Button>
            <Button
              variant="negative"
              onClick={() =>
                handleMethodCall(
                  "debug.dropPurchaseOrders",
                  "Purchase orders collection dropped successfully",
                )
              }
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
            <Button
              onClick={() =>
                handleMethodCall(
                  "debug.mockOrders",
                  "Mock orders added successfully",
                )
              }
            >
              Add Mock Orders
            </Button>
            <Button
              variant="negative"
              onClick={() =>
                handleMethodCall(
                  "debug.dropOrders",
                  "Orders collection dropped successfully",
                )
              }
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
            <Button
              onClick={() =>
                handleMethodCall(
                  "debug.mockTables",
                  "Mock tables added successfully",
                )
              }
            >
              Add Mock Tables
            </Button>
            <Button
              variant="negative"
              onClick={() =>
                handleMethodCall(
                  "debug.dropTables",
                  "Tables collection dropped successfully",
                )
              }
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
            <Button
              onClick={() =>
                handleMethodCall(
                  "debug.mockMenuItems",
                  "Mock menu items added successfully",
                )
              }
            >
              Add Mock Menu Items
            </Button>
            <Button
              variant="negative"
              onClick={() =>
                handleMethodCall(
                  "debug.dropMenuItems",
                  "Menu items collection dropped successfully",
                )
              }
            >
              Drop Menu Items
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold flex items-center gap-2">
            <CoffeeIcon fill="currentColor" />
            Menu Item Categories
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                handleMethodCall(
                  "debug.mockItemCategories",
                  "Mock menu item categories added successfully",
                )
              }
            >
              Add Mock Menu Item Categories
            </Button>
            <Button
              variant="negative"
              onClick={() =>
                handleMethodCall(
                  "debug.dropItemCategories",
                  "Menu item categories collection dropped successfully",
                )
              }
            >
              Drop Menu Item Categories
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar size={20} />
            Shifts
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                handleMethodCall(
                  "debug.mockShifts",
                  "Mock shifts added successfully",
                )
              }
            >
              Add Mock Shifts
            </Button>
            <Button
              variant="negative"
              onClick={() =>
                handleMethodCall(
                  "debug.dropShifts",
                  "Shifts collection dropped successfully",
                )
              }
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
            <Button
              onClick={() =>
                handleMethodCall(
                  "debug.mockPosts",
                  "Mock posts added successfully",
                )
              }
            >
              Add Mock Posts
            </Button>
            <Button
              variant="negative"
              onClick={() =>
                handleMethodCall(
                  "debug.dropPosts",
                  "Posts collection dropped successfully",
                )
              }
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
            <Button
              onClick={() =>
                handleMethodCall(
                  "debug.mockComments",
                  "Mock comments added successfully",
                )
              }
            >
              Add Mock Comments
            </Button>
            <Button
              variant="negative"
              onClick={() =>
                handleMethodCall(
                  "debug.dropComments",
                  "Comments collection dropped successfully",
                )
              }
            >
              Drop Comments
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
