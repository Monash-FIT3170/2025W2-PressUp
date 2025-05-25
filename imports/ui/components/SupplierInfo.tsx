import React, { useState } from "react";
import { Supplier } from "/imports/api/suppliers/SuppliersCollection";

interface Order {
  no: number;
  date: string;
  goods: string;
  quantity: number;
  totalCost: number;
}

interface SupplierInfoProps {
  supplier: Supplier;
  isExpanded: boolean;
  onToggle: () => void;
}

export const SupplierInfo = ({ supplier, isExpanded }: SupplierInfoProps) => {
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc'>('date-desc');
  
  
  if (!supplier) return null;
  if (!supplier.name) return null;
  if (!supplier.email) return null;
  if (!supplier.phone) return null;
  if (!supplier.goods) supplier.goods = [];
  if (!supplier.address) supplier.address = "";
  if (!supplier.website) supplier.website = "";

  // Note: Mock data for orders for Sprint 3 UI ONLY. 
  // In sem 2, connect Data from Database, OrdersCollection..
  const orderHistory: Order[] = [
    {
      no: 135,
      date: "06/04/2025",
      goods: "Coffee Beans- 1KG",
      quantity: 20,
      totalCost: 300.00
    },
    {
      no: 134,
      date: "06/03/2025",
      goods: "Coffee Beans- 1KG",
      quantity: 20,
      totalCost: 300.00
    },
    {
      no: 133,
      date: "06/02/2025",
      goods: "Coffee Beans- 1KG",
      quantity: 20,
      totalCost: 300.00
    }
  ];

  const sortedOrders = [...orderHistory].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortBy === 'date-desc' ? dateB - dateA : dateA - dateB;
  });

  if (!isExpanded) return null;

  return (
    <div className="bg-gray-100 p-6 mx-4 mb-4 rounded-lg border">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2">
          {supplier.name}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">
            Contact
          </h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-600">Email:</span>
              <a 
                href={`mailto:${supplier.email}`}
                className="ml-2 text-blue-600 hover:underline"
              >
                {supplier.email}
              </a>
            </div>
            <div>
              <span className="font-medium text-gray-600">Phone:</span>
              <span className="ml-2 text-gray-800">{supplier.phone}</span>
            </div>
            <div>
              {supplier.website && (
                <div className="mb-2">
                  <span className="font-medium text-gray-600">Website:</span>
                  <a 
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    {supplier.website}
                  </a>
                </div>
              )}
              {supplier.address && (
                <div>
                  <span className="font-medium text-gray-600">Address:</span>
                  <div className="ml-2 text-gray-800">
                    {supplier.address}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Supplier Goods */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2 underline">
            Supplier Goods
          </h3>
          <ul className="space-y-1">
            {supplier.goods && supplier.goods.map((good, index) => (
              <li key={index} className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                <span className="text-gray-800">{good}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Order History */}
        <div className="bg-white p-4 rounded-lg shadow-sm lg:col-span-1">
          <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
            <h3 className="text-lg font-semibold text-gray-700 underline">
              Order History
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date-desc' | 'date-asc')}
                className="text-sm text-blue-600 bg-transparent border-none cursor-pointer"
              >
                <option value="date-desc">Date (Descending)</option>
                <option value="date-asc">Date (Ascending)</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 font-medium text-white rounded-l" style={{backgroundColor: '#6f597b'}}>No.</th>
                  <th className="text-left p-2 font-medium text-white" style={{backgroundColor: '#6f597b'}}>Date</th>
                  <th className="text-left p-2 font-medium text-white" style={{backgroundColor: '#6f597b'}}>Goods</th>
                  <th className="text-left p-2 font-medium text-white" style={{backgroundColor: '#6f597b'}}>Quantity</th>
                  <th className="text-left p-2 font-medium text-white rounded-r" style={{backgroundColor: '#6f597b'}}>
                    Total Cost <span className="text-xs">(Inc GST)</span>
                  </th>
                  <th className="text-left p-2 font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="p-2 text-gray-800">{order.no}</td>
                    <td className="p-2 text-gray-800">{order.date}</td>
                    <td className="p-2 text-gray-800">{order.goods}</td>
                    <td className="p-2 text-gray-800">{order.quantity}</td>
                    <td className="p-2 text-gray-800">${order.totalCost.toFixed(2)}</td>
                    <td className="p-2">
                      <button 
                        className="text-white text-xs px-3 py-1 rounded transition-colors"
                        style={{ 
                          backgroundColor: '#6f597b'
                        }}>
                        Repurchase
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};