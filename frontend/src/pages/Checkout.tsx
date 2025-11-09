import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ShopListUI/continueShopping";
import OrderSummary from "../components/CheckoutUI/OrderSummary";



type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

const TAX_RATE = 0.065; // Temp rate

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  // Temporary sample data
  useEffect(() => {
    const sampleCart: CartItem[] = [
      { id: 1, name: "Apples", price: 1.99, quantity: 3 },
      { id: 2, name: "Bread", price: 2.49, quantity: 1 },
      { id: 3, name: "Milk", price: 3.29, quantity: 2 },
      { id: 4, name: "Headphones", price: 1.99, quantity: 3 },
      { id: 5, name: "TV", price: 300.0, quantity: 1 },
      { id: 6, name: "Mouse", price: 20.0, quantity: 2 },
      { id: 7, name: "Car", price: 20000.0, quantity: 1 },
      { id: 8, name: "House", price: 40.0, quantity: 1 },
      { id: 9, name: "Fan", price: 1.99, quantity: 3 },
    ];
    setCartItems(sampleCart);
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = () => {
    // TODO: Replace with your order submission (API call)
    alert("Order placed! (stub)");
    navigate("/");
  };

  return (
    <div
      style={{
        backgroundColor: "#000000ff",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Top-right buttons (matches your ShoppingList style) */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "20px 40px",
          borderTop: "1px solid #000000ff",
          gap: "12px",
        }}
      >
        <Button
          onClick={() => navigate("/")}
          style={{
            backgroundColor: "#f7df05ff",
            color: "#000000ff",
            fontWeight: 600,
            borderRadius: "8px",
            padding: "10px 24px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#03b320ff")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f7df05ff")}
        >
          Continue Shopping
        </Button>
      </div>

      {/* Sticky bottom */}
      <div
        style={{
          position: "fixed",
          right: "24px",
          bottom: "24px",
          zIndex: 1000,
        }}
      >
        <Button
          onClick={handlePlaceOrder}
          style={{
            backgroundColor: "#f7df05ff",
            color: "#000000ff",
            fontWeight: 600,
            borderRadius: "8px",
            padding: "10px 24px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#03b320ff")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f7df05ff")}
        >
          Place Order
        </Button>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "20px",
        }}
      >
        <h1
          style={{
            textAlign: "left",
            marginBottom: "10px",
            color: "#ffffff",
          }}
        >
          Checkout
        </h1>

        {/* Items list */}
        <div
          style={{
            backgroundColor: "#121212",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <h2
            style={{
              color: "#f7df05ff",
              fontSize: "18px",
              margin: "0 0 12px",
              textAlign: "left",
            }}
          >
            Items
          </h2>
          {cartItems.length === 0 ? (
            <p style={{ 
                textAlign: "center", 
                color: "#ffffff"
             }}
            >Your cart is empty.</p>
          ) : (

            <ul style={{ listStyleType: "none", padding: 0, margin: 0, color: "#f7df05ff" }}>
              {cartItems.map((item, index) => (
                <li
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #333",
                    padding: "12px 10px",
                    backgroundColor: index % 2 === 0 ? "#1d1d1dff" : "#464646ff",
                    borderRadius: "6px",
                    position: "relative",
                  }}
                >
                  <div>
                    <strong>{item.name}</strong>
                    <p style={{ 
                        margin: "5px 0", 
                        fontSize: "14px", 
                        color: "#ffffff" 
                        }}
                        >${item.price.toFixed(2)} × {item.quantity}
                      
                    </p>
                  </div>

                  <div style={{ 
                    fontWeight: "bold", 
                    color: "#03b320ff" 
                    }}
                    >${(item.price * item.quantity).toFixed(2)}
                    
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Order summary box */}
        <OrderSummary subtotal={subtotal} taxRate={TAX_RATE} />
      </div>
    </div>
  );
}