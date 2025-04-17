import { Pill } from "../../components/Pill";
import { StockItem } from "/imports/api/stock_item";

export const StockPage = () => {
  // TODO: Get from API here
  const stockItems: StockItem[] = [
    {
      _id: "1",
      name: "Coffee Beans",
      quantity: 10,
      location: "Room 1",
      supplier: "Supplier 1",
      createdAt: new Date(),
    },
    {
      _id: "2",
      name: "Small Takeaway Cups",
      quantity: 600,
      location: "Room 2",
      supplier: "Supplier 1",
      createdAt: new Date(),
    },
    {
      _id: "3",
      name: "Almond Milk",
      quantity: 0,
      location: "Room 1",
      supplier: "Supplier 2",
      createdAt: new Date(),
    },
  ];

  // TODO: Make this dynamic based on user choice
  const lowInStockThreshold = 10;

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Quantity</th>
            <th>Stock Room</th>
            <th>Status</th>
            <th>Supplier</th>
          </tr>
        </thead>
        <tbody>
          {stockItems.map((item, i) => {
            const statusPill =
              item.quantity == 0 ? (
                <Pill colour="bg-red-50">Out of Stock</Pill>
              ) : item.quantity <= lowInStockThreshold ? (
                <Pill colour="bg-blue-50">Low in Stock</Pill>
              ) : (
                <Pill colour="bg-green-50">In Stock</Pill>
              );

            return (
              <tr key={i}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.location}</td>
                <td>{statusPill}</td>
                <td>{item.supplier}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};
