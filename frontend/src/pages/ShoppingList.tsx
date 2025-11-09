import { useState, useEffect } from "react";
import {Button} from '../components/ShopListUI/continueShopping';
import { useNavigate } from "react-router-dom";


type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export default function CartListPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();
  const handleDelete = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  
  // Temporary sample data 
  useEffect(() => {
    const sampleCart: CartItem[] = [
      { id: 1, name: "Apples", price: 1.99, quantity: 3 },
      { id: 2, name: "Bread", price: 2.49, quantity: 1 },
      { id: 3, name: "Milk", price: 3.29, quantity: 2 },
      { id: 4, name: "Headphones", price: 1.99, quantity: 3 },
      { id: 5, name: "TV", price: 300.00, quantity: 1 },
      { id: 6, name: "Mouse", price: 20.00, quantity: 2 },
      { id: 7, name: "Car", price: 20000.00, quantity: 1 },
      { id: 8, name: "House", price: 40.00, quantity: 1 },
      { id: 9, name: "Fan", price: 1.99, quantity: 3 },
    ];
    setCartItems(sampleCart);
  }, []);

  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);


  return (
    
    <div style={{
      backgroundColor: "#000000ff", 
      minHeight: "100vh",        
      margin: 0,
      padding: 0,
      }}>
      
        {/*Buttons*/}
        <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "20px 40px",
          borderTop: "1px solid #ddd",
          gap: "12px",
          position: "relative",
          zIndex: 1,
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
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#03b320ff")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#f7df05ff")
          }
        >
          Continue Shopping
        </Button>
      </div>


      <div
        style={{
          position: "fixed",
          right: "24px",
          bottom: "24px",
          zIndex: 9999, 
        }}
      >
        <Button
          onClick={() => navigate("/checkout")}
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
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#03b320ff")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#f7df05ff")
          }
        >
          Checkout
        </Button>
      </div>
    {/*-------------------------------------------------------------------------------------*/}

      <div style={{ 
         maxWidth: "600px",
         margin: "40px auto", 
         padding: "20px" 
         }}
        >
        <h1 style={{ 
          textAlign: "center", 
          marginBottom: "20px",
          color: "#ffffff",
        }}
        > Your Cart</h1>

      {cartItems.length === 0 ? (
        <p style={{ 
          textAlign: "center",
          color: "#ffffff" }}
        >
          Your cart is empty.
          </p> 
      ) : (
        <ul style={{ 
          listStyleType: "none", 
          padding: 0, 
          color: "#f7df05ff" 
          }}
        >
          {/*display each cart item*/}
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
                <p
                  style={{
                    margin: "5px 0",
                    fontSize: "14px",
                    color: "#ffffff",
                  }}
                >
                  ${item.price.toFixed(2)} × {item.quantity}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#03b320ff",
                  }}
                >
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

                {/* Delete X icon */}
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%", 
                    backgroundColor: "#f7df05ff", 
                    color: "#000000ff", 
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "bold",
                    lineHeight: "1.5", 
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease-in-out",                    
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ff3333"; // red hover
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f7df05ff";
                    e.currentTarget.style.color = "#000000ff";
                  }}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3 style={{ 
        textAlign: "right", 
        marginTop: "20px", 
        color: "#03b320ff",
        }}
        >
        Total: ${total.toFixed(2)}
      </h3>
      </div>
    </div>
  );
}