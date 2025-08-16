"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setErr(null);
    setImages([]);
    try {
      const res = await api.post("/api/tools/generate-image", { prompt });
      setImages(res.data?.images || []);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed");
    }
  };

  return (
    <div className="grid gap-4">
      <div className="card grid gap-3">
        <h1 className="text-2xl font-semibold">Image Generator</h1>
        <input
          className="input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image"
        />
        <button className="btn btn-primary" onClick={run}>
          Generate
        </button>
        {err && <p className="text-red-400 text-sm">{err}</p>}
      </div>

      {images.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((b64, i) => (
            <img
              key={i}
              className="rounded-xl border border-white/10"
              src={`data:image/png;base64,${b64}`}
              alt={`gen-${i}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
