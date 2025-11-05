import React from "react";

type Props = {
  subtotal: number;
  taxRate: number; // e.g. 0.065 for 6.5%
};

export default function OrderSummary({ subtotal, taxRate }: Props) {
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
        border: "1px solid #333",
      }}
    >
      <h2
        style={{
          color: "#f7df05ff",
          margin: "0 0 16px",
          fontSize: "18px",
        }}
      >
        Order Summary
      </h2>

      <div style={{ display: "grid", gap: "10px" }}>
        <Row label="Subtotal" value={subtotal} />
        <Row label={`Tax (${(taxRate * 100).toFixed(2)}%)`} value={tax} />
        <Divider />
        <Row label="Total" value={total} emphasize />
      </div>

      {/*<p
        style={{
          marginTop: "14px",
          color: "#9e9e9e",
          fontSize: "12px",
        }}
      >
        * Taxes are estimates and will be finalized at payment.
      </p>*/}
    </div>
  );
}

function Row({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: number;
  emphasize?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        color: emphasize ? "#03b320ff" : "#ffffff",
        fontWeight: emphasize ? 700 : 500,
        fontSize: emphasize ? "18px" : "16px",
      }}
    >
      <span>{label}</span>
      <span>${value.toFixed(2)}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#333", margin: "6px 0 8px" }} />;
}