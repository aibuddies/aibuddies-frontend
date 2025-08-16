"use client";
import { useAuth } from "@/components/Providers";
import { api } from "@/lib/api";
import Script from "next/script";
import { useEffect, useState } from "react";

type Plan = {
  id: string;
  name: string;
  credits: number;
  price_in_paise: number; // integer paise
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/payments/plans");
        setPlans(Array.isArray(res.data) ? res.data : []);
      } catch {
        setPlans([]);
      }
    })();
  }, []);

  const startCheckout = async (plan: Plan) => {
    setLoading(true);
    try {
      const res = await api.post("/api/payments/create-order", { plan_id: plan.id });
      const { order_id, amount, currency, key_id } = res.data;

      const options = {
        key: key_id,
        amount,
        currency,
        name: "AIBuddies",
        description: `${plan.credits} credits`,
        order_id,
        handler: async function (response: any) {
          try {
            await api.post("/api/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await refreshUser();
            alert("Payment successful!");
          } catch (e: any) {
            alert(e?.response?.data?.detail || "Verification failed");
          }
        },
        theme: { color: "#377fff" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="grid gap-6">
        <div className="glass p-6">
          <div className="text-xl font-semibold">Welcome{user?.fullname ? `, ${user.fullname}` : ""}!</div>
          <div className="text-neutral-300 mt-1">Credits: {user?.credits ?? 0}</div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Buy credits</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {plans.length === 0 && <p className="text-neutral-400">No plans available yet.</p>}
            {plans.map((p) => (
              <div key={p.id} className="glass p-5 rounded-2xl">
                <div className="text-lg font-semibold">{p.name}</div>
                <div className="text-3xl font-bold mt-2">₹{(p.price_in_paise / 100).toFixed(0)}</div>
                <div className="text-sm mt-1 text-neutral-300">{p.credits} credits</div>
                <button disabled={loading} onClick={() => startCheckout(p)} className="btn btn-primary mt-4 w-full">
                  Buy
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
