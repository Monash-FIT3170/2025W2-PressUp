import { Meteor } from "meteor/meteor";
import { OrdersCollection } from "./OrdersCollection";
import { Mongo } from "meteor/mongo";
import { requireLoginMethod } from "../accounts/wrappers";

Meteor.methods({
  "orders.updateOrder": requireLoginMethod(async function (orderId: string, update: Partial<any>) {
    if (!orderId || !update) throw new Meteor.Error("invalid-arguments", "Order ID and update are required");
    await OrdersCollection.updateAsync(orderId, { $set: update });
  }),

  "orders.addOrder": requireLoginMethod(async function (order: any) {
    if (!order) throw new Meteor.Error("invalid-arguments", "Order data is required");
    return await OrdersCollection.insertAsync(order);
  }),

  "finance.getFinanceData": requireLoginMethod(async function () {
    // Aggregation pipeline to calculate total revenue
    const totalRevenueResult = await OrdersCollection.rawCollection().aggregate([
      { $match: { paid: true } },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: { $ifNull: ["$discountedPrice", "$totalPrice"] }
            }
            }
        }
    ]).toArray();

    // Extract the total revenue from the result
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;

    // Mock data
    const totalExpenses = 1000;


    // Return the complete financial data object
    return {
      revenue: {
        title: "Revenue",
        description: "Total revenue from all paid orders.",
        items: [
          { label: "Food", amount: 1000 },
          { label: "Drinks", amount: 1000}
        ],
        total: totalRevenue
      },
      expenses: {
        title: "Expenses",
        description: "Summary of estimated expenses.",
        items: [
          { label: "Food", amount: 1000 },
          { label: "Drinks", amount: 1000}
        ],
        total: totalExpenses
      },
      netProfitLoss: {
        title: "Financial Overview",
        description: "Summary of key financial metrics.",
        items: [
          { label: "Total Revenue", amount: totalRevenue },
          { label: "Total Expenses", amount: totalExpenses },
          { label: "Gross Profit", amount: -500}
        ],
        }
    };
  })
});
