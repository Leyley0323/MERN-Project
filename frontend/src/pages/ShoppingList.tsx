import React, { useState, useEffect } from "react";

// Define a simple type for your products
type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export default function CartListPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Temporary sample data (you’ll replace this with data from your database/API)
  useEffect(() => {
    const sampleCart: CartItem[] = [
      { id: 1, name: "Apples", price: 1.99, quantity: 3 },
      { id: 2, name: "Bread", price: 2.49, quantity: 1 },
      { id: 3, name: "Milk", price: 3.29, quantity: 2 },
    ];
    setCartItems(sampleCart);
  }, []);

  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>🛒 Your Cart</h1>

      {cartItems.length === 0 ? (
        <p style={{ textAlign: "center" }}>Your cart is empty.</p>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {cartItems.map((item) => (
            <li
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #ccc",
                padding: "10px 0",
              }}
            >
              <div>
                <strong>{item.name}</strong>
                <p style={{ margin: "5px 0", fontSize: "14px", color: "#555" }}>
                  ${item.price.toFixed(2)} × {item.quantity}
                </p>
                </div>
                <div style={{ fontWeight: "bold" }}>
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3 style={{ textAlign: "right", marginTop: "20px" }}>
        Total: ${total.toFixed(2)}
      </h3>
    </div>
  );
}