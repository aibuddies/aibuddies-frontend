"use client";
import { useState } from "react";
import { api, setAuthToken } from "@/lib/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);
      const res = await api.post("/api/users/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      const token = res.data.access_token as string;
      Cookies.set("aib_token", token, { expires: 7 });
      setAuthToken(token);
      router.replace("/dashboard");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3">
        <input className="input" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="btn btn-primary" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
      <p className="mt-3 text-sm text-neutral-300">No account? <a className="underline" href="/signup">Sign up</a></p>
    </div>
  );
}
