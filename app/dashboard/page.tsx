"use client";
import { useAuth } from "@/components/Providers";
import { api } from "@/lib/api";
import Script from "next/script";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/payments/plans");
        setPlans(res.data || []);
      } catch {
        setPlans([]);
      }
    })();
  }, []);

  const startCheckout = async (plan: any) => {
    setLoading(true);
    try {
      const res = await api.post("/api/payments/create-order", { plan_id: plan.id });
      const { order_id, amount, currency, key_id } = res.data;

      // @ts-ignore
      const rzp = new window.Razorpay({
        key: key_id,
        amount,
        currency,
        name: "AIBuddies",
        description: plan.name,
        order_id,
        handler: async (response: any) => {
          await api.post("/api/payments/verify-signature", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          await refreshUser();
          alert("Payment successful!");
        },
        theme: { color: "#377fff" }
      });
      rzp.open();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Payment failed");
    } finally { setLoading(false); }
  };

  const claimAd = async () => {
    try {
      const res = await api.post("/api/users/claim-ad-reward");
      alert(res.data?.message || "Reward claimed");
      await refreshUser();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Failed to claim reward");
    }
  };

  return (
    <div className="grid gap-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="card">
        <h2 className="text-2xl font-semibold">Welcome{user?.fullname ? `, ${user.fullname}` : ""}</h2>
        <p className="mt-2 text-neutral-300">Credits: <span className="font-semibold">{user?.credits ?? 0}</span></p>
        <div className="mt-4 flex gap-3">
          <a className="btn btn-primary" href="/tools/repurpose">Repurpose Text</a>
          <a className="btn btn-outline" href="/tools/image">Generate Image</a>
          <button className="btn btn-outline" onClick={claimAd}>Watch Ad & Claim +3</button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold">Buy credits</h3>
        <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {plans.length === 0 && <p className="text-neutral-400">No plans available yet.</p>}
          {plans.map((p) => (
            <div key={p.id} className="glass p-5 rounded-2xl">
              <div className="text-lg font-semibold">{p.name}</div>
              <div className="text-3xl font-bold mt-2">₹{(p.price_in_paise/100).toFixed(0)}</div>
              <div className="text-sm mt-1 text-neutral-300">{p.credits} credits</div>
              <button disabled={loading} onClick={() => startCheckout(p)} className="btn btn-primary mt-4 w-full">Buy</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
