"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function RepurposePage() {
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState("Twitter");
  const [out, setOut] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setErr(null); setOut(null);
    try {
      const res = await api.post("/api/tools/repurpose-text", { text, platform });
      setOut(res.data?.repurposed_text || "");
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed");
    }
  };

  return (
    <div className="grid gap-4">
      <div className="card">
        <h1 className="text-2xl font-semibold">Repurpose Text</h1>
        <textarea className="input h-40" value={text} onChange={e=>setText(e.target.value)} placeholder="Paste your content (>= 50 chars)" />
        <div className="flex gap-2 mt-2">
          <select className="input max-w-xs" value={platform} onChange={e=>setPlatform(e.target.value)}>
            <option>Twitter</option>
            <option>LinkedIn</option>
            <option>Instagram</option>
            <option>YouTube</option>
          </select>
          <button className="btn btn-primary" onClick={run}>Repurpose</button>
        </div>
        {err && <p className="text-red-400 mt-2 text-sm">{err}</p>}
      </div>

      {out && (
        <div className="card">
          <h2 className="text-xl font-semibold">Result</h2>
          <pre className="whitespace-pre-wrap mt-2 text-neutral-200">{out}</pre>
        </div>
      )}
    </div>
  );
}
