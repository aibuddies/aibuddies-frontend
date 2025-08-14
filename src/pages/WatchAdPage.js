import React, { useState, useEffect } from "react";
import api from "../api";

export default function WatchAdPage() {
  const [creditsAdded, setCreditsAdded] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    // Load Adsterra script dynamically
    const script = document.createElement("script");
    script.src = "//pl27262292.profitableratecpm.com/2d/65/1c/2d651c0a67c987dd8fed23aa1691255b.js";
    script.async = true;
    document.body.appendChild(script);

    // Start countdown timer
    const countdown = setInterval(() => {
      setTimer((t) => {
        if (t > 0) return t - 1;
        clearInterval(countdown);
        return 0;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const claimCredits = async () => {
    try {
      await api.post("/credits/earn-credits"); // matches backend prefix + route
      setCreditsAdded(true);
    } catch (error) {
      alert("Failed to add credits. Please try again later.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Watch Ad & Earn 3 Credits</h2>

      {timer > 0 ? (
        <p>⏳ Please wait {timer} seconds...</p>
      ) : (
        <button onClick={claimCredits} disabled={creditsAdded}>
          {creditsAdded ? "✅ Credits Added!" : "Claim 3 Credits"}
        </button>
      )}
    </div>
  );
}
