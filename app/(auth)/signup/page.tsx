"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function SignupPage() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null); setError(null);
    try {
      await api.post("/api/users/signup", { fullname, email, password });
      setMsg("Signup successful. Check your email for verification link.");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3">
        <input className="input" placeholder="Full name" value={fullname} onChange={e=>setFullname(e.target.value)} required />
        <input className="input" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn btn-primary">Sign up</button>
      </form>
      {msg && <p className="mt-3 text-green-400 text-sm">{msg}</p>}
      {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
      <p className="mt-3 text-sm text-neutral-300">Already have an account? <a className="underline" href="/login">Login</a></p>
    </div>
  );
}
