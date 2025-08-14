import React from "react";
import api from "../api";

const plans = [
  { id: "small", credits: 50, price: 39 },
  { id: "medium", credits: 150, price: 99 },
  { id: "large", credits: 400, price: 199 }
];

export default function BuyCreditsPage() {

  const loadRazorpay = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuy = async (plan) => {
    const res = await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Failed to load Razorpay SDK. Please check your internet.");
      return;
    }

    try {
      // 1. Create order from backend (pass plan name)
      const { data } = await api.post(`/buy-credits/create-order?plan=${plan.id}`);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // from frontend .env
        amount: data.amount,
        currency: "INR",
        name: "AI Buddies",
        description: `${plan.credits} Credits`,
        order_id: data.id,
        handler: async function (response) {
          // 2. Verify payment with backend
          await api.post("/buy-credits/verify-payment", {
            ...response,
            plan: plan.id
          });
          alert("✅ Payment successful! Credits added.");
        },
        prefill: {
          name: "AI Buddies User",
          email: "user@example.com",
        },
        theme: {
          color: "#3399cc"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      alert("Error creating Razorpay order.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Buy Credits</h2>
      <div style={{ display: "flex", gap: "20px" }}>
        {plans.map((plan, index) => (
          <div key={index} style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px"
          }}>
            <h3>{plan.credits} Credits</h3>
            <p>₹{plan.price}</p>
            <button onClick={() => handleBuy(plan)}>Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}
