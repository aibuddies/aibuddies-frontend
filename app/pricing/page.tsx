import Link from "next/link";

export default function Pricing() {
  return (
    <div className="card text-center">
      <h1 className="text-3xl font-semibold">Pricing</h1>
      <p className="mt-2 text-neutral-300">Open Dashboard → Buy credits. Plans are pulled from backend.</p>
      <Link href="/dashboard" className="btn btn-primary mt-4">Go to Dashboard</Link>
    </div>
  );
}
