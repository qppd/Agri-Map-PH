"use client";

import { useState } from "react";

export default function SimulateDataPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSimulate() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/simulate-data", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate data");
      const data = await res.json();
      setResult(data.message || "Simulation complete.");
    } catch (e: unknown) {
      let message = "Error occurred";
      if (e && typeof e === "object" && "message" in e && typeof (e as any).message === "string") {
        message = (e as { message: string }).message;
      }
      setResult(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Simulate Test Data</h1>
      <p className="mb-6 text-gray-600">Generate 100 random price entries and save to Firebase for testing.</p>
      <button
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleSimulate}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Test Data"}
      </button>
      {result && <div className="mt-4 text-sm text-gray-700">{result}</div>}
    </div>
  );
}
