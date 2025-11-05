import React from "react";

type CartItemProps = {
  name: string;
  price: number;
  quantity: number;
  onRemove?: () => void;
};

export default function CartItem({ name, price, quantity, onRemove }: CartItemProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #ccc",
        padding: "10px 0",
      }}
    >
      <div>
        <strong>{name}</strong>
        <p style={{ margin: "5px 0", fontSize: "14px", color: "#555" }}>
          ${price.toFixed(2)} × {quantity}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <p style={{ fontWeight: "bold" }}>${(price * quantity).toFixed(2)}</p>
        {onRemove && (
          <button
            onClick={onRemove}
            style={{
              background: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            
          </button>
        )}
      </div>
    </div>
  );
}