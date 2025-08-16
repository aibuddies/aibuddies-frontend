"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function CaptionPage() {
  const [image_description, setDesc] = useState("");
  const [out, setOut] = useState<string[]>([]);

  const run = async () => {
    const res = await api.post("/api/tools/generate-caption", { image_description });
    const caps = Array.isArray(res.data?.captions) ? res.data.captions : String(res.data?.captions || "").split("\n");
    setOut(caps.filter(Boolean));
  };

  return (
    <div className="card grid gap-3">
      <h1 className="text-2xl font-semibold">Caption Generator</h1>
      <input className="input" value={image_description} onChange={e=>setDesc(e.target.value)} placeholder="Describe your image" />
      <button className="btn btn-primary" onClick={run}>Generate</button>
      {out.length > 0 && (
        <ul className="list-disc pl-6 mt-2 space-y-1 text-neutral-200">
          {out.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      )}
    </div>
  );
}
