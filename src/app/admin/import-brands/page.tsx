"use client";

import { useState } from "react";
import { request } from "@/lib/api";

const oldBrands = [
  { name: "Okla", logo: "/okla.png" },
  { name: "Evee", logo: "/evee.png" },
  { name: "Metro", logo: "/metro.png" },
  { name: "Yadea", logo: "/yadea.png" },
  { name: "Luyuan", logo: "/luyuan.png" },
  { name: "Revoo", logo: "/revoo.png" },
  { name: "Orevo", logo: "/orevo.png" },
  { name: "Jolta", logo: "/jolta.png" },
  { name: "United", logo: "/united.png" },
  { name: "Crown CMC", logo: "/crown.png" },
  { name: "Road King", logo: "/roadking.png" },
  { name: "EVINN", logo: "/evinn.png" },
  { name: "Horwin", logo: "/horwin.png" },
  { name: "Velectra", logo: "/velectra.png" },
  { name: "ECruze", logo: "/ecruze.png" },
  { name: "Eveon", logo: "/eveon.png" },
  { name: "Jinpeng", logo: "/jinpeng.png" },
  { name: "Hi Speed", logo: "/hispeed.png" },
];

export default function ImportBrandsPage() {
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const addLine = (line: string) => setLog((prev) => [...prev, line]);

  const run = async () => {
    setRunning(true);
    setLog([]);

    for (const brand of oldBrands) {
      try {
        const res = await fetch(brand.logo);

        if (!res.ok) throw new Error("logo file not found in public folder");

        const blob = await res.blob();
        const ext = brand.logo.split(".").pop();
        const file = new File([blob], `${brand.name}.${ext}`, {
          type: blob.type,
        });

        const fd = new FormData();
        fd.append("displayName", brand.name);
        fd.append("logo", file);

        await request("/brands", { method: "POST", body: fd });

        addLine(`${brand.name}: added`);
      } catch (err) {
        addLine(
          `${brand.name}: ${err instanceof Error ? err.message : "failed"}`
        );
      }
    }

    addLine("Done.");
    setRunning(false);
  };

  return (
    <div style={{ padding: 32, color: "#111", background: "#fff", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Import old brands</h1>

      <p style={{ margin: "8px 0 16px" }}>
        Uploads the {oldBrands.length} brands (with their logos) to the backend.
        Login as admin first.
      </p>

      <button
        onClick={run}
        disabled={running}
        style={{
          padding: "10px 18px",
          background: "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        {running ? "Importing..." : "Start import"}
      </button>

      <ul style={{ marginTop: 20, lineHeight: 1.8 }}>
        {log.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </div>
  );
}