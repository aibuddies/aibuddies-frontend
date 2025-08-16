"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function PromptPage() {
  const [topic, setTopic] = useState("");
  const [out, setOut] = useState<string | null>(null);

  const run = async () => {
    const res = await api.post("/api/tools/generate-prompt", { topic });
    setOut(res.data?.generated_prompt || "");
  };

  return (
    <div className="card grid gap-3">
      <h1 className="text-2xl font-semibold">Prompt Generator</h1>
      <input className="input" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Topic" />
      <button className="btn btn-primary" onClick={run}>Generate</button>
      {out && <pre className="whitespace-pre-wrap mt-2">{out}</pre>}
    </div>
  );
}
