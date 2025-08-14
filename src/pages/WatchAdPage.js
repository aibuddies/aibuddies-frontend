// src/pages/WatchAdPage.js
import React, { useState, useEffect } from "react";
import api from "../api";

export default function WatchAdPage() {
  const [creditsAdded, setCreditsAdded] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
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
      await api.post("/ads/claim-credits");
      setCreditsAdded(true);
    } catch (error) {
      alert("Failed to add credits. Please try again later.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Watch Ad & Earn 3 Credits</h2>

      {/* Adsterra script */}
      <div style={{ marginBottom: "20px" }}>
        <script
          type="text/javascript"
          src="//pl27262292.profitableratecpm.com/2d/65/1c/2d651c0a67c987dd8fed23aa1691255b.js"
        ></script>
      </div>

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
