import React from "react";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;  // Changed from string to number
  price: string;
}

interface OrderComponentProps {
  order: {
    items: OrderItem[];
    totalAmount: string;
  };
}

export function OrderComponent({ order }: OrderComponentProps) {
  return (
    <div className="order">
      <h2>Your Order</h2>
      {order.items.map((item) => (
        <div key={item.id} className="order-item">
          <span>{item.name} x{item.quantity}</span>
          <span>{item.price}</span>
        </div>
      ))}
      <div className="order-total">
        <strong>Total: {order.totalAmount}</strong>
      </div>
    </div>
  );
}
