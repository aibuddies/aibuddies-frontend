"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/users/verify-email/${token}`);
        setStatus(res.data?.message || "Email verified. Redirecting to login...");
        setTimeout(() => router.replace("/login"), 1500);
      } catch (e: any) {
        setStatus(e?.response?.data?.detail || "Verification failed");
      }
    })();
  }, [token, router]);

  return <div className="max-w-md mx-auto card text-center text-neutral-200">{status}</div>;
}
